(async ()=>{
  try {
    const fetch = global.fetch || (await import('node-fetch')).default;
    const initRes = await fetch('http://localhost:9000/api/payment-sessions/initiate', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ userId: 'user_test_e2e', orderId: 'ORD_user_test_' + Date.now(), amount: 19.99, paymentMethod: 'UPI', productName: 'E2E Product' })
    });
    const init = await initRes.json();
    console.log('INIT:', JSON.stringify(init));
    const paymentId = init.data.paymentId;
    const userId = 'user_test_e2e';
    const paidAmount = 19.99;
    const razorpayOrderId = init.data.razorpayOrderId;
    if (!razorpayOrderId) {
      throw new Error('Razorpay order was not created for this payment session');
    }

    const razorpay_payment_id = 'rp_pay_test_' + Date.now();
    const secret = process.env.RAZORPAY_KEY_SECRET || 'RAZORPAY_KEY_SECRET_PLACEHOLDER';
    const crypto = await import('node:crypto');
    const sigInput = `${razorpayOrderId}|${razorpay_payment_id}`;
    const signature = crypto.createHmac('sha256', secret).update(sigInput).digest('hex');
    console.log('SIG:', signature);
    const completeRes = await fetch('http://localhost:9000/api/payment-sessions/complete', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ paymentId, paidAmount, userId, razorpay_payment_id, razorpay_signature: signature, razorpay_order_id: orderIdForSig, paymentDetails: { upiId: 'test@upi' } })
    });
    const complete = await completeRes.json();
    console.log('COMPLETE:', JSON.stringify(complete));
  } catch (err) {
    console.error('ERROR', err.message);
    process.exit(1);
  }
})();
