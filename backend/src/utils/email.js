const { Resend } = require('resend');
const { formatNpr } = require('./currency');

// Verify Resend is configured on startup
const RESEND_API_KEY = process.env.RESEND_API_KEY;
if (!RESEND_API_KEY) {
  console.warn('[email] RESEND_API_KEY not set — emails will fall back to console logs');
} else {
  console.log('[email] Resend configured ✓');
}

const FROM_ADDRESS = process.env.EMAIL_FROM || 'Chadani Cosmetic Store <onboarding@resend.dev>';

function getResendClient() {
  if (!RESEND_API_KEY) return null;
  return new Resend(RESEND_API_KEY);
}

const sendEmail = async ({ to, subject, html, text }) => {
  const resend = getResendClient();

  // ── Resend (production) ───────────────────────────────────────────────────
  if (resend) {
    try {
      const { data, error } = await resend.emails.send({
        from: FROM_ADDRESS,
        to,
        subject,
        html,
        text,
      });

      if (error) {
        console.error('[Resend] Send error:', error);
        // Fall through to console fallback
      } else {
        console.log(`[Resend] Email sent: ${data?.id}`);
        return { success: true, messageId: data?.id };
      }
    } catch (err) {
      console.error('[Resend] Unexpected error:', err.message);
      // Fall through to console fallback
    }
  }

  // ── Console fallback (dev / Resend not configured) ────────────────────────
  const allowFallback =
    process.env.SMTP_FALLBACK_ON_ERROR === 'true' ||
    process.env.NODE_ENV !== 'production';

  if (allowFallback) {
    console.log('\n=========================================');
    console.log('[EMAIL FALLBACK — email not sent via Resend]');
    console.log(`To: ${to}`);
    console.log(`Subject: ${subject}`);
    if (text) console.log(text);
    console.log('=========================================\n');
    return { success: true, fallback: true };
  }

  return { success: false, error: 'Email service not configured.' };
};

/**
 * Send OTP Verification Email
 */
const sendOtpEmail = async (email, name, otp) => {
  const subject = 'Verify Your Email - Chadani Cosmetic Store';
  const html = `
    <div style="font-family: 'Playfair Display', 'Plus Jakarta Sans', Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px; background-color: #fffafb; border: 1px solid #ffe4e6; border-radius: 24px; color: #4c0519;">
      <div style="text-align: center; margin-bottom: 30px;">
        <h1 style="color: #9f1239; font-size: 28px; margin: 0; font-family: Georgia, serif; letter-spacing: 1px;">Chadani Cosmetic</h1>
        <p style="text-transform: uppercase; font-size: 10px; letter-spacing: 3px; color: #be123c; margin: 5px 0 0 0; font-weight: bold;">Luxury Beauty & Bangles</p>
      </div>
      <div style="background-color: #ffffff; padding: 40px; border-radius: 16px; border: 1px solid #fecdd3; box-shadow: 0 4px 6px -1px rgba(244, 63, 94, 0.05);">
        <h2 style="font-size: 20px; font-weight: 700; color: #881337; margin-top: 0; margin-bottom: 20px;">Welcome, ${name}!</h2>
        <p style="font-size: 14px; line-height: 1.6; color: #4c0519; margin-bottom: 24px;">Thank you for registering at Chadani Cosmetic Store. To complete your signup and verify your email, please use the 6-digit verification code below:</p>
        
        <div style="background-color: #fff1f2; border: 2px dashed #fda4af; padding: 20px; text-align: center; border-radius: 12px; margin-bottom: 24px;">
          <span style="font-family: monospace; font-size: 36px; font-weight: 800; color: #9f1239; letter-spacing: 8px;">${otp}</span>
        </div>
        
        <p style="font-size: 12px; color: #be123c; margin-bottom: 12px; font-style: italic;">This verification code is valid for 10 minutes. Please do not share this code with anyone.</p>
        <p style="font-size: 14px; line-height: 1.6; color: #4c0519; margin-bottom: 0;">If you did not initiate this request, you can safely ignore this email.</p>
      </div>
      <div style="text-align: center; margin-top: 30px; font-size: 11px; color: #be123c; opacity: 0.6;">
        <p>© 2026 Chadani Cosmetic Store. All rights reserved.</p>
      </div>
    </div>
  `;

  return sendEmail({
    to: email,
    subject,
    html,
    text: `Hello ${name},\n\nYour 6-digit verification code is: ${otp}. It will expire in 10 minutes.\n\nThank you,\nChadani Cosmetic Store`,
  });
};

