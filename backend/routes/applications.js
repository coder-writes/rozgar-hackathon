import express from 'express';
import JobApplication from '../models/JobApplication.js';
import Post from '../models/Post.js';
import { authMiddleware } from '../middleware/userAuth.js';

const router = express.Router();

// Get all applications for the user
router.get('/', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.userId;
    const {
      page = 1,
      limit = 10,
      status,
      sort = 'createdAt',
      order = 'desc'
    } = req.query;

    const query = { applicant: userId, isArchived: false };
    
    // Add status filter
    if (status && status !== 'all') {
      query.status = status;
    }

    // Define sort options
    const sortOption = {};
    sortOption[sort] = order === 'desc' ? -1 : 1;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [applications, totalCount] = await Promise.all([
      JobApplication.find(query)
        .populate('jobPost', 'title content metadata community')
        .sort(sortOption)
        .skip(skip)
        .limit(parseInt(limit)),
      JobApplication.countDocuments(query)
    ]);

    // Format applications
    const formattedApplications = applications.map(app => ({
      id: app._id,
      jobTitle: app.jobTitle,
      company: app.company,
      location: app.location,
      salary: app.salary,
      type: app.jobType,
      status: app.status,
      priority: app.priority,
      appliedDate: app.createdAt,
      daysSinceApplication: app.daysSinceApplication,
      applicationMethod: app.applicationMethod,
      applicationUrl: app.applicationUrl,
      notes: app.notes,
      nextInterview: app.getNextInterview(),
      upcomingDeadlines: app.getUpcomingDeadlines(),
      statusHistory: app.statusHistory,
      interviews: app.interviews,
      followUps: app.followUps,
      recruiterContact: app.recruiterContact,
      jobPost: app.jobPost ? {
        id: app.jobPost._id,
        title: app.jobPost.title,
        company: app.jobPost.metadata?.company,
        location: app.jobPost.metadata?.location
      } : null
    }));

    res.json({
      success: true,
      data: {
        applications: formattedApplications,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: totalCount,
          pages: Math.ceil(totalCount / parseInt(limit))
        }
      }
    });
  } catch (error) {
    console.error('Get applications error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch applications',
      error: error.message
    });
  }
});

// Get single application details
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.userId;
    const applicationId = req.params.id;

    const application = await JobApplication.findOne({
      _id: applicationId,
      applicant: userId
    }).populate('jobPost', 'title content metadata community');

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found'
      });
    }

    const formattedApplication = {
      id: application._id,
      jobTitle: application.jobTitle,
      company: application.company,
      location: application.location,
      salary: application.salary,
      type: application.jobType,
      status: application.status,
      priority: application.priority,
      appliedDate: application.createdAt,
      daysSinceApplication: application.daysSinceApplication,
      applicationMethod: application.applicationMethod,
      applicationUrl: application.applicationUrl,
      coverLetter: application.coverLetter,
      resume: application.resume,
      notes: application.notes,
      nextInterview: application.getNextInterview(),
      upcomingDeadlines: application.getUpcomingDeadlines(),
      statusHistory: application.statusHistory,
      interviews: application.interviews,
      followUps: application.followUps,
      deadlines: application.deadlines,
      recruiterContact: application.recruiterContact,
      expectedSalary: application.expectedSalary,
      jobPost: application.jobPost
    };

    res.json({
      success: true,
      data: formattedApplication
    });
  } catch (error) {
    console.error('Get application details error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch application details',
      error: error.message
    });
  }
});

