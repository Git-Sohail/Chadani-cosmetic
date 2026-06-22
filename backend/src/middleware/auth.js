const jwt = require('jsonwebtoken');
const prisma = require('../db');

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) throw new Error('[auth] JWT_SECRET environment variable is required');

const authenticateUser = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      console.warn(`[auth] No Authorization header — ${req.method} ${req.path}`);
      return res.status(401).json({ error: 'Access denied. No token provided.' });
    }

    if (!authHeader.startsWith('Bearer ')) {
      console.warn(`[auth] Malformed Authorization header — ${req.method} ${req.path}`);
      return res.status(401).json({ error: 'Access denied. Invalid token format.' });
    }

    const token = authHeader.split(' ')[1];

    if (!token || token === 'null' || token === 'undefined') {
      console.warn(`[auth] Token is null/undefined — ${req.method} ${req.path}`);
      return res.status(401).json({ error: 'Access denied. Token is empty.' });
    }

    let decoded;
    try {
      decoded = jwt.verify(token, JWT_SECRET);
    } catch (jwtError) {
      if (jwtError.name === 'TokenExpiredError') {
        console.warn(`[auth] Token expired — ${req.method} ${req.path}`);
        return res.status(401).json({ error: 'Session expired. Please sign in again.', expired: true });
      }
      console.warn(`[auth] Invalid token (${jwtError.name}) — ${req.method} ${req.path}`);
      return res.status(401).json({ error: 'Invalid token. Please sign in again.' });
    }

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { id: true, name: true, email: true, role: true },
    });

    if (!user) {
      console.warn(`[auth] User not found for id=${decoded.userId} — ${req.method} ${req.path}`);
      return res.status(401).json({ error: 'User not found or deleted.' });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error('[auth] Unexpected error:', error.message);
    return res.status(401).json({ error: 'Authentication failed.' });
  }
};

const isAdmin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    console.warn(`[auth] Admin required but role=${req.user?.role} — ${req.method} ${req.path}`);
    return res.status(403).json({ error: 'Access denied. Administrator privileges required.' });
  }
};

module.exports = { authenticateUser, isAdmin };
