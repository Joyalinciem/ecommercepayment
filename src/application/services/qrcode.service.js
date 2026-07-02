const QRCode = require('qrcode');

class QRCodeService {
  async generateUPIQRCode(upiId, amount, note = 'Payment', tr = null) {
    try {
      // UPI format: upi://pay?pa=upiid@bank&am=amount&tn=note&tr=reference
      // `tr` can be used to pass an order reference (e.g., razorpay order id) so apps like GPay show correct reference.
      const ref = tr || Date.now();
      const upiString = `upi://pay?pa=${upiId}&am=${amount}&tn=${encodeURIComponent(note)}&tr=${ref}`;
      const qrCodeDataUrl = await QRCode.toDataURL(upiString);
      return qrCodeDataUrl;
    } catch (err) {
      throw new Error(`Failed to generate QR code: ${err.message}`);
    }
  }

  async generatePaymentVerificationQR(paymentId, verificationCode) {
    try {
      const verificationString = `payment://${paymentId}/${verificationCode}`;
      const qrCodeDataUrl = await QRCode.toDataURL(verificationString);
      return qrCodeDataUrl;
    } catch (err) {
      throw new Error(`Failed to generate verification QR: ${err.message}`);
    }
  }
}

module.exports = new QRCodeService();