// Create a new job application
router.post('/', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.userId;
    const {
      jobPostId,
      jobTitle,
      company,
      location,
      salary,
      jobType,
      applicationMethod = 'platform',
      applicationUrl,
      coverLetter,
      notes,
      recruiterContact,
      expectedSalary,
      priority = 'medium'
    } = req.body;

    // Validate required fields
    if (!jobTitle || !company || !location || !jobType) {
      return res.status(400).json({
        success: false,
        message: 'Job title, company, location, and job type are required'
      });
    }

    // Check if application already exists for this job post
    if (jobPostId) {
      const existingApplication = await JobApplication.findOne({
        applicant: userId,
        jobPost: jobPostId
      });

      if (existingApplication) {
        return res.status(400).json({
          success: false,
          message: 'You have already applied for this job'
        });
      }
    }

    // Create new application
    const application = new JobApplication({
      applicant: userId,
      jobPost: jobPostId,
      jobTitle,
      company,
      location,
      salary,
      jobType,
      applicationMethod,
      applicationUrl,
      coverLetter,
      notes,
      recruiterContact,
      expectedSalary,
      priority,
      statusHistory: [{
        status: 'applied',
        date: new Date(),
        note: 'Application submitted'
      }]
    });

    await application.save();

    res.status(201).json({
      success: true,
      message: 'Application created successfully',
      data: {
        id: application._id,
        status: application.status,
        appliedDate: application.createdAt
      }
    });
  } catch (error) {
    console.error('Create application error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create application',
      error: error.message
    });
  }
});

// Update application status
router.put('/:id/status', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.userId;
    const applicationId = req.params.id;
    const { status, note } = req.body;

    const validStatuses = ['applied', 'reviewing', 'interview', 'rejected', 'offered', 'accepted', 'withdrawn'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status value'
      });
    }

    const application = await JobApplication.findOne({
      _id: applicationId,
      applicant: userId
    });

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found'
      });
    }

    // Update status
    application.status = status;
    if (note) {
      application.statusHistory[application.statusHistory.length - 1].note = note;
    }

    await application.save();

    res.json({
      success: true,
      message: 'Application status updated successfully',
      data: {
        status: application.status,
        statusHistory: application.statusHistory
      }
    });
  } catch (error) {
    console.error('Update application status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update application status',
      error: error.message
    });
  }
});

// Get interviews for application
router.get('/:id/interviews', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.userId;
    const applicationId = req.params.id;

    const application = await JobApplication.findOne({
      _id: applicationId,
      applicant: userId
    });

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found'
      });
    }

    res.json({
      success: true,
      data: {
        interviews: application.interviews,
        nextInterview: application.getNextInterview()
      }
    });
  } catch (error) {
    console.error('Get interviews error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch interviews',
      error: error.message
    });
  }
});

// Add interview to application
router.post('/:id/interviews', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.userId;
    const applicationId = req.params.id;
    const {
      type,
      scheduledDate,
      duration,
      interviewer,
      location: interviewLocation
    } = req.body;

    const application = await JobApplication.findOne({
      _id: applicationId,
      applicant: userId
    });

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found'
      });
    }

    // Add interview
    application.interviews.push({
      type,
      scheduledDate: new Date(scheduledDate),
      duration,
      interviewer,
      location: interviewLocation,
      status: 'scheduled'
    });

    // Update application status to interview if not already
    if (application.status === 'applied' || application.status === 'reviewing') {
      application.status = 'interview';
    }

    await application.save();

    res.json({
      success: true,
      message: 'Interview added successfully',
      data: {
        interview: application.interviews[application.interviews.length - 1],
        nextInterview: application.getNextInterview()
      }
    });
  } catch (error) {
    console.error('Add interview error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add interview',
      error: error.message
    });
  }
});

// Get follow-ups for application
router.get('/:id/followups', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.userId;
    const applicationId = req.params.id;

    const application = await JobApplication.findOne({
      _id: applicationId,
      applicant: userId
    });

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found'
      });
    }

    res.json({
      success: true,
      data: {
        followUps: application.followUps
      }
    });
  } catch (error) {
    console.error('Get follow-ups error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch follow-ups',
      error: error.message
    });
  }
});

// Add follow-up to application
router.post('/:id/followups', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.userId;
    const applicationId = req.params.id;
    const { type, description, response } = req.body;

    const application = await JobApplication.findOne({
      _id: applicationId,
      applicant: userId
    });

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found'
      });
    }

    // Add follow-up
    application.followUps.push({
      type,
      description,
      response,
      date: new Date()
    });

    await application.save();

    res.json({
      success: true,
      message: 'Follow-up added successfully',
      data: {
        followUp: application.followUps[application.followUps.length - 1]
      }
    });
  } catch (error) {
    console.error('Add follow-up error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add follow-up',
      error: error.message
    });
  }
});