/**
 * Send Welcome Email
 */
const sendWelcomeEmail = async (email, name) => {
  const subject = 'Welcome to Chadani Cosmetic Store! ✨';
  const html = `
    <div style="font-family: 'Playfair Display', 'Plus Jakarta Sans', Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px; background-color: #fffafb; border: 1px solid #ffe4e6; border-radius: 24px; color: #4c0519;">
      <div style="text-align: center; margin-bottom: 30px;">
        <h1 style="color: #9f1239; font-size: 28px; margin: 0; font-family: Georgia, serif; letter-spacing: 1px;">Chadani Cosmetic</h1>
        <p style="text-transform: uppercase; font-size: 10px; letter-spacing: 3px; color: #be123c; margin: 5px 0 0 0; font-weight: bold;">Luxury Beauty & Bangles</p>
      </div>
      <div style="background-color: #ffffff; padding: 40px; border-radius: 16px; border: 1px solid #fecdd3; box-shadow: 0 4px 6px -1px rgba(244, 63, 94, 0.05); text-align: center;">
        <h2 style="font-size: 22px; font-weight: 700; color: #881337; margin-top: 0; margin-bottom: 15px;">Your Account is Verified!</h2>
        <p style="font-size: 15px; line-height: 1.6; color: #4c0519; margin-bottom: 30px;">Hi ${name}, your email has been verified successfully. Welcome to the world of premium traditional bangles, professional makeup, and exquisite beauty skincare treatments.</p>
        
        <div style="margin-bottom: 30px;">
          <a href="${process.env.CLIENT_URL || 'http://localhost:3000'}/login" style="background-color: #9f1239; color: #ffffff; padding: 14px 30px; text-decoration: none; border-radius: 12px; font-weight: bold; font-size: 14px; text-transform: uppercase; letter-spacing: 1px; display: inline-block;">Sign In to Shop</a>
        </div>
        
        <p style="font-size: 13px; color: #be123c; margin-bottom: 0;">Explore our latest collections and premium skincare treatments with a curated luxury touch.</p>
      </div>
      <div style="text-align: center; margin-top: 30px; font-size: 11px; color: #be123c; opacity: 0.6;">
        <p>© 2026 Chadani Cosmetic Store. All rights reserved.</p>
      </div>
    </div>
  `;

  return sendEmail({
    to: email,
    subject,
    html,
    text: `Hello ${name},\n\nYour account has been successfully verified! You can now log in and shop.\n\nBest regards,\nChadani Cosmetic Store`,
  });
};

/**
 * Send Order Confirmation Email
 */
