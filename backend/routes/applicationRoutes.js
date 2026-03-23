const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const applicationController = require('../controllers/applicationController');

// All application routes require authentication
router.use(authMiddleware);

// Seeker routes
router.post('/apply', applicationController.applyForJob);
router.get('/seeker/me', applicationController.getMyApplications);

// Recruiter routes
router.get('/recruiter/all', applicationController.getRecruiterApplications);
router.get('/job/:jobId', applicationController.getJobApplications);
router.put('/:id/status', applicationController.updateApplicationStatus);
router.put('/:id/schedule', authMiddleware, applicationController.scheduleInterview);

module.exports = router;