// Add deadline to application
router.post('/:id/deadlines', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.userId;
    const applicationId = req.params.id;
    const { type, date, description } = req.body;

    const application = await JobApplication.findOne({
      _id: applicationId,
      applicant: userId
    });

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found'
      });
    }

    // Add deadline
    application.deadlines.push({
      type,
      date: new Date(date),
      description,
      isCompleted: false
    });

    await application.save();

    res.json({
      success: true,
      message: 'Deadline added successfully',
      data: {
        deadline: application.deadlines[application.deadlines.length - 1],
        upcomingDeadlines: application.getUpcomingDeadlines()
      }
    });
  } catch (error) {
    console.error('Add deadline error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add deadline',
      error: error.message
    });
  }
});

// Get application notes
router.get('/:id/notes', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.userId;
    const applicationId = req.params.id;

    const application = await JobApplication.findOne({
      _id: applicationId,
      applicant: userId
    });

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found'
      });
    }

    res.json({
      success: true,
      data: {
        notes: application.notes
      }
    });
  } catch (error) {
    console.error('Get notes error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch notes',
      error: error.message
    });
  }
});

// Update application notes
router.put('/:id/notes', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.userId;
    const applicationId = req.params.id;
    const { notes } = req.body;

    const application = await JobApplication.findOne({
      _id: applicationId,
      applicant: userId
    });

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found'
      });
    }

    application.notes = notes;
    await application.save();

    res.json({
      success: true,
      message: 'Notes updated successfully',
      data: {
        notes: application.notes
      }
    });
  } catch (error) {
    console.error('Update notes error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update notes',
      error: error.message
    });
  }
});

// Archive/Unarchive application
router.put('/:id/archive', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.userId;
    const applicationId = req.params.id;
    const { archived = true } = req.body;

    const application = await JobApplication.findOne({
      _id: applicationId,
      applicant: userId
    });

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found'
      });
    }

    application.isArchived = archived;
    await application.save();

    res.json({
      success: true,
      message: `Application ${archived ? 'archived' : 'unarchived'} successfully`,
      data: {
        isArchived: application.isArchived
      }
    });
  } catch (error) {
    console.error('Archive application error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to archive application',
      error: error.message
    });
  }
});

// Delete application
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.userId;
    const applicationId = req.params.id;

    const application = await JobApplication.findOneAndDelete({
      _id: applicationId,
      applicant: userId
    });

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found'
      });
    }

    res.json({
      success: true,
      message: 'Application deleted successfully'
    });
  } catch (error) {
    console.error('Delete application error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete application',
      error: error.message
    });
  }
});

// Get application statistics
router.get('/stats/overview', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.userId;

    const [statusStats, monthlyStats] = await Promise.all([
      // Status distribution
      JobApplication.aggregate([
        { $match: { applicant: userId, isArchived: false } },
        { $group: { _id: '$status', count: { $sum: 1 } } }
      ]),
      
      // Monthly application count (last 6 months)
      JobApplication.aggregate([
        {
          $match: {
            applicant: userId,
            isArchived: false,
            createdAt: { $gte: new Date(Date.now() - 6 * 30 * 24 * 60 * 60 * 1000) }
          }
        },
        {
          $group: {
            _id: {
              year: { $year: '$createdAt' },
              month: { $month: '$createdAt' }
            },
            count: { $sum: 1 }
          }
        },
        { $sort: { '_id.year': 1, '_id.month': 1 } }
      ])
    ]);

    // Format status stats
    const statusCounts = {
      applied: 0,
      reviewing: 0,
      interview: 0,
      rejected: 0,
      offered: 0,
      accepted: 0,
      withdrawn: 0
    };

    statusStats.forEach(stat => {
      statusCounts[stat._id] = stat.count;
    });

    res.json({
      success: true,
      data: {
        statusDistribution: statusCounts,
        monthlyApplications: monthlyStats,
        totalApplications: Object.values(statusCounts).reduce((sum, count) => sum + count, 0)
      }
    });
  } catch (error) {
    console.error('Get application stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch application statistics',
      error: error.message
    });
  }
});

export default router;
