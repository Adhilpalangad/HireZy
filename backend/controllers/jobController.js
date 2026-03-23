const Job = require('../models/Job');
const User = require('../models/User');

// Get all jobs (recruiter-posted, for explore)
exports.getAllJobs = async (req, res) => {
  try {
    const jobs = await Job.find({ postedByRole: 'recruiter' }).sort({ createdAt: -1 });
    res.json(jobs);
  } catch (error) {
    console.error('Error fetching jobs', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// Get community / user-posted local job requests
exports.getCommunityRequests = async (req, res) => {
  try {
    const jobs = await Job.find({ postedByRole: 'user' }).sort({ createdAt: -1 });
    res.json(jobs);
  } catch (error) {
    console.error('Error fetching community jobs', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// Create a job (recruiter side — existing)
exports.createJob = async (req, res) => {
  try {
    const { title, type, location, budget, description, posterName, posterId } = req.body;

    const newJob = new Job({
      posterId: req.user.userId, // Assuming req.user.userId is available from auth middleware
      title,
      type,
      location,
      budget,
      description,
      posterName: posterName || 'Unknown Poster',
      postedByRole: 'recruiter',
      isShortTerm: req.body.isShortTerm || false,
      requiresAdvance: req.body.requiresAdvance || false,
      availableTimeSlots: req.body.availableTimeSlots || []
    });

    const savedJob = await newJob.save();
    res.status(201).json(savedJob);
  } catch (error) {
    console.error('Error creating job', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// Create a community local job request (seeker/user side — NEW)
exports.createCommunityRequest = async (req, res) => {
  try {
    const { title, location, budget, description, peopleNeeded, urgency } = req.body;

    if (!title || !budget) {
      return res.status(400).json({ message: 'Title and budget are required.' });
    }

    const user = await User.findById(req.user.userId).select('name');
    if (!user) return res.status(404).json({ message: 'User not found.' });

    const newJob = new Job({
      posterId: req.user.userId,
      title,
      type: 'Local Task',
      location: location || 'On-site',
      budget,
      description: description || '',
      posterName: user.name,
      peopleNeeded: peopleNeeded || 1,
      urgency: urgency || 'Flexible',
      postedByRole: 'user', // Changed from 'seeker' to 'user' to match existing schema usage
      isShortTerm: req.body.isShortTerm || false,
      requiresAdvance: req.body.requiresAdvance || false,
      availableTimeSlots: req.body.availableTimeSlots || []
    });

    const savedJob = await newJob.save();
    res.status(201).json(savedJob);
  } catch (error) {
    console.error('Error creating community request', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// Get jobs by recruiter
exports.getJobsByRecruiter = async (req, res) => {
  try {
    const { posterId } = req.params;
    const jobs = await Job.find({ posterId, postedByRole: 'recruiter' }).sort({ createdAt: -1 });
    res.json(jobs);
  } catch (error) {
    console.error('Error fetching recruiter jobs:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// Get community requests posted by a specific user
exports.getCommunityRequestsByUser = async (req, res) => {
  try {
    const { posterId } = req.params;
    const jobs = await Job.find({ posterId, postedByRole: 'user' }).sort({ createdAt: -1 });
    res.json(jobs);
  } catch (error) {
    console.error('Error fetching user requests:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};
