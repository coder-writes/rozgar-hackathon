import express from 'express';
import Community from '../models/Community.js';
import Post from '../models/Post.js';
import { authMiddleware } from '../middleware/userAuth.js';

const router = express.Router();

// Get all communities with pagination and filtering
router.get('/', authMiddleware, async (req, res) => {
  try {
    const {
      page = 1,
      limit = 12,
      type,
      search,
      sort = 'memberCount'
    } = req.query;

    const query = { isActive: true };
    
    // Add type filter
    if (type && type !== 'all') {
      query.type = type;
    }

    // Add search filter
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } }
      ];
    }

    // Define sort options
    let sortOption = {};
    switch (sort) {
      case 'memberCount':
        sortOption = { memberCount: -1 };
        break;
      case 'newest':
        sortOption = { createdAt: -1 };
        break;
      case 'postCount':
        sortOption = { postCount: -1 };
        break;
      default:
        sortOption = { memberCount: -1 };
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [communities, totalCount] = await Promise.all([
      Community.find(query)
        .select('-members.user') // Don't send full member data
        .populate('createdBy', 'name')
        .sort(sortOption)
        .skip(skip)
        .limit(parseInt(limit)),
      Community.countDocuments(query)
    ]);

    // Check which communities the user has joined
    const userId = req.user.userId;
    const communitiesWithMemberStatus = communities.map(community => ({
      ...community.toObject(),
      isJoined: community.isMember(userId),
      isAdmin: community.isAdmin(userId)
    }));

    res.json({
      success: true,
      data: {
        communities: communitiesWithMemberStatus,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: totalCount,
          pages: Math.ceil(totalCount / parseInt(limit))
        }
      }
    });
  } catch (error) {
    console.error('Get communities error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch communities',
      error: error.message
    });
  }
});

// Get user's joined communities
router.get('/my', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.userId;

    const communities = await Community.find({
      'members.user': userId,
      isActive: true
    })
    .populate('createdBy', 'name')
    .sort({ 'members.joinedAt': -1 });

    const communitiesWithStatus = communities.map(community => ({
      ...community.toObject(),
      isJoined: true,
      isAdmin: community.isAdmin(userId),
      memberRole: community.members.find(m => m.user.toString() === userId.toString())?.role || 'member'
    }));

    res.json({
      success: true,
      data: communitiesWithStatus
    });
  } catch (error) {
    console.error('Get my communities error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user communities',
      error: error.message
    });
  }
});

// Get featured/trending communities
router.get('/featured', authMiddleware, async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 6;

    // Get communities with high member count and recent activity
    const featured = await Community.find({
      isActive: true,
      memberCount: { $gte: 50 } // Communities with at least 50 members
    })
    .sort({ memberCount: -1, postCount: -1 })
    .limit(limit)
    .populate('createdBy', 'name');

    const userId = req.user.userId;
    const featuredWithStatus = featured.map(community => ({
      ...community.toObject(),
      isJoined: community.isMember(userId),
      featured: true
    }));

    res.json({
      success: true,
      data: featuredWithStatus
    });
  } catch (error) {
    console.error('Get featured communities error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch featured communities',
      error: error.message
    });
  }
});

// Get trending communities
router.get('/trending', authMiddleware, async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 6;

    // Get communities with recent growth (joined in last 30 days)
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    
    const trending = await Community.aggregate([
      { $match: { isActive: true } },
      {
        $addFields: {
          recentMemberCount: {
            $size: {
              $filter: {
                input: '$members',
                cond: { $gte: ['$$this.joinedAt', thirtyDaysAgo] }
              }
            }
          }
        }
      },
      { $match: { recentMemberCount: { $gte: 5 } } }, // At least 5 new members
      { $sort: { recentMemberCount: -1, memberCount: -1 } },
      { $limit: limit }
    ]);

    const userId = req.user.userId;
    const trendingWithStatus = trending.map(community => ({
      ...community,
      isJoined: community.members.some(member => member.user.toString() === userId.toString()),
      trending: true
    }));

    res.json({
      success: true,
      data: trendingWithStatus
    });
  } catch (error) {
    console.error('Get trending communities error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch trending communities',
      error: error.message
    });
  }
});

// Get single community details
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const communityId = req.params.id;
    const userId = req.user.userId;

    const community = await Community.findOne({
      _id: communityId,
      isActive: true
    })
    .populate('createdBy', 'name email')
    .populate('admins', 'name email')
    .populate('moderators', 'name email');

    if (!community) {
      return res.status(404).json({
        success: false,
        message: 'Community not found'
      });
    }

    // Get recent posts count
    const recentPostsCount = await Post.countDocuments({
      community: communityId,
      isActive: true,
      createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } // Last 7 days
    });

    const communityData = {
      ...community.toObject(),
      isJoined: community.isMember(userId),
      isAdmin: community.isAdmin(userId),
      memberRole: community.members.find(m => m.user.toString() === userId.toString())?.role || null,
      recentActivity: recentPostsCount
    };

    res.json({
      success: true,
      data: communityData
    });
  } catch (error) {
    console.error('Get community details error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch community details',
      error: error.message
    });
  }
});

