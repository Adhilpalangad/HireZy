const express = require('express');
const router = express.Router();
const jobController = require('../controllers/jobController');
const authMiddleware = require('../middleware/authMiddleware');

// Recruiter job routes
router.get('/', jobController.getAllJobs);
router.post('/', authMiddleware, jobController.createJob);
router.get('/recruiter/:posterId', jobController.getJobsByRecruiter);

// Community / user-side local job request routes
router.get('/community', jobController.getCommunityRequests);
router.post('/community', authMiddleware, jobController.createCommunityRequest);
router.get('/community/user/:posterId', jobController.getCommunityRequestsByUser);

module.exports = router;
