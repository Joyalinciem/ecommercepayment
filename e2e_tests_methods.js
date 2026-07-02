(async ()=>{
  const fetch = global.fetch || (await import('node-fetch')).default;
  const crypto = await import('node:crypto');
  const methods = ['Card','Net Banking'];

  for (const method of methods) {
    try {
      console.log('\n--- Testing method:', method);
      const initRes = await fetch('http://localhost:9000/api/payment-sessions/initiate', {
        method: 'POST', headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ userId: `user_e2e_${method.replace(/\s+/g,'')}`, orderId: `ORD_e2e_${method}_${Date.now()}`, amount: 29.99, paymentMethod: method, productName: `E2E ${method}` })
      });
      const init = await initRes.json();
      console.log('INIT:', init.success, init.message || 'ok');
      const paymentId = init.data.paymentId;
      const amount = init.data.amount;
      const razorpayOrderId = init.data.razorpayOrderId;

      if (!razorpayOrderId) {
        console.warn('Skipping gateway verification because Razorpay order was not created for this payment session.');
        continue;
      }

      // Simulate gateway payment by crafting razorpay ids and signature
      const razorpay_order_id = razorpayOrderId;
      const razorpay_payment_id = 'rp_pay_test_' + Date.now();
      const secret = process.env.RAZORPAY_KEY_SECRET || 'RAZORPAY_KEY_SECRET_PLACEHOLDER';
      const sigInput = `${razorpay_order_id}|${razorpay_payment_id}`;
      const signature = crypto.createHmac('sha256', secret).update(sigInput).digest('hex');

      // POST to /complete with razorpay params
      const completeRes = await fetch('http://localhost:9000/api/payment-sessions/complete', {
        method: 'POST', headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ paymentId, paidAmount: amount, userId: `user_e2e_${method.replace(/\s+/g,'')}`, razorpay_payment_id, razorpay_signature: signature, razorpay_order_id, paymentDetails: { method } })
      });
      const complete = await completeRes.json();
      console.log('COMPLETE:', JSON.stringify(complete));
    } catch (err) {
      console.error('E2E failed for', method, err.message);
    }
  }
})();
