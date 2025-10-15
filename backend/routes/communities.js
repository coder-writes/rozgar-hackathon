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

// Get posts from a specific community
router.get('/:id/posts', authMiddleware, async (req, res) => {
  try {
    const communityId = req.params.id;
    const userId = req.user.userId;
    const {
      page = 1,
      limit = 10,
      type = 'all'
    } = req.query;

    // Check if user is member of the community
    const community = await Community.findOne({
      _id: communityId,
      'members.user': userId,
      isActive: true
    });

    if (!community) {
      return res.status(403).json({
        success: false,
        message: 'You must be a member of this community to view its posts'
      });
    }

    // Build query
    const query = {
      community: communityId,
      isActive: true,
      isApproved: true
    };

    // Add type filter
    if (type && type !== 'all') {
      query.type = type;
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [posts, totalCount] = await Promise.all([
      Post.find(query)
        .populate('author', 'name email location')
        .populate('community', 'name type')
        .sort({ 
          isPinned: -1,
          createdAt: -1
        })
        .skip(skip)
        .limit(parseInt(limit)),
      Post.countDocuments(query)
    ]);

    // Format posts
    const formattedPosts = posts.map(post => ({
      id: post._id,
      type: post.type,
      title: post.title,
      content: post.content,
      author: {
        id: post.author._id,
        name: post.author.name,
        role: getAuthorRole(community, post.author._id)
      },
      community: {
        id: post.community._id,
        name: post.community.name,
        type: post.community.type
      },
      createdAt: post.createdAt,
      engagement: {
        likes: post.likeCount,
        comments: post.commentCount,
        shares: post.shareCount,
        views: post.viewCount,
        isLikedByUser: post.isLikedBy(userId)
      },
      metadata: post.metadata,
      tags: post.tags,
      images: post.images,
      isPinned: post.isPinned
    }));

    res.json({
      success: true,
      data: {
        posts: formattedPosts,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: totalCount,
          pages: Math.ceil(totalCount / parseInt(limit))
        }
      }
    });
  } catch (error) {
    console.error('Get community posts error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch community posts',
      error: error.message
    });
  }
});

