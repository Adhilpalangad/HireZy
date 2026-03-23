const Razorpay = require('razorpay');
const crypto = require('crypto');
const Application = require('../models/Application');
const Job = require('../models/Job');

const razorpayInstance = new Razorpay({
  key_id: 'rzp_test_SUlJzVSZSZliA2',
  key_secret: 'gblVAfO5bozCme1jSKW7Udyi',
});

// POST /api/payment/create-order
exports.createOrder = async (req, res) => {
  try {
    const { applicationId } = req.body;
    
    // Validate
    const application = await Application.findById(applicationId);
    if (!application) return res.status(404).json({ message: 'Application not found' });
    
    const job = await Job.findById(application.jobId);
    if (!job) return res.status(404).json({ message: 'Job not found' });

    // Assuming job.budget is a simple string like "$500" or "5000 INR" or a number.
    // For prototype, we extract numbers and take 50%.
    const rawBudget = job.budget.replace(/[^0-9]/g, '');
    let numBudget = parseInt(rawBudget, 10);
    
    // Fallback if empty parsing
    if (!numBudget || numBudget <= 0) {
      numBudget = 1000; 
    }

    // 50% advance in smallest currency unit (paise)
    const amountInPaise = Math.round((numBudget * 0.5) * 100);

    const options = {
      amount: amountInPaise,
      currency: "INR",
      receipt: `receipt_order_${applicationId}`
    };

    const order = await razorpayInstance.orders.create(options);

    // Update application to show payment is requested
    application.paymentStatus = 'requested';
    await application.save();

    res.json({
      success: true,
      order,
      application
    });
  } catch (err) {
    console.error('Order creation error:', err);
    res.status(500).json({ message: 'Failed to create Razorpay order' });
  }
};

// POST /api/payment/verify
exports.verifyPayment = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, applicationId } = req.body;

    const body = razorpay_order_id + "|" + razorpay_payment_id;
    
    const expectedSignature = crypto
      .createHmac('sha256', 'gblVAfO5bozCme1jSKW7Udyi')
      .update(body.toString())
      .digest('hex');

    const isAuthentic = expectedSignature === razorpay_signature;

    if (isAuthentic) {
      // Payment successful
      const application = await Application.findById(applicationId);
      if (application) {
        application.paymentStatus = 'paid';
        await application.save();
      }
      res.json({ success: true, message: 'Payment verified successfully.' });
    } else {
      res.status(400).json({ success: false, message: 'Payment verification failed' });
    }
  } catch (err) {
    console.error('Verification error:', err);
    res.status(500).json({ message: 'Server verification error' });
  }
};
