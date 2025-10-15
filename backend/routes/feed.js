import express from 'express';
import Post from '../models/Post.js';
import Community from '../models/Community.js';
import { authMiddleware } from '../middleware/userAuth.js';

const router = express.Router();

// Get personalized feed
router.get('/', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.userId;
    const {
      page = 1,
      limit = 10,
      type = 'all'
    } = req.query;

    // Get user's joined communities
    const userCommunities = await Community.find({
      'members.user': userId,
      isActive: true
    }).select('_id');

    const communityIds = userCommunities.map(community => community._id);

    if (communityIds.length === 0) {
      return res.json({
        success: true,
        data: {
          posts: [],
          pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total: 0,
            pages: 0
          }
        }
      });
    }

    // Build query
    const query = {
      community: { $in: communityIds },
      isActive: true,
      isApproved: true
    };

    // Add type filter
    if (type && type !== 'all') {
      query.type = type;
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Get posts with engagement counts
    const [posts, totalCount] = await Promise.all([
      Post.find(query)
        .populate('author', 'name email location')
        .populate('community', 'name type')
        .populate('engagement.likes.user', 'name')
        .populate('engagement.comments.user', 'name')
        .sort({ 
          isPinned: -1, // Pinned posts first
          createdAt: -1  // Then by newest
        })
        .skip(skip)
        .limit(parseInt(limit)),
      Post.countDocuments(query)
    ]);

    // Format posts with engagement data
    const formattedPosts = posts.map(post => {
      const isLikedByUser = post.isLikedBy(userId);
      
      return {
        id: post._id,
        type: post.type,
        title: post.title,
        content: post.content,
        author: {
          id: post.author._id,
          name: post.author.name,
          role: getAuthorRole(post.community, post.author._id),
          community: post.community.name
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
          isLikedByUser
        },
        metadata: post.metadata,
        tags: post.tags,
        images: post.images,
        isPinned: post.isPinned
      };
    });

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
    console.error('Get feed error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch feed',
      error: error.message
    });
  }
});

// Get posts from a specific community
router.get('/community/:communityId', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.userId;
    const communityId = req.params.communityId;
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
        community: {
          id: community._id,
          name: community.name,
          type: community.type,
          memberCount: community.memberCount
        },
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

// Like/Unlike a post
router.post('/:postId/like', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.userId;
    const postId = req.params.postId;

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    // Check if user is member of the community
    const community = await Community.findOne({
      _id: post.community,
      'members.user': userId
    });

    if (!community) {
      return res.status(403).json({
        success: false,
        message: 'You must be a member of this community to interact with posts'
      });
    }

    const isLiked = post.isLikedBy(userId);

    if (isLiked) {
      post.removeLike(userId);
    } else {
      post.addLike(userId);
    }

    await post.save();

    res.json({
      success: true,
      data: {
        isLiked: !isLiked,
        likeCount: post.likeCount
      }
    });
  } catch (error) {
    console.error('Toggle like error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to toggle like',
      error: error.message
    });
  }
});

// Add a comment to a post
router.post('/:postId/comment', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.userId;
    const postId = req.params.postId;
    const { content } = req.body;

    if (!content || content.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Comment content is required'
      });
    }

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    // Check if user is member of the community
    const community = await Community.findOne({
      _id: post.community,
      'members.user': userId
    });

    if (!community) {
      return res.status(403).json({
        success: false,
        message: 'You must be a member of this community to comment'
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
    await post.populate('engagement.comments.user', 'name');
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

// Get comments for a post
router.get('/:postId/comments', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.userId;
    const postId = req.params.postId;
    const { page = 1, limit = 10 } = req.query;

    const post = await Post.findById(postId)
      .populate('engagement.comments.user', 'name email');

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    // Check if user is member of the community
    const community = await Community.findOne({
      _id: post.community,
      'members.user': userId
    });

    if (!community) {
      return res.status(403).json({
        success: false,
        message: 'You must be a member of this community to view comments'
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

// Share a post
router.post('/:postId/share', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.userId;
    const postId = req.params.postId;

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    // Add share
    post.engagement.shares.push({
      user: userId,
      sharedAt: new Date()
    });

    await post.save();

    res.json({
      success: true,
      message: 'Post shared successfully',
      data: {
        shareCount: post.shareCount
      }
    });
  } catch (error) {
    console.error('Share post error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to share post',
      error: error.message
    });
  }
});

// View a post (for analytics)
router.post('/:postId/view', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.userId;
    const postId = req.params.postId;

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    // Add view
    post.addView(userId);
    await post.save();

    res.json({
      success: true,
      data: {
        viewCount: post.viewCount
      }
    });
  } catch (error) {
    console.error('View post error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to record view',
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