// Create a post in a community
router.post('/:id/posts', authMiddleware, async (req, res) => {
  try {
    const communityId = req.params.id;
    const userId = req.user.userId;
    const {
      type = 'post',
      title,
      content,
      metadata = {},
      tags = [],
      images = []
    } = req.body;

    // Validate required fields
    if (!title || !content) {
      return res.status(400).json({
        success: false,
        message: 'Title and content are required'
      });
    }

    // Check if user is member of the community
    const community = await Community.findOne({
      _id: communityId,
      'members.user': userId,
      isActive: true
    });

    if (!community) {
      return res.status(403).json({
        success: false,
        message: 'You must be a member of this community to post'
      });
    }

    // Create new post
    const post = new Post({
      type,
      title: title.trim(),
      content: content.trim(),
      author: userId,
      community: communityId,
      metadata,
      tags,
      images,
      isActive: true,
      isApproved: true // Auto-approve, or set to false for moderation
    });

    await post.save();

    // Increment community post count
    community.postCount = (community.postCount || 0) + 1;
    await community.save();

    // Populate author for response
    await post.populate('author', 'name email location');

    res.status(201).json({
      success: true,
      message: 'Post created successfully',
      data: {
        id: post._id,
        type: post.type,
        title: post.title,
        content: post.content,
        author: {
          id: post.author._id,
          name: post.author.name,
          role: getAuthorRole(community, post.author._id)
        },
        community: {
          id: community._id,
          name: community.name,
          type: community.type
        },
        createdAt: post.createdAt,
        engagement: {
          likes: 0,
          comments: 0,
          shares: 0,
          views: 0,
          isLikedByUser: false
        },
        metadata: post.metadata,
        tags: post.tags,
        images: post.images
      }
    });
  } catch (error) {
    console.error('Create community post error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create post',
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

// Like a post in a community
router.post('/:communityId/posts/:postId/like', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.userId;
    const { communityId, postId } = req.params;

    // Check if user is member of the community
    const community = await Community.findOne({
      _id: communityId,
      'members.user': userId,
      isActive: true
    });

    if (!community) {
      return res.status(403).json({
        success: false,
        message: 'You must be a member of this community to like posts'
      });
    }

    const post = await Post.findOne({
      _id: postId,
      community: communityId
    });

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    // Toggle like
    const likeIndex = post.engagement.likes.findIndex(
      like => like.user.toString() === userId.toString()
    );

    let liked = false;
    if (likeIndex > -1) {
      // Unlike
      post.engagement.likes.splice(likeIndex, 1);
      liked = false;
    } else {
      // Like
      post.engagement.likes.push({
        user: userId,
        likedAt: new Date()
      });
      liked = true;
    }

    await post.save();

    res.json({
      success: true,
      message: liked ? 'Post liked successfully' : 'Post unliked successfully',
      data: {
        liked,
        likeCount: post.likeCount
      }
    });
  } catch (error) {
    console.error('Like post error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to like post',
      error: error.message
    });
  }
});

// Get comments for a community post
router.get('/:communityId/posts/:postId/comments', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.userId;
    const { communityId, postId } = req.params;
    const { page = 1, limit = 10 } = req.query;

    // Check if user is member of the community
    const community = await Community.findOne({
      _id: communityId,
      'members.user': userId,
      isActive: true
    });

    if (!community) {
      return res.status(403).json({
        success: false,
        message: 'You must be a member of this community to view comments'
      });
    }

    const post = await Post.findOne({
      _id: postId,
      community: communityId
    }).populate('engagement.comments.user', 'name email');

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    // Paginate comments
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const comments = post.engagement.comments
      .sort((a, b) => b.createdAt - a.createdAt)
      .slice(skip, skip + parseInt(limit));

    res.json({
      success: true,
      data: {
        comments: comments.map(comment => ({
          id: comment._id,
          content: comment.content,
          user: comment.user,
          createdAt: comment.createdAt,
          replies: comment.replies || []
        })),
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: post.commentCount,
          pages: Math.ceil(post.commentCount / parseInt(limit))
        }
      }
    });
  } catch (error) {
    console.error('Get comments error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch comments',
      error: error.message
    });
  }
});

// Add a comment to a community post
router.post('/:communityId/posts/:postId/comments', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.userId;
    const { communityId, postId } = req.params;
    const { content } = req.body;

    if (!content || !content.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Comment content is required'
      });
    }

    // Check if user is member of the community
    const community = await Community.findOne({
      _id: communityId,
      'members.user': userId,
      isActive: true
    });

    if (!community) {
      return res.status(403).json({
        success: false,
        message: 'You must be a member of this community to comment'
      });
    }

    const post = await Post.findOne({
      _id: postId,
      community: communityId
    });

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    // Add comment
    post.engagement.comments.push({
      user: userId,
      content: content.trim(),
      createdAt: new Date()
    });

    await post.save();

    // Populate the new comment for response
    await post.populate('engagement.comments.user', 'name email');
    const newComment = post.engagement.comments[post.engagement.comments.length - 1];

    res.json({
      success: true,
      message: 'Comment added successfully',
      data: {
        comment: {
          id: newComment._id,
          content: newComment.content,
          user: newComment.user,
          createdAt: newComment.createdAt
        },
        commentCount: post.commentCount
      }
    });
  } catch (error) {
    console.error('Add comment error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add comment',
      error: error.message
    });
  }
});

// Helper function to get author role in community
function getAuthorRole(community, authorId) {
  const member = community.members?.find(m => m.user.toString() === authorId.toString());
  if (!member) return 'guest';
  
  if (community.admins?.some(admin => admin.toString() === authorId.toString())) {
    return 'admin';
  }
  
  if (community.moderators?.some(mod => mod.toString() === authorId.toString())) {
    return 'moderator';
  }
  
  return member.role || 'member';
}

export default router;
