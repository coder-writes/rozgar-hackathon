import express from 'express';
import JobApplication from '../models/JobApplication.js';
import JobRecommendation from '../models/JobRecommendation.js';
import { CourseProgress } from '../models/Course.js';
import Community from '../models/Community.js';
import Post from '../models/Post.js';
import { authMiddleware } from '../middleware/userAuth.js';

const router = express.Router();

// Get dashboard overview data
router.get('/overview', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.userId;

    // Get dashboard stats in parallel
    const [
      applicationCount,
      recommendationCount,
      activeCourseCount,
      joinedCommunitiesCount
    ] = await Promise.all([
      JobApplication.countDocuments({ applicant: userId, isArchived: false }),
      JobRecommendation.countDocuments({ user: userId, status: 'active' }),
      CourseProgress.countDocuments({ user: userId, status: { $in: ['enrolled', 'in-progress'] } }),
      Community.countDocuments({ 'members.user': userId })
    ]);

    res.json({
      success: true,
      data: {
        applications: applicationCount,
        recommendations: recommendationCount,
        activeCourses: activeCourseCount,
        joinedCommunities: joinedCommunitiesCount
      }
    });
  } catch (error) {
    console.error('Dashboard overview error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch dashboard overview',
      error: error.message
    });
  }
});

// Get recent job applications
router.get('/applications', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.userId;
    const limit = parseInt(req.query.limit) || 10;

    const applications = await JobApplication.find({ 
      applicant: userId, 
      isArchived: false 
    })
    .populate('jobPost', 'title metadata community')
    .sort({ createdAt: -1 })
    .limit(limit);

    // Format the response
    const formattedApplications = applications.map(app => ({
      id: app._id,
      jobTitle: app.jobTitle,
      company: app.company,
      location: app.location,
      salary: app.salary,
      type: app.jobType,
      status: app.status,
      appliedDate: app.createdAt,
      daysSinceApplication: app.daysSinceApplication,
      nextInterview: app.getNextInterview(),
      upcomingDeadlines: app.getUpcomingDeadlines(),
      priority: app.priority
    }));

    res.json({
      success: true,
      data: formattedApplications
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

// Get job recommendations
router.get('/recommendations', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.userId;
    const limit = parseInt(req.query.limit) || 10;

    // Generate new recommendations if needed
    await JobRecommendation.generateForUser(userId, 20);

    // Get active recommendations
    const recommendations = await JobRecommendation.getActiveForUser(userId, limit);

    // Format the response
    const formattedRecommendations = recommendations.map(rec => ({
      id: rec._id,
      jobId: rec.jobPost._id,
      title: rec.jobPost.title,
      company: rec.jobPost.metadata?.company,
      location: rec.jobPost.metadata?.location,
      salary: rec.jobPost.metadata?.salary,
      type: rec.jobPost.metadata?.jobType,
      matchScore: rec.matchScore,
      matchFactors: rec.matchFactors,
      reason: rec.reason,
      postedDate: rec.jobPost.createdAt,
      description: rec.jobPost.content.substring(0, 200) + '...',
      skills: rec.jobPost.tags || [],
      hasViewed: rec.interactions.viewed,
      hasClicked: rec.interactions.clicked
    }));

    res.json({
      success: true,
      data: formattedRecommendations
    });
  } catch (error) {
    console.error('Get recommendations error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch recommendations',
      error: error.message
    });
  }
});

// Get ongoing courses
router.get('/courses', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.userId;
    const limit = parseInt(req.query.limit) || 10;

    const courseProgress = await CourseProgress.find({
      user: userId,
      status: { $in: ['enrolled', 'in-progress'] }
    })
    .populate('course', 'title instructor curriculum thumbnail difficulty pricing')
    .sort({ lastAccessedAt: -1 })
    .limit(limit);

    // Format the response
    const formattedCourses = await Promise.all(courseProgress.map(async (progress) => {
      const nextLesson = await progress.getNextLesson();
      
      return {
        id: progress._id,
        courseId: progress.course._id,
        title: progress.course.title,
        instructor: progress.course.instructor.name,
        progress: progress.progress.percentage,
        totalLessons: progress.course.totalLessons,
        completedLessons: progress.progress.lessonsCompleted.length,
        estimatedTime: calculateEstimatedTime(progress),
        nextLesson: nextLesson?.lesson?.title || 'Course completed',
        difficulty: progress.course.difficulty,
        thumbnail: progress.course.thumbnail?.url,
        lastAccessedAt: progress.lastAccessedAt,
        timeSpent: progress.timeSpent,
        status: progress.status
      };
    }));

    res.json({
      success: true,
      data: formattedCourses
    });
  } catch (error) {
    console.error('Get courses error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch courses',
      error: error.message
    });
  }
});

// Get application statistics by status
router.get('/applications/stats', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.userId;

    const stats = await JobApplication.aggregate([
      { $match: { applicant: userId, isArchived: false } },
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);

    const statusCounts = {
      applied: 0,
      reviewing: 0,
      interview: 0,
      rejected: 0,
      offered: 0,
      accepted: 0
    };

    stats.forEach(stat => {
      statusCounts[stat._id] = stat.count;
    });

    res.json({
      success: true,
      data: statusCounts
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

// Mark recommendation as viewed
router.put('/recommendations/:id/view', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.userId;
    const recommendationId = req.params.id;

    const recommendation = await JobRecommendation.findOne({
      _id: recommendationId,
      user: userId
    });

    if (!recommendation) {
      return res.status(404).json({
        success: false,
        message: 'Recommendation not found'
      });
    }

    await recommendation.markAsViewed();

    res.json({
      success: true,
      message: 'Recommendation marked as viewed'
    });
  } catch (error) {
    console.error('Mark recommendation viewed error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to mark recommendation as viewed',
      error: error.message
    });
  }
});

// Mark recommendation as clicked
router.put('/recommendations/:id/click', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.userId;
    const recommendationId = req.params.id;

    const recommendation = await JobRecommendation.findOne({
      _id: recommendationId,
      user: userId
    });

    if (!recommendation) {
      return res.status(404).json({
        success: false,
        message: 'Recommendation not found'
      });
    }

    await recommendation.markAsClicked();

    res.json({
      success: true,
      message: 'Recommendation marked as clicked'
    });
  } catch (error) {
    console.error('Mark recommendation clicked error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to mark recommendation as clicked',
      error: error.message
    });
  }
});

// Helper function to calculate estimated time remaining for course
function calculateEstimatedTime(progress) {
  const remainingLessons = progress.course.totalLessons - progress.progress.lessonsCompleted.length;
  
  if (remainingLessons <= 0) return 'Completed';
  
  // Estimate based on average lesson duration and user's learning pace
  const avgLessonDuration = progress.course.totalDuration / progress.course.totalLessons || 20; // 20 min default
  const estimatedMinutes = remainingLessons * avgLessonDuration;
  
  if (estimatedMinutes < 60) return `${Math.round(estimatedMinutes)} minutes remaining`;
  if (estimatedMinutes < 1440) return `${Math.round(estimatedMinutes / 60)} hours remaining`;
  
  const days = Math.round(estimatedMinutes / 1440);
  if (days < 7) return `${days} days remaining`;
  
  const weeks = Math.round(days / 7);
  return `${weeks} week${weeks > 1 ? 's' : ''} remaining`;
}

export default router;
