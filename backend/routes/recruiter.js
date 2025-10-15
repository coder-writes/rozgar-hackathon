
import express from 'express';
import {
    getRecruiterProfile,
    createRecruiterProfile,
    updateRecruiterProfile,
    getAllRecruiters,
    getRecruiterById,
    deleteRecruiterProfile,
} from '../controllers/recruiterController.js';
import { authMiddleware, isRecruiter } from '../middleware/userAuth.js';

const router = express.Router();

// Protected routes (require authentication AND recruiter role)
router.get('/profile', authMiddleware, isRecruiter, getRecruiterProfile);
router.post('/profile', authMiddleware, isRecruiter, createRecruiterProfile);
router.put('/profile', authMiddleware, isRecruiter, updateRecruiterProfile);
router.delete('/profile', authMiddleware, isRecruiter, deleteRecruiterProfile);

// Public routes
router.get('/', getAllRecruiters);
router.get('/:id', getRecruiterById);

// Job routes - Mock data - replace with actual database queries
router.get('/jobs', authMiddleware, isRecruiter, async (req, res) => {
  try {
    // TODO: Fetch jobs posted by the recruiter from the database
    // For now, returning mock data
    const jobs = [
      {
        _id: '1',
        title: 'Senior Full Stack Developer',
        company: 'Tech Corp',
        location: 'San Francisco, CA',
        type: 'Full-time',
        salary: '$120k - $160k/year',
        description: 'We are looking for an experienced full stack developer...',
        requirements: ['5+ years experience', 'React/Node.js expertise', 'Leadership skills'],
        postedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        applicantsCount: 15,
        status: 'active',
        recruiterId: req.user._id
      }
    ];

    res.json({
      success: true,
      data: jobs
    });
  } catch (error) {
    console.error('Error fetching recruiter jobs:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch jobs'
    });
  }
});

router.post('/jobs', authMiddleware, isRecruiter, async (req, res) => {
  try {
    const { title, company, location, type, salary, description, requirements } = req.body;

    // Validation
    if (!title || !company || !location || !description) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields'
      });
    }

    // TODO: Save job to database
    const newJob = {
      _id: Date.now().toString(),
      title,
      company,
      location,
      type: type || 'Full-time',
      salary,
      description,
      requirements: requirements || [],
      postedAt: new Date().toISOString(),
      applicantsCount: 0,
      status: 'active',
      recruiterId: req.user._id
    };

    res.status(201).json({
      success: true,
      data: newJob,
      message: 'Job posted successfully'
    });
  } catch (error) {
    console.error('Error creating job:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create job'
    });
  }
});

router.get('/jobs/:id', authMiddleware, isRecruiter, async (req, res) => {
  try {
    const { id } = req.params;

    // TODO: Fetch job by ID from database
    const job = {
      _id: id,
      title: 'Senior Full Stack Developer',
      company: 'Tech Corp',
      location: 'San Francisco, CA',
      type: 'Full-time',
      salary: '$120k - $160k/year',
      description: 'We are looking for an experienced full stack developer...',
      requirements: ['5+ years experience', 'React/Node.js expertise', 'Leadership skills'],
      postedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      applicantsCount: 15,
      status: 'active',
      recruiterId: req.user._id
    };

    res.json({
      success: true,
      data: job
    });
  } catch (error) {
    console.error('Error fetching job:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch job'
    });
  }
});

router.get('/jobs/:id/applicants', authMiddleware, isRecruiter, async (req, res) => {
  try {
    const { id } = req.params;

    // TODO: Fetch applicants for this job from database
    const applicants = [
      {
        _id: '1',
        user: {
          _id: 'user1',
          name: 'John Doe',
          email: 'john.doe@example.com',
          profile: {
            headline: 'Senior Software Engineer',
            location: 'San Francisco, CA'
          }
        },
        job: id,
        status: 'pending',
        coverLetter: 'I am very interested in this position...',
        resume: '/uploads/resumes/johndoe-resume.pdf',
        appliedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        _id: '2',
        user: {
          _id: 'user2',
          name: 'Jane Smith',
          email: 'jane.smith@example.com',
          profile: {
            headline: 'Full Stack Developer',
            location: 'New York, NY'
          }
        },
        job: id,
        status: 'reviewed',
        coverLetter: 'With 6 years of experience in React and Node.js...',
        resume: '/uploads/resumes/janesmith-resume.pdf',
        appliedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
      }
    ];

    res.json({
      success: true,
      data: applicants
    });
  } catch (error) {
    console.error('Error fetching applicants:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch applicants'
    });
  }
});

router.put('/jobs/:id', authMiddleware, isRecruiter, async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    // TODO: Update job in database
    const updatedJob = {
      _id: id,
      ...updates,
      recruiterId: req.user._id
    };

    res.json({
      success: true,
      data: updatedJob,
      message: 'Job updated successfully'
    });
  } catch (error) {
    console.error('Error updating job:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update job'
    });
  }
});

router.delete('/jobs/:id', authMiddleware, isRecruiter, async (req, res) => {
  try {
    const { id } = req.params;

    // TODO: Delete job from database

    res.json({
      success: true,
      message: 'Job deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting job:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete job'
    });
  }
});

export default router;