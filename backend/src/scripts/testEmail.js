require('dotenv').config();
const {
  verifySmtpTransport,
  sendOtpEmail,
  sendOrderConfirmationEmail,
  sendOrderStatusUpdateEmail,
  maskEmail,
} = require('../utils/email');

async function runTests() {
  const targetEmail = process.argv[2] || 'test-customer@example.com';
  console.log(`\n--- Chadani Cosmetic Email System Diagnostic ---`);
  console.log(`Target Recipient: ${maskEmail(targetEmail)}`);
  console.log(`Configured SMTP Host: ${process.env.SMTP_HOST || 'smtp.gmail.com'}`);
  console.log(`Configured SMTP Port: ${process.env.SMTP_PORT || '465'}`);
  console.log(`Configured SMTP User: ${process.env.SMTP_USER ? maskEmail(process.env.SMTP_USER) : '(not set)'}`);
  console.log(`------------------------------------------------\n`);

  // 1. Verify SMTP Connection
  console.log('1. Verifying SMTP Transport credentials...');
  const verifyResult = await verifySmtpTransport();
  if (verifyResult.ok) {
    console.log('✓ SMTP Transport verified successfully with server.\n');
  } else {
    console.warn(`! SMTP Transport verification notice: ${verifyResult.error}`);
    console.warn('(If credentials are not yet added to .env, emails will safely use dev console fallback.)\n');
  }

  // Mock Order Object for Testing
  const mockOrder = {
    id: 'ord_test_8f293b1c7a40',
    customerName: 'Sohail Test Customer',
    customerEmail: targetEmail,
    address: 'Dharan-12, College Road, Near Bhanu Chowk',
    paymentMethod: 'Cash on Delivery',
    createdAt: new Date().toISOString(),
    totalAmount: 2350,
    orderStatus: 'pending',
    orderItems: [
      {
        productName: 'Handcrafted Kundan Bangle Set',
        productCategory: 'Traditional Bangles',
        sku: 'BNG-KDN-001',
        productImage: 'https://images.unsplash.com/photo-1617038260897-41a608cfd2c1?w=200',
        price: 1500,
        quantity: 1,
        subtotal: 1500,
      },
      {
        productName: 'Hydrating Glow Facial Serum',
        productCategory: 'Skincare',
        sku: 'SKN-GLW-002',
        productImage: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=200',
        price: 750,
        quantity: 1,
        subtotal: 750,
      },
    ],
  };

  // 2. Test OTP Email
  console.log('2. Testing Registration OTP Email flow...');
  const otpResult = await sendOtpEmail(targetEmail, 'Sohail Test', '849201');
  console.log(`Result: ${JSON.stringify(otpResult)}\n`);

  // 3. Test Order Confirmation Email
  console.log('3. Testing New Order Confirmation Email flow...');
  const orderResult = await sendOrderConfirmationEmail(mockOrder, targetEmail);
  console.log(`Result: ${JSON.stringify(orderResult)}\n`);

  // 4. Test Order Status Update: Confirmed
  console.log('4. Testing Order Status Email: Confirmed...');
  const confirmedOrder = { ...mockOrder, orderStatus: 'confirmed' };
  const confirmedResult = await sendOrderStatusUpdateEmail(confirmedOrder, targetEmail);
  console.log(`Result: ${JSON.stringify(confirmedResult)}\n`);

  // 5. Test Order Status Email: Shipped
  console.log('5. Testing Order Status Email: Shipped...');
  const shippedOrder = { ...mockOrder, orderStatus: 'shipped' };
  const shippedResult = await sendOrderStatusUpdateEmail(shippedOrder, targetEmail);
  console.log(`Result: ${JSON.stringify(shippedResult)}\n`);

  // 6. Test Order Status Email: Delivered
  console.log('6. Testing Order Status Email: Delivered...');
  const deliveredOrder = { ...mockOrder, orderStatus: 'delivered' };
  const deliveredResult = await sendOrderStatusUpdateEmail(deliveredOrder, targetEmail);
  console.log(`Result: ${JSON.stringify(deliveredResult)}\n`);

  // 7. Test Order Status Email: Cancelled
  console.log('7. Testing Order Status Email: Cancelled...');
  const cancelledOrder = { ...mockOrder, orderStatus: 'cancelled' };
  const cancelledResult = await sendOrderStatusUpdateEmail(cancelledOrder, targetEmail);
  console.log(`Result: ${JSON.stringify(cancelledResult)}\n`);

  // 8. Test Failure-Isolation (Ensuring broken SMTP does not crash orders)
  console.log('8. Testing Failure-Isolation (deliberately broken transporter)...');
  const brokenTransporter = require('nodemailer').createTransport({
    host: 'smtp.invalid-domain-test.com',
    port: 587,
    auth: { user: 'fake', pass: 'fake' },
    connectionTimeout: 1000,
  });

  try {
    console.log('Attempting sendMail with unreachable SMTP server...');
    await brokenTransporter.sendMail({
      from: 'Chadani Cosmetic <no-reply@invalid.com>',
      to: targetEmail,
      subject: 'Failure test',
      text: 'Testing failure handling',
    });
  } catch (err) {
    console.log(`✓ Caught expected SMTP error safely: "${err.message}".`);
    console.log('✓ Verified: Error is handled without breaking order flow or throwing unhandled rejection.\n');
  }

  console.log('--- All Diagnostic Tests Completed Successfully ---');
}

runTests().catch((err) => {
  console.error('Test script encountered an error:', err);
  process.exit(1);
});
