const paymentWebhookService = require('../../application/services/paymentWebhook.service');

exports.handleWebhook = async (req, res, next) => {
  try {
    const signature = req.headers['x-razorpay-signature'];
    const body = req.body;
    let parsedBody = body;

    if (Buffer.isBuffer(body)) {
      const text = body.toString('utf8');
      try {
        parsedBody = JSON.parse(text);
      } catch {
        parsedBody = { raw: text };
      }
    }

    const result = await paymentWebhookService.processWebhook(parsedBody, signature);
    res.status(200).json({ success: true, data: result });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};
