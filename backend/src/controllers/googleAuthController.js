const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');
const prisma = require('../db');
const { formatUserForClient } = require('../utils/authPayload');

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) throw new Error('[googleAuth] JWT_SECRET environment variable is required');
const ADMIN_EMAIL = 'admin@chadanicosmetic.com';

function getGoogleConfig() {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const redirectUri = process.env.GOOGLE_CALLBACK_URL;
  if (!clientId || !clientSecret || !redirectUri) {
    return null;
  }
  return { clientId, clientSecret, redirectUri };
}

function getOAuth2Client() {
  const config = getGoogleConfig();
  if (!config) return null;
  return new OAuth2Client(config.clientId, config.clientSecret, config.redirectUri);
}

function getFrontendUrl() {
  const url = process.env.FRONTEND_URL || process.env.CLIENT_URL || 'http://localhost:3000';
  // Strip trailing slash to avoid double-slash in redirect URLs
  return url.replace(/\/$/, '');
}

function redirectWithError(res, code, message) {
  const params = new URLSearchParams({
    error: code,
    message: message || 'Google sign-in failed.',
  });
  res.redirect(`${getFrontendUrl()}/auth/google/callback?${params}`);
}

const startGoogleAuth = (req, res) => {
  const oauth2Client = getOAuth2Client();
  if (!oauth2Client) {
    return res.status(503).json({ error: 'Google sign-in is not configured on the server.' });
  }

  const redirectAfter =
    typeof req.query.redirect === 'string' && req.query.redirect.startsWith('/')
      ? req.query.redirect
      : '/';

  const state = jwt.sign(
    { redirect: redirectAfter, nonce: crypto.randomBytes(16).toString('hex') },
    JWT_SECRET,
    { expiresIn: '15m' }
  );

  const authUrl = oauth2Client.generateAuthUrl({
    access_type: 'online',
    prompt: 'select_account',
    scope: ['openid', 'email', 'profile'],
    state,
  });

  res.redirect(authUrl);
};

async function findOrCreateFromGoogle(profile) {
  const email = (profile.email || '').trim().toLowerCase();
  const googleId = profile.sub;
  const name = profile.name || profile.given_name || email.split('@')[0];
  const profileImage = profile.picture || null;

  if (!email || !googleId) {
    throw new Error('Google did not return required profile information.');
  }

  let user = await prisma.user.findFirst({
    where: { OR: [{ googleId }, { email }] },
  });

  if (user) {
    return prisma.user.update({
      where: { id: user.id },
      data: {
        googleId: user.googleId || googleId,
        // Only use Google's picture if user has no custom uploaded photo
        profileImage: user.profileImage || profileImage || null,
        isVerified: true,
        name: user.name || name,
      },
    });
  }

  if (email === ADMIN_EMAIL) {
    const err = new Error('Admin account must be created by the store. Use email and password to sign in.');
    err.code = 'ADMIN_RESERVED';
    throw err;
  }

  const randomPassword = await bcrypt.hash(crypto.randomBytes(32).toString('hex'), 10);

  return prisma.user.create({
    data: {
      name,
      email,
      password: randomPassword,
      googleId,
      profileImage,
      role: 'customer',
      isVerified: true,
    },
  });
}

const googleCallback = async (req, res) => {
  try {
    if (req.query.error) {
      return redirectWithError(
        res,
        'google_denied',
        req.query.error_description || 'Sign in was cancelled.'
      );
    }

    const { code, state } = req.query;
    if (!code || !state) {
      return redirectWithError(res, 'invalid_request', 'Missing authorization code.');
    }

    let statePayload;
    try {
      statePayload = jwt.verify(state, JWT_SECRET);
    } catch {
      return redirectWithError(res, 'invalid_state', 'Session expired. Please try again.');
    }

    const oauth2Client = getOAuth2Client();
    if (!oauth2Client) {
      return redirectWithError(res, 'not_configured', 'Google sign-in is not configured.');
    }

    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);

    const ticket = await oauth2Client.verifyIdToken({
      idToken: tokens.id_token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const user = await findOrCreateFromGoogle(ticket.getPayload());
    const token = jwt.sign({ userId: user.id, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
    const userPayload = formatUserForClient(user);

    const params = new URLSearchParams({
      token,
      user: Buffer.from(JSON.stringify(userPayload)).toString('base64url'),
      redirect: statePayload.redirect || '/',
    });

    const redirectUrl = `${getFrontendUrl()}/auth/google/callback?${params}`;
    console.log('[Google OAuth] Redirecting to:', redirectUrl.split('?')[0]);
    res.redirect(redirectUrl);
  } catch (err) {
    console.error('Google OAuth callback error:', err);
    if (err.code === 'ADMIN_RESERVED') {
      return redirectWithError(res, 'admin_reserved', err.message);
    }
    redirectWithError(res, 'server_error', 'Could not complete Google sign-in.');
  }
};

module.exports = { startGoogleAuth, googleCallback };
