const User = require('../models/User');

// POST /api/verify/submit
exports.submitVerification = async (req, res) => {
  try {
    const { phone, city } = req.body;
    const userId = req.user.userId;

    if (!phone || !city) {
      return res.status(400).json({ message: 'Phone and city are required.' });
    }

    if (!req.file) {
      return res.status(400).json({ message: 'Government ID upload is required.' });
    }

    const govIdUrl = `/uploads/${req.file.filename}`;

    const user = await User.findByIdAndUpdate(
      userId,
      {
        phone,
        city,
        govIdUrl,
        verificationStatus: 'pending', // pending admin review
        isVerified: false              // admin must approve
      },
      { returnDocument: 'after' }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    // Update localStorage-cached user on client side by returning fresh user data
    res.json({
      message: 'Verification submitted successfully!',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isVerified: user.isVerified
      }
    });
  } catch (err) {
    console.error('Verification error:', err);
    res.status(500).json({ message: 'Server error during verification.' });
  }
};