// Join a community
router.post('/:id/join', authMiddleware, async (req, res) => {
  try {
    const communityId = req.params.id;
    const userId = req.user.userId;

    const community = await Community.findOne({
      _id: communityId,
      isActive: true
    });

    if (!community) {
      return res.status(404).json({
        success: false,
        message: 'Community not found'
      });
    }

    // Check if user is already a member
    if (community.isMember(userId)) {
      return res.status(400).json({
        success: false,
        message: 'You are already a member of this community'
      });
    }

    // Add user to members
    community.members.push({
      user: userId,
      joinedAt: new Date(),
      role: 'member'
    });

    await community.save();

    res.json({
      success: true,
      message: 'Successfully joined the community',
      data: {
        memberCount: community.memberCount,
        isJoined: true
      }
    });
  } catch (error) {
    console.error('Join community error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to join community',
      error: error.message
    });
  }
});

// Leave a community
router.post('/:id/leave', authMiddleware, async (req, res) => {
  try {
    const communityId = req.params.id;
    const userId = req.user.userId;

    const community = await Community.findOne({
      _id: communityId,
      isActive: true
    });

    if (!community) {
      return res.status(404).json({
        success: false,
        message: 'Community not found'
      });
    }

    // Check if user is a member
    if (!community.isMember(userId)) {
      return res.status(400).json({
        success: false,
        message: 'You are not a member of this community'
      });
    }

    // Remove user from members
    community.members = community.members.filter(
      member => member.user.toString() !== userId.toString()
    );

    // Remove from admins and moderators if applicable
    community.admins = community.admins.filter(
      admin => admin.toString() !== userId.toString()
    );
    community.moderators = community.moderators.filter(
      moderator => moderator.toString() !== userId.toString()
    );

    await community.save();

    res.json({
      success: true,
      message: 'Successfully left the community',
      data: {
        memberCount: community.memberCount,
        isJoined: false
      }
    });
  } catch (error) {
    console.error('Leave community error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to leave community',
      error: error.message
    });
  }
});

// Create a new community
router.post('/', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.userId;
    const {
      name,
      description,
      type,
      tags = [],
      rules = [],
      isPrivate = false
    } = req.body;

    // Validate required fields
    if (!name || !description || !type) {
      return res.status(400).json({
        success: false,
        message: 'Name, description, and type are required'
      });
    }

    // Check if community name already exists
    const existingCommunity = await Community.findOne({
      name: { $regex: new RegExp(`^${name}$`, 'i') }
    });

    if (existingCommunity) {
      return res.status(400).json({
        success: false,
        message: 'A community with this name already exists'
      });
    }

    // Create new community
    const community = new Community({
      name,
      description,
      type,
      tags,
      rules,
      isPrivate,
      createdBy: userId,
      admins: [userId],
      members: [{
        user: userId,
        joinedAt: new Date(),
        role: 'admin'
      }]
    });

    await community.save();

    res.status(201).json({
      success: true,
      message: 'Community created successfully',
      data: {
        ...community.toObject(),
        isJoined: true,
        isAdmin: true
      }
    });
  } catch (error) {
    console.error('Create community error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create community',
      error: error.message
    });
  }
});

// Get community members
router.get('/:id/members', authMiddleware, async (req, res) => {
  try {
    const communityId = req.params.id;
    const { page = 1, limit = 20 } = req.query;

    const community = await Community.findOne({
      _id: communityId,
      isActive: true
    })
    .populate({
      path: 'members.user',
      select: 'name email location skills',
      options: {
        skip: (parseInt(page) - 1) * parseInt(limit),
        limit: parseInt(limit)
      }
    })
    .populate('admins', 'name email')
    .populate('moderators', 'name email');

    if (!community) {
      return res.status(404).json({
        success: false,
        message: 'Community not found'
      });
    }

    const membersWithRoles = community.members.map(member => ({
      user: member.user,
      joinedAt: member.joinedAt,
      role: member.role,
      isAdmin: community.admins.some(admin => admin._id.toString() === member.user._id.toString()),
      isModerator: community.moderators.some(mod => mod._id.toString() === member.user._id.toString())
    }));

    res.json({
      success: true,
      data: {
        members: membersWithRoles,
        totalMembers: community.memberCount,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: community.memberCount,
          pages: Math.ceil(community.memberCount / parseInt(limit))
        }
      }
    });
  } catch (error) {
    console.error('Get community members error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch community members',
      error: error.message
    });
  }
});

export default router;
