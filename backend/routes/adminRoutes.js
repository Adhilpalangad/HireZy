const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const adminController = require('../controllers/adminController');

// Basic admin guard — check that the JWT role is admin
const adminOnly = (req, res, next) => {
  if (req.user?.role !== 'admin') {
    return res.status(403).json({ message: 'Admin access required' });
  }
  next();
};

// GET  /api/admin/verifications
router.get('/verifications', authMiddleware, adminOnly, adminController.getVerifications);

// POST /api/admin/verifications/:userId/approve
router.post('/verifications/:userId/approve', authMiddleware, adminOnly, adminController.approveVerification);

// POST /api/admin/verifications/:userId/reject
router.post('/verifications/:userId/reject', authMiddleware, adminOnly, adminController.rejectVerification);

module.exports = router;