const sendOrderConfirmationEmail = async (order, customerEmail) => {
  const subject = `Order Confirmed - #${order.id.slice(0, 8)}`;
  
  let productsHtml = '';
  order.orderItems.forEach(item => {
    const itemSubtotal = item.price * item.quantity;
    productsHtml += `
      <tr style="border-b: 1px solid #ffe4e6;">
        <td style="padding: 12px; vertical-align: middle;">
          <div style="display: flex; align-items: center;">
            <img src="${item.productImage || 'https://via.placeholder.com/60'}" alt="${item.productName}" style="width: 50px; height: 50px; object-fit: cover; border-radius: 8px; border: 1px solid #fecdd3; margin-right: 12px;" />
            <div>
              <div style="font-weight: bold; font-size: 14px; color: #4c0519;">${item.productName}</div>
              <div style="font-size: 11px; color: #9f1239;">SKU: ${item.sku || 'N/A'} | Category: ${item.productCategory || 'N/A'}</div>
            </div>
          </div>
        </td>
        <td style="padding: 12px; text-align: center; font-size: 14px; color: #4c0519;">${formatNpr(item.price)}</td>
        <td style="padding: 12px; text-align: center; font-size: 14px; color: #4c0519;">${item.quantity}</td>
        <td style="padding: 12px; text-align: right; font-weight: bold; font-size: 14px; color: #9f1239;">${formatNpr(itemSubtotal)}</td>
      </tr>
    `;
  });

  const html = `
    <div style="font-family: 'Playfair Display', 'Plus Jakarta Sans', Helvetica, Arial, sans-serif; max-width: 650px; margin: 0 auto; padding: 40px 20px; background-color: #fffafb; border: 1px solid #ffe4e6; border-radius: 24px; color: #4c0519;">
      <div style="text-align: center; margin-bottom: 30px;">
        <h1 style="color: #9f1239; font-size: 28px; margin: 0; font-family: Georgia, serif; letter-spacing: 1px;">Chadani Cosmetic</h1>
        <p style="text-transform: uppercase; font-size: 10px; letter-spacing: 3px; color: #be123c; margin: 5px 0 0 0; font-weight: bold;">Luxury Beauty & Bangles</p>
      </div>
      <div style="background-color: #ffffff; padding: 40px; border-radius: 16px; border: 1px solid #fecdd3; box-shadow: 0 4px 6px -1px rgba(244, 63, 94, 0.05);">
        <h2 style="font-size: 20px; font-weight: 700; color: #881337; margin-top: 0; margin-bottom: 20px; border-bottom: 2px solid #fff1f2; padding-bottom: 12px;">Order Confirmed!</h2>
        
        <p style="font-size: 14px; line-height: 1.6; color: #4c0519;">Thank you for your order, <strong>${order.customerName}</strong>! We are preparing your high-fashion beauty products and traditional accessories.</p>
        
        <div style="margin: 24px 0; background-color: #fff1f2; border-radius: 12px; padding: 16px; font-size: 13px;">
          <div style="margin-bottom: 6px;"><strong>Order ID:</strong> #${order.id}</div>
          <div style="margin-bottom: 6px;"><strong>Date:</strong> ${new Date(order.createdAt).toLocaleString()}</div>
          <div style="margin-bottom: 6px;"><strong>Payment Method:</strong> ${order.paymentMethod}</div>
          <div><strong>Shipping Address:</strong> ${order.address}</div>
        </div>

        <h3 style="font-size: 16px; color: #881337; margin-top: 30px; margin-bottom: 12px;">Items Ordered</h3>
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 24px;">
          <thead>
            <tr style="background-color: #fff1f2; border-bottom: 2px solid #fda4af;">
              <th style="padding: 10px; text-align: left; font-size: 11px; text-transform: uppercase; letter-spacing: 1px; color: #881337;">Product</th>
              <th style="padding: 10px; text-align: center; font-size: 11px; text-transform: uppercase; letter-spacing: 1px; color: #881337;">Price</th>
              <th style="padding: 10px; text-align: center; font-size: 11px; text-transform: uppercase; letter-spacing: 1px; color: #881337;">Qty</th>
              <th style="padding: 10px; text-align: right; font-size: 11px; text-transform: uppercase; letter-spacing: 1px; color: #881337;">Subtotal</th>
            </tr>
          </thead>
          <tbody>
            ${productsHtml}
          </tbody>
          <tfoot>
            <tr>
              <td colspan="2"></td>
              <td style="padding: 12px; text-align: right; font-weight: bold; color: #4c0519; font-size: 14px;">Total Amount:</td>
              <td style="padding: 12px; text-align: right; font-weight: 900; font-size: 18px; color: #9f1239;">${formatNpr(order.totalAmount)}</td>
            </tr>
          </tfoot>
        </table>

        <p style="font-size: 13px; color: #4c0519; line-height: 1.6; margin-top: 30px; border-top: 1px dashed #fecdd3; padding-top: 20px; text-align: center;">We will notify you once your package is shipped. If you have any questions, feel free to reply to this email.</p>
      </div>
      <div style="text-align: center; margin-top: 30px; font-size: 11px; color: #be123c; opacity: 0.6;">
        <p>© 2026 Chadani Cosmetic Store. All rights reserved.</p>
      </div>
    </div>
  `;

  return sendEmail({
    to: customerEmail,
    subject,
    html,
    text: `Hello ${order.customerName},\n\nYour order #${order.id.slice(0, 8)} has been confirmed! Total: ${formatNpr(order.totalAmount)}.\n\nThank you for shopping at Chadani Cosmetic Store!`,
  });
};

