const Application = require('../models/Application');
const Job = require('../models/Job');
const User = require('../models/User');
const Conversation = require('../models/Conversation');
const Message = require('../models/Message');

// POST /api/applications/apply — Seeker applies for a job
exports.applyForJob = async (req, res) => {
  try {
    const { jobId, coverMessage, selectedTimeSlot } = req.body;
    const seekerId = req.user.userId;

    const job = await Job.findById(jobId);
    if (!job) return res.status(404).json({ message: 'Job not found.' });

    const seeker = await User.findById(seekerId);
    if (!seeker) return res.status(404).json({ message: 'User not found.' });

    // Prevent duplicate applications
    const existing = await Application.findOne({ jobId, seekerId });
    if (existing) {
      return res.status(400).json({ message: 'You have already applied for this job.' });
    }

    const application = new Application({
      jobId: job._id,
      jobTitle: job.title,
      seekerId: seeker._id,
      seekerName: seeker.name,
      recruiterId: job.posterId,
      coverMessage: coverMessage || '',
      selectedTimeSlot: selectedTimeSlot || '',
      status: 'pending'
    });

    await application.save();

    // Auto-start or fetch chat conversation
    let conversation = await Conversation.findOne({
      participants: { $all: [seekerId, job.posterId] }
    });

    if (!conversation) {
      conversation = new Conversation({
        participants: [seekerId, job.posterId],
        jobId: job._id,
        jobTitle: job.title
      });
      await conversation.save();
    }

    if (coverMessage) {
      const message = new Message({
        conversationId: conversation._id,
        senderId: seekerId,
        senderName: seeker.name,
        content: `Applying for ${job.title}: ${coverMessage}`
      });
      await message.save();

      conversation.lastMessage = message.content;
      conversation.lastSenderId = seekerId;
      await conversation.save();
    }

    res.status(201).json({ message: 'Application submitted successfully', application, conversation });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: 'You have already applied for this job.' });
    }
    console.error('Apply Error:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// GET /api/applications/job/:jobId — Recruiter gets applications for a specific job
exports.getJobApplications = async (req, res) => {
  try {
    const { jobId } = req.params;
    const applications = await Application.find({ jobId }).sort({ createdAt: -1 });
    res.json(applications);
  } catch (error) {
    console.error('Get Job Applications Error:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// GET /api/applications/recruiter — Recruiter gets ALL applications for their posted jobs
exports.getRecruiterApplications = async (req, res) => {
  try {
    const recruiterId = req.user.userId;
    const applications = await Application.find({ recruiterId }).sort({ createdAt: -1 });
    res.json(applications);
  } catch (error) {
    console.error('Get Recruiter Applications Error:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// GET /api/applications/seeker — Seeker gets their own applications
exports.getMyApplications = async (req, res) => {
  try {
    const seekerId = req.user.userId;
    const applications = await Application.find({ seekerId }).sort({ createdAt: -1 });
    res.json(applications);
  } catch (error) {
    console.error('Get My Applications Error:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// PUT /api/applications/:id/status — Recruiter updates status
exports.updateApplicationStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, paymentStatus } = req.body;
    
    if (status && !['pending', 'accepted', 'rejected'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const application = await Application.findById(id);
    if (!application) return res.status(404).json({ message: 'Application not found' });

    // Check authorization: only the recruiter of this job can update it
    if (application.recruiterId.toString() !== req.user.userId.toString()) {
      return res.status(403).json({ message: 'Unauthorized to update this application' });
    }

    if (status) application.status = status;
    if (paymentStatus) application.paymentStatus = paymentStatus;
    
    await application.save();
    res.json(application);
  } catch (error) {
    console.error('Update Application Error:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// PUT /api/applications/:id/schedule — Recruiter schedules interview, generating a GMeet link
exports.scheduleInterview = async (req, res) => {
  try {
    const { id } = req.params;
    const recruiterId = req.user.userId;

    // We verify the application exists and belongs to this recruiter's job
    const application = await Application.findById(id);
    if (!application || application.recruiterId.toString() !== recruiterId.toString()) {
      return res.status(404).json({ message: 'Application not found or unauthorized' });
    }

    // Generate the internal Video Call link mapped to this specific application ID
    application.meetLink = `http://localhost:5173/video-call/${application._id}`;
    await application.save();

    res.json({ message: 'Interview scheduled successfully', meetLink: application.meetLink, application });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error' });
  }
};
