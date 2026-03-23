const User = require('../models/User');

// GET /api/admin/verifications - list pending verification requests
exports.getVerifications = async (req, res) => {
  try {
    const users = await User.find({
      verificationStatus: { $in: ['pending', 'approved', 'rejected'] }
    })
      .select('-password')
      .sort({ updatedAt: -1 });

    res.json(users);
  } catch (err) {
    console.error('Error fetching verifications:', err);
    res.status(500).json({ message: 'Server Error' });
  }
};

// POST /api/admin/verifications/:userId/approve
exports.approveVerification = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.userId,
      { isVerified: true, verificationStatus: 'approved' },
      { returnDocument: 'after' }
    ).select('-password');

    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({ message: 'User approved successfully', user });
  } catch (err) {
    console.error('Error approving user:', err);
    res.status(500).json({ message: 'Server Error' });
  }
};

// POST /api/admin/verifications/:userId/reject
exports.rejectVerification = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.userId,
      { isVerified: false, verificationStatus: 'rejected' },
      { returnDocument: 'after' }
    ).select('-password');

    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({ message: 'User rejected', user });
  } catch (err) {
    console.error('Error rejecting user:', err);
    res.status(500).json({ message: 'Server Error' });
  }
};
