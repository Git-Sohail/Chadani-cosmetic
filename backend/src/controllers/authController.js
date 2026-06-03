const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const prisma = require('../db');
const { sendWelcomeEmail } = require('../utils/email');
const {
  createAndSendOtp,
  verifyUserOtp,
  checkResendRateLimit,
} = require('../utils/otpService');
const { formatUserForClient } = require('../utils/authPayload');
const { upload, storeImage } = require('../utils/imageStorage');

const JWT_SECRET = process.env.JWT_SECRET || 'cosmetics_and_bangles_secret_key_123456';

const register = async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email, and password are required.' });
    }

    const normalizedEmail = email.trim().toLowerCase();

    if (normalizedEmail === 'admin@chadanicosmetic.com') {
      return res.status(400).json({
        error: 'This email is reserved for the store administrator. Please sign in instead.',
      });
    }

    const existingUser = await prisma.user.findUnique({ where: { email: normalizedEmail } });
    if (existingUser) {
      return res.status(400).json({ error: 'Email already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.$transaction(async (tx) => {
      const created = await tx.user.create({
        data: {
          name: name.trim(),
          email: normalizedEmail,
          password: hashedPassword,
          phone: phone || null,
          role: 'customer',
          isVerified: false,
        },
      });

      const otp = crypto.randomInt(100000, 999999).toString();
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

      await tx.otp.deleteMany({ where: { userId: created.id } });
      await tx.otp.create({
        data: { userId: created.id, otp, expiresAt },
      });

      return { user: created, otp };
    });

    const { sendOtpEmail } = require('../utils/email');
    const emailResult = await sendOtpEmail(user.user.email, user.user.name, String(user.otp));

    if (!emailResult.success && !emailResult.fallback) {
      await prisma.user.delete({ where: { id: user.user.id } }).catch(() => {});
      return res.status(500).json({
        error:
          emailResult.error ||
          'Could not send verification email. Check SMTP settings or try again later.',
      });
    }

    if (emailResult.fallback) {
      console.log(
        `[OTP] Verification code for ${user.user.email}: ${user.otp} (valid 10 minutes)`
      );
    }

    res.status(201).json({
      message: 'Verification code has been sent to your email.',
      email: user.user.email,
      ...(emailResult.fallback && {
        devNote: 'SMTP unavailable — check the backend terminal for the OTP code.',
      }),
    });
  } catch (error) {
    console.error('Register error:', error);
    if (error.code === 'P2002') {
      return res.status(400).json({ error: 'Email already exists' });
    }
    res.status(500).json({
      error: error.message || 'Server error during registration.',
    });
  }
};

const verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ error: 'Email and OTP are required.' });
    }

    const result = await verifyUserOtp(email.trim().toLowerCase(), String(otp).trim());

    if (!result.ok) {
      return res.status(result.status).json({ error: result.error });
    }

    await sendWelcomeEmail(result.user.email, result.user.name).catch(() => {});

    res.status(200).json({
      message: 'Email verified successfully. Please sign in.',
      user: {
        id: result.user.id,
        email: result.user.email,
        isVerified: true,
      },
    });
  } catch (error) {
    console.error('Verify OTP error:', error);
    res.status(500).json({ error: 'Server error during verification.' });
  }
};

const resendOtp = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email is required.' });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const user = await prisma.user.findUnique({ where: { email: normalizedEmail } });

    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }

    if (user.isVerified) {
      return res.status(400).json({ error: 'Email is already verified.' });
    }

    const rateCheck = await checkResendRateLimit(user.id);
    if (!rateCheck.allowed) {
      return res.status(429).json({ error: rateCheck.error });
    }

    await createAndSendOtp(user);

    res.status(200).json({
      message: 'Verification code has been sent to your email.',
    });
  } catch (error) {
    console.error('Resend OTP error:', error);
    res.status(500).json({
      error: error.message || 'Server error resending OTP.',
    });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const user = await prisma.user.findUnique({ where: { email: normalizedEmail } });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: 'Invalid password' });
    }

    // Customers must verify email; admin account (seeded) signs in without OTP
    if (user.role !== 'admin' && !user.isVerified) {
      return res.status(403).json({
        error: 'Email not verified. Please verify your email before signing in.',
        requiresVerification: true,
        email: user.email,
      });
    }

    const token = jwt.sign({ userId: user.id, role: user.role }, JWT_SECRET, { expiresIn: '7d' });

    res.status(200).json({
      token,
      user: formatUserForClient(user),
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Server error during login.' });
  }
};

const getUserCount = async (req, res) => {
  try {
    const count = await prisma.user.count({
      where: { role: 'customer' },
    });
    res.json({ count });
  } catch (error) {
    console.error('Get user count error:', error);
    res.status(500).json({ error: 'Server error fetching user count.' });
  }
};

const getAllCustomers = async (req, res) => {
  try {
    const customers = await prisma.user.findMany({
      where: { role: 'customer' },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        isVerified: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });
    res.json(customers);
  } catch (error) {
    console.error('Get all customers error:', error);
    res.status(500).json({ error: 'Server error fetching customers.' });
  }
};

const getMe = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.user.id } });
    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }
    res.json({ user: formatUserForClient(user) });
  } catch (error) {
    console.error('Get me error:', error);
    res.status(500).json({ error: 'Could not load profile.' });
  }
};

const updateProfile = async (req, res) => {
  try {
    const { name, phone } = req.body;
    const trimmedName = typeof name === 'string' ? name.trim() : '';

    if (!trimmedName) {
      return res.status(400).json({ error: 'Name is required.' });
    }

    const user = await prisma.user.update({
      where: { id: req.user.id },
      data: {
        name: trimmedName,
        phone: typeof phone === 'string' && phone.trim() ? phone.trim() : null,
      },
    });

    res.json({
      message: 'Profile updated successfully.',
      user: formatUserForClient(user),
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ error: 'Could not update profile.' });
  }
};

const updateProfileAvatar = (req, res) => {
  upload.single('image')(req, res, async (err) => {
    if (err?.name === 'MulterError') {
      return res.status(400).json({ error: `Upload error: ${err.message}` });
    }
    if (err) {
      return res.status(400).json({ error: err.message });
    }

    try {
      if (!req.file) {
        return res.status(400).json({ error: 'No image file uploaded.' });
      }

      const { url } = await storeImage(req.file);
      const user = await prisma.user.update({
        where: { id: req.user.id },
        data: { profileImage: url },
      });

      res.json({
        message: 'Profile photo updated.',
        user: formatUserForClient(user),
      });
    } catch (error) {
      console.error('Profile avatar upload error:', error);
      res.status(500).json({
        error: error.message || 'Failed to upload profile photo.',
      });
    }
  });
};

const removeProfileAvatar = async (req, res) => {
  try {
    const user = await prisma.user.update({
      where: { id: req.user.id },
      data: { profileImage: null },
    });

    res.json({
      message: 'Profile photo removed.',
      user: formatUserForClient(user),
    });
  } catch (error) {
    console.error('Remove profile avatar error:', error);
    res.status(500).json({ error: 'Could not remove profile photo.' });
  }
};

module.exports = {
  register,
  verifyOtp,
  resendOtp,
  login,
  getUserCount,
  getAllCustomers,
  getMe,
  updateProfile,
  updateProfileAvatar,
  removeProfileAvatar,
};
