const crypto = require('crypto');
const prisma = require('../db');
const { sendOtpEmail } = require('./email');

const OTP_EXPIRY_MS = 10 * 60 * 1000; // 10 minutes
const RESEND_COOLDOWN_MS = 60 * 1000; // 1 minute between resends
const MAX_RESENDS_PER_HOUR = 5;

function generateOtpCode() {
  return crypto.randomInt(100000, 999999).toString();
}

function timingSafeEqual(a, b) {
  const bufA = Buffer.from(String(a));
  const bufB = Buffer.from(String(b));
  if (bufA.length !== bufB.length) return false;
  return crypto.timingSafeEqual(bufA, bufB);
}

async function invalidateUserOtps(userId) {
  await prisma.otp.deleteMany({ where: { userId } });
}

async function checkResendRateLimit(userId) {
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
  const recentCount = await prisma.otp.count({
    where: {
      userId,
      createdAt: { gte: oneHourAgo },
    },
  });

  if (recentCount >= MAX_RESENDS_PER_HOUR) {
    return {
      allowed: false,
      error: 'Too many OTP requests. Please try again in an hour.',
    };
  }

  const latest = await prisma.otp.findFirst({
    where: { userId },
    orderBy: { createdAt: 'desc' },
  });

  if (latest && Date.now() - new Date(latest.createdAt).getTime() < RESEND_COOLDOWN_MS) {
    const waitSec = Math.ceil(
      (RESEND_COOLDOWN_MS - (Date.now() - new Date(latest.createdAt).getTime())) / 1000
    );
    return {
      allowed: false,
      error: `Please wait ${waitSec} seconds before requesting another code.`,
    };
  }

  return { allowed: true };
}

async function createAndSendOtp(user) {
  const otp = generateOtpCode();
  const expiresAt = new Date(Date.now() + OTP_EXPIRY_MS);

  await invalidateUserOtps(user.id);

  await prisma.otp.create({
    data: {
      userId: user.id,
      otp,
      expiresAt,
    },
  });

  const emailResult = await sendOtpEmail(user.email, user.name, otp);
  if (!emailResult.success && !emailResult.fallback) {
    throw new Error(
      emailResult.error ||
        'Failed to send verification email. Please check SMTP configuration in .env'
    );
  }

  if (emailResult.fallback) {
    console.log(
      `[OTP] Verification code for ${user.email}: ${otp} (expires in 10 minutes)`
    );
  }

  return { otp, expiresAt, emailSent: !emailResult.fallback };
}

async function verifyUserOtp(email, otpCode) {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    return { ok: false, status: 404, error: 'User not found.' };
  }

  if (user.isVerified) {
    return { ok: false, status: 400, error: 'Email is already verified.' };
  }

  const record = await prisma.otp.findFirst({
    where: { userId: user.id },
    orderBy: { createdAt: 'desc' },
  });

  if (!record) {
    return { ok: false, status: 400, error: 'No verification code found. Please request a new one.' };
  }

  if (new Date() > new Date(record.expiresAt)) {
    return { ok: false, status: 400, error: 'Verification code has expired. Please request a new one.' };
  }

  if (!timingSafeEqual(record.otp, otpCode)) {
    return { ok: false, status: 400, error: 'Invalid verification code.' };
  }

  const updatedUser = await prisma.user.update({
    where: { id: user.id },
    data: { isVerified: true },
  });

  await invalidateUserOtps(user.id);

  return { ok: true, user: updatedUser };
}

module.exports = {
  OTP_EXPIRY_MS,
  RESEND_COOLDOWN_MS,
  createAndSendOtp,
  verifyUserOtp,
  checkResendRateLimit,
  invalidateUserOtps,
};
