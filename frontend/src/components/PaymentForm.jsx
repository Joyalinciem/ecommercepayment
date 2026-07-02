import { useState, useEffect } from 'react';
import axios from 'axios';
import { CheckIcon, XIcon } from './common/Icons';

const initialFormData = {
  userId: 'user_' + Math.random().toString(36).substr(2, 9),
  productName: 'Premium ecommerce product',
  amount: 49.99,
  cardNumber: '',
  cardHolderName: '',
  expiryMonth: '',
  expiryYear: '',
  cvv: '',
  upiId: '',
};

const validatePaymentCredentials = (selectedMethod, formData) => {
  const errors = {};

  if (selectedMethod === 'UPI') {
    if (formData.upiId && !/^[a-z0-9._-]{2,}@[a-z]{2,20}$/.test(formData.upiId.trim().toLowerCase())) {
      errors.upiId = 'Enter a valid UPI ID like name@paytm.';
    }
  }

  return errors;
};

export default function PaymentForm() {
  const [formData, setFormData] = useState(initialFormData);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [selectedMethod, setSelectedMethod] = useState('UPI');
  const [paymentSession, setPaymentSession] = useState(null);
  const [timeRemaining, setTimeRemaining] = useState(null);
  const [paymentStep, setPaymentStep] = useState('select'); // select, details, processing, success, failed
  const [orderDetails, setOrderDetails] = useState(null);
  const [retryInfo, setRetryInfo] = useState(null);

  // Timer effect
  useEffect(() => {
    if (!paymentSession?.expiresIn) return;

    const interval = setInterval(() => {
      setPaymentSession((prev) => {
        if (!prev) return prev;
        const newExpiresIn = Math.max(0, prev.expiresIn - 1);
        setTimeRemaining(newExpiresIn);

        if (newExpiresIn === 0) {
          handlePaymentExpired();
        }

        return { ...prev, expiresIn: newExpiresIn };
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [paymentSession]);

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: '' }));
    if (message.startsWith('Invalid payment credentials')) {
      setMessage('');
    }
  };

  const initiatePaymentSession = async () => {
    setLoading(true);
    setMessage('');

    try {
      const response = await axios.post('/api/payment-sessions/initiate', {
        userId: formData.userId,
        orderId: `ORD_${formData.userId}_${Date.now()}`,
        amount: formData.amount,
        paymentMethod: selectedMethod,
        productName: formData.productName,
      });

      setPaymentSession(response.data.data);
      setPaymentStep('details');
      setTimeRemaining(response.data.data.expiresIn);
      setMessage(`Payment session created. You have ${response.data.data.expiresIn} seconds to complete payment.`);
    } catch (error) {
      setMessage(`Error: ${error.response?.data?.message || error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentExpired = async () => {
    if (!paymentSession) return;

    setPaymentStep('expired');
    setMessage('Payment session expired. Request a retry to continue.');

    // Calculate retry available time
    const freezeTime = selectedMethod === 'UPI' ? 120 : 0; // 2 min for UPI
    setRetryInfo({
      freezeTime,
      retryAvailableAt: new Date(Date.now() + freezeTime * 1000),
      canRetry: paymentSession.retryCount < 3,
    });
  };

  const handleRetry = async () => {
    if (!paymentSession || !retryInfo) return;

    const now = new Date();
    if (retryInfo.retryAvailableAt > now) {
      const secondsToWait = Math.ceil((retryInfo.retryAvailableAt - now) / 1000);
      setMessage(`Please wait ${secondsToWait} seconds before retrying.`);
      return;
    }

    setLoading(true);
    setMessage('Initiating retry...');

    try {
      const response = await axios.post('/api/payment-sessions/retry', {
        paymentId: paymentSession.paymentId,
        userId: formData.userId,
      });

      setPaymentSession(response.data.data);
      setPaymentStep('details');
      setTimeRemaining(response.data.data.expiresIn);
      setRetryInfo(null);
      setMessage(`Retry #${response.data.data.retryCount} initiated. ${response.data.data.expiresIn} seconds remaining.`);
    } catch (error) {
      setMessage(`Retry failed: ${error.response?.data?.message || error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const completePayment = async () => {
    const validationErrors = validatePaymentCredentials(selectedMethod, formData);

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      setMessage('Invalid payment credentials. Please enter valid details.');
      return;
    }

    if (selectedMethod === 'UPI' && !formData.upiId) {
      setErrors({ upiId: 'Enter your UPI ID to proceed.' });
      setMessage('Please provide a valid UPI ID before paying.');
      return;
    }

    if (!paymentSession?.razorpayOrderId) {
      setMessage('Unable to start payment. Razorpay order was not created.');
      setPaymentStep('failed');
      return;
    }

    setLoading(true);
    setPaymentStep('processing');
    setMessage('Processing payment...');

    try {
      await axios.post('/api/payment-sessions/verify-amount', {
        paymentId: paymentSession.paymentId,
        paidAmount: formData.amount,
        userId: formData.userId,
      });

      await openRazorpayCheckout({
        key: paymentSession.razorpayKeyId,
        order_id: paymentSession.razorpayOrderId,
        amount: Math.round(Number(formData.amount || 0) * 100),
        name: formData.productName,
        description: `Order ${paymentSession.orderId}`,
      });
    } catch (error) {
      setPaymentStep('failed');
      setMessage(`Payment failed: ${error.response?.data?.message || error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Open Razorpay Checkout
  const openRazorpayCheckout = async ({ key, order_id, amount, name, description }) => {
    return new Promise((resolve, reject) => {
      if (!window.Razorpay) {
        const script = document.createElement('script');
        script.src = 'https://checkout.razorpay.com/v1/checkout.js';
        script.onload = () => initCheckout();
        script.onerror = () => reject(new Error('Failed to load Razorpay SDK'));
        document.body.appendChild(script);
      } else {
        initCheckout();
      }

      function initCheckout() {
        const prefill = {
          name: formData.cardHolderName || formData.userId || 'Customer',
          email: '',
          contact: '',
        };

        if (selectedMethod === 'UPI' && formData.upiId) {
          prefill.vpa = formData.upiId;
        }

        const displayConfig = selectedMethod === 'UPI'
          ? {
              display: {
                blocks: [
                  {
                    name: 'Pay with UPI',
                    instruments: [{ method: 'upi' }],
                  },
                ],
                hide: {
                  card: true,
                  netbanking: true,
                  wallet: true,
                },
              },
            }
          : selectedMethod === 'Card'
            ? {
                display: {
                  blocks: [
                    {
                      name: 'Pay with Card',
                      instruments: [{ method: 'card' }],
                    },
                  ],
                  hide: {
                    upi: true,
                    netbanking: true,
                    wallet: true,
                  },
                },
              }
            : selectedMethod === 'Net Banking'
              ? {
                  display: {
                    blocks: [
                      {
                        name: 'Pay with Net Banking',
                        instruments: [{ method: 'netbanking' }],
                      },
                    ],
                    hide: {
                      upi: true,
                      card: true,
                      wallet: true,
                    },
                  },
                }
              : selectedMethod === 'Wallet'
                ? {
                    display: {
                      blocks: [
                        {
                          name: 'Pay with Wallet',
                          instruments: [{ method: 'wallet' }],
                        },
                      ],
                      hide: {
                        upi: true,
                        card: true,
                        netbanking: true,
                      },
                    },
                  }
                : undefined;

        const options = {
          key,
          amount,
          currency: 'INR',
          name,
          description,
          order_id,
          prefill,
          notes: {
            paymentMethod: selectedMethod,
            orderId: paymentSession.orderId,
          },
          config: displayConfig,
          handler: async function (response) {
            try {
              const res = await axios.post('/api/payment-sessions/complete', {
                paymentId: paymentSession.paymentId,
                paidAmount: formData.amount,
                userId: formData.userId,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                razorpay_order_id: response.razorpay_order_id,
                paymentDetails: {
                  upiId: formData.upiId,
                },
              });

              setPaymentStep('success');
              setOrderDetails(res.data.data);
              setMessage('Payment successful! Order confirmed.');
              resolve(res.data.data);
            } catch (err) {
              setPaymentStep('failed');
              setMessage(`Payment verification failed: ${err.response?.data?.message || err.message}`);
              reject(err);
            }
          },
          modal: {
            ondismiss: function () {
              setPaymentStep('failed');
              setMessage('Payment cancelled');
              reject(new Error('Payment cancelled'));
            },
          },
        };

        const rzp = new window.Razorpay(options);
        rzp.open();
      }
    });
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  // Step 1: Select payment method
  if (paymentStep === 'select') {
    return (
      <div className="rounded-xl bg-white p-8 shadow-sm">
        <h1 className="text-2xl font-semibold">Secure Checkout</h1>
        <p className="mt-2 text-slate-600">Product: {formData.productName}</p>
        <p className="mt-1 text-lg font-semibold text-emerald-600">₹{formData.amount}</p>

        <div className="mt-6">
          <label className="block text-sm font-medium text-slate-700 mb-3">Select Payment Method</label>
          <div className="space-y-2">
            {['UPI', 'Card', 'Net Banking', 'Wallet'].map((method) => (
              <label key={method} className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-slate-50">
                <input
                  type="radio"
                  name="paymentMethod"
                  value={method}
                  checked={selectedMethod === method}
                  onChange={(e) => setSelectedMethod(e.target.value)}
                  className="mr-3"
                />
                <span className="font-medium">{method}</span>
                <span className="text-xs text-slate-500 ml-auto">
                  {method === 'UPI' || method === 'Wallet' ? '5 min limit' : '10 min limit'}
                </span>
              </label>
            ))}
          </div>
        </div>

        <button
          onClick={initiatePaymentSession}
          disabled={loading}
          className="mt-6 w-full inline-flex items-center justify-center rounded-lg bg-emerald-600 px-5 py-3 text-sm font-semibold text-white hover:bg-emerald-700 disabled:bg-slate-400"
        >
          {loading ? 'Processing...' : `Proceed with ${selectedMethod}`}
        </button>

        {message && <p className="mt-3 text-sm text-slate-700">{message}</p>}
      </div>
    );
  }

  // Step 2: Payment details
  if (paymentStep === 'details' && paymentSession) {
    return (
      <div className="rounded-xl bg-white p-8 shadow-sm">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-semibold">Payment Details</h1>
            <p className="mt-2 text-slate-600">Product: {formData.productName}</p>
            <p className="mt-1 text-lg font-semibold text-emerald-600">₹{formData.amount}</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-slate-600">Time Remaining</p>
            <p className={`text-2xl font-bold ${timeRemaining <= 60 ? 'text-red-600' : 'text-emerald-600'}`}>
              {formatTime(timeRemaining || 0)}
            </p>
            <p className="text-xs text-slate-600 mt-1">{selectedMethod}</p>
          </div>
        </div>


        {selectedMethod === 'UPI' && (
          <div className="mt-6 rounded-lg border border-slate-200 bg-slate-50 p-4">
            <p className="text-sm text-slate-700">
              This checkout uses Razorpay UPI only. Enter your UPI ID below and complete payment via Razorpay.
            </p>
          </div>
        )}

        {/* Gateway note */}
        {selectedMethod !== 'UPI' && (
          <div className="mt-6 rounded-lg border border-slate-200 bg-slate-50 p-4">
            <p className="text-sm text-slate-700">
              Secure checkout will continue inside Razorpay for {selectedMethod}. No card details are stored here.
            </p>
          </div>
        )}

        {/* UPI ID Form */}
        {selectedMethod === 'UPI' && (
          <div className="mt-6">
            <label className="block text-sm font-medium text-slate-700">UPI ID</label>
            <input
              name="upiId"
              value={formData.upiId}
              onChange={handleInputChange}
              placeholder="name@paytm"
              className="mt-2 w-full rounded-lg border px-3 py-2"
            />
            {errors.upiId && <p className="mt-1 text-sm text-red-600">{errors.upiId}</p>}
            <p className="mt-2 text-xs text-slate-600">Amount will appear in your payment app after entry.</p>
          </div>
        )}

        <button
          onClick={completePayment}
          disabled={loading}
          className="mt-6 w-full inline-flex items-center justify-center rounded-lg bg-emerald-600 px-5 py-3 text-sm font-semibold text-white hover:bg-emerald-700 disabled:bg-slate-400"
        >
          {loading ? 'Processing...' : `Pay ₹${formData.amount}`}
        </button>

        <button
          onClick={() => setPaymentStep('select')}
          className="mt-3 w-full inline-flex items-center justify-center rounded-lg border border-slate-300 px-5 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
        >
          Change Payment Method
        </button>

        {message && <p className="mt-3 text-sm text-slate-700">{message}</p>}
      </div>
    );
  }

  // Step 3: Processing
  if (paymentStep === 'processing') {
    return (
      <div className="rounded-xl bg-white p-8 shadow-sm text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto"></div>
        <p className="mt-4 text-lg font-semibold">Processing Payment</p>
        <p className="mt-2 text-slate-600">Please wait while we verify your payment...</p>
      </div>
    );
  }

  // Step 4: Success
  if (paymentStep === 'success' && orderDetails) {
    return (
      <div className="rounded-xl bg-emerald-50 p-8 shadow-sm border border-emerald-200">
        <div className="text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-600 text-white">
            <CheckIcon />
          </div>
          <h1 className="mt-4 text-2xl font-bold text-emerald-600">Payment Successful!</h1>
          <p className="mt-2 text-slate-600">Your order has been confirmed</p>
        </div>

        <div className="mt-6 bg-white rounded-lg p-6 space-y-3">
          <div className="flex justify-between">
            <span className="text-slate-600">Payment ID:</span>
            <span className="font-mono text-sm">{orderDetails.paymentId}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-600">Order ID:</span>
            <span className="font-mono text-sm">{orderDetails.orderId}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-600">Amount Paid:</span>
            <span className="font-bold text-emerald-600">₹{orderDetails.amount}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-600">Payment Method:</span>
            <span className="font-medium">{orderDetails.paymentMethod}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-600">Status:</span>
            <span className="px-2 py-1 bg-emerald-100 text-emerald-700 rounded text-xs font-semibold">
              {orderDetails.status.toUpperCase()}
            </span>
          </div>
        </div>

        <p className="mt-6 text-center text-sm text-slate-600">
          A confirmation email has been sent to your registered email address.
        </p>

        <button
          onClick={() => window.location.reload()}
          className="mt-6 w-full inline-flex items-center justify-center rounded-lg bg-emerald-600 px-5 py-3 text-sm font-semibold text-white hover:bg-emerald-700"
        >
          Continue Shopping
        </button>
      </div>
    );
  }

  // Step 5: Failed
  if (paymentStep === 'failed') {
    return (
      <div className="rounded-xl bg-red-50 p-8 shadow-sm border border-red-200">
        <div className="text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-600 text-white">
            <XIcon />
          </div>
          <h1 className="mt-4 text-2xl font-bold text-red-600">Payment Failed</h1>
          <p className="mt-2 text-slate-600">{message}</p>
        </div>

        <button
          onClick={() => setPaymentStep('select')}
          className="mt-6 w-full inline-flex items-center justify-center rounded-lg bg-emerald-600 px-5 py-3 text-sm font-semibold text-white hover:bg-emerald-700"
        >
          Try Again
        </button>
      </div>
    );
  }

  // Step 6: Expired/Retry
  if (paymentStep === 'expired') {
    return (
      <div className="rounded-xl bg-amber-50 p-8 shadow-sm border border-amber-200">
        <div className="text-center">
          <div className="text-4xl mb-4">⏱</div>
          <h1 className="text-2xl font-bold text-amber-700">Payment Time Expired</h1>
          <p className="mt-2 text-slate-600">Your payment session has expired.</p>

          {retryInfo && retryInfo.canRetry ? (
            <>
              {retryInfo.freezeTime > 0 && (
                <p className="mt-4 text-sm text-slate-600">
                  For {selectedMethod}, please wait before retrying (freeze period).
                </p>
              )}
              <button
                onClick={handleRetry}
                disabled={loading || (retryInfo && retryInfo.retryAvailableAt > new Date())}
                className="mt-6 w-full inline-flex items-center justify-center rounded-lg bg-emerald-600 px-5 py-3 text-sm font-semibold text-white hover:bg-emerald-700 disabled:bg-slate-400"
              >
                {loading ? 'Processing...' : `Retry Payment (${retryInfo.retryAvailableAt > new Date() ? 'Wait...' : 'Ready'})`}
              </button>
            </>
          ) : (
            <p className="mt-4 text-red-600 font-medium">Maximum retries exceeded. Please contact support.</p>
          )}

          <button
            onClick={() => setPaymentStep('select')}
            className="mt-3 w-full inline-flex items-center justify-center rounded-lg border border-slate-300 px-5 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            Start Over
          </button>
        </div>
      </div>
    );
  }

  return null;
}