/**
 * Send Order Status Update Email
 */
const sendOrderStatusUpdateEmail = async (order, customerEmail) => {
  const statusLabels = {
    pending: 'Pending',
    confirmed: 'Confirmed',
    shipped: 'Shipped and On the Way 🚚',
    delivered: 'Delivered successfully! 🎉',
    cancelled: 'Cancelled ❌',
  };

  const statusLabel = statusLabels[order.orderStatus.toLowerCase()] || order.orderStatus;
  const subject = `Order Status Update - #${order.id.slice(0, 8)} - ${order.orderStatus.toUpperCase()}`;

  const html = `
    <div style="font-family: 'Playfair Display', 'Plus Jakarta Sans', Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px; background-color: #fffafb; border: 1px solid #ffe4e6; border-radius: 24px; color: #4c0519;">
      <div style="text-align: center; margin-bottom: 30px;">
        <h1 style="color: #9f1239; font-size: 28px; margin: 0; font-family: Georgia, serif; letter-spacing: 1px;">Chadani Cosmetic</h1>
        <p style="text-transform: uppercase; font-size: 10px; letter-spacing: 3px; color: #be123c; margin: 5px 0 0 0; font-weight: bold;">Luxury Beauty & Bangles</p>
      </div>
      <div style="background-color: #ffffff; padding: 40px; border-radius: 16px; border: 1px solid #fecdd3; box-shadow: 0 4px 6px -1px rgba(244, 63, 94, 0.05); text-align: center;">
        <h2 style="font-size: 20px; font-weight: 700; color: #881337; margin-top: 0; margin-bottom: 20px; border-bottom: 2px solid #fff1f2; padding-bottom: 12px;">Order Status Update</h2>
        
        <p style="font-size: 15px; line-height: 1.6; color: #4c0519;">Hi <strong>${order.customerName}</strong>,</p>
        <p style="font-size: 15px; line-height: 1.6; color: #4c0519; margin-bottom: 30px;">The status of your order <strong>#${order.id.slice(0, 8)}</strong> has been updated to:</p>
        
        <div style="background-color: #fff1f2; border: 1px solid #fda4af; padding: 18px 24px; display: inline-block; border-radius: 12px; font-size: 18px; font-weight: 800; color: #9f1239; margin-bottom: 30px; text-transform: uppercase; letter-spacing: 1px;">
          ${statusLabel}
        </div>
        
        <p style="font-size: 14px; line-height: 1.6; color: #4c0519; margin-bottom: 0; text-align: left;">
          <strong>Order Summary:</strong><br />
          • Total Amount: ${formatNpr(order.totalAmount)}<br />
          • Payment Method: ${order.paymentMethod}<br />
          • Shipping Address: ${order.address}
        </p>
      </div>
      <div style="text-align: center; margin-top: 30px; font-size: 11px; color: #be123c; opacity: 0.6;">
        <p>© 2026 Chadani Cosmetic Store. All rights reserved.</p>
      </div>
    </div>
  `;

  return sendEmail({
    to: customerEmail,
    subject,
    html,
    text: `Hello ${order.customerName},\n\nYour order #${order.id.slice(0, 8)} status has been updated to: ${statusLabel}.\n\nThank you for choosing Chadani Cosmetic Store!`,
  });
};

module.exports = {
  sendOtpEmail,
  sendWelcomeEmail,
  sendOrderConfirmationEmail,
  sendOrderStatusUpdateEmail,
};
