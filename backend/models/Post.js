import mongoose from 'mongoose';

const postSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Post title is required'],
      trim: true,
      minlength: [5, 'Title must be at least 5 characters long'],
      maxlength: [200, 'Title cannot exceed 200 characters'],
    },
    content: {
      type: String,
      required: [true, 'Post content is required'],
      trim: true,
      minlength: [10, 'Content must be at least 10 characters long'],
      maxlength: [5000, 'Content cannot exceed 5000 characters'],
    },
    type: {
      type: String,
      required: [true, 'Post type is required'],
      enum: ['job', 'course', 'post', 'poll', 'event'],
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    community: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Community',
      required: true
    },
    metadata: {
      // For job posts
      company: String,
      location: String,
      salary: String,
      jobType: {
        type: String,
        enum: ['full-time', 'part-time', 'contract', 'internship', 'freelance']
      },
      applicationUrl: String,
      applicationDeadline: Date,
      
      // For course posts
      instructor: String,
      duration: String,
      price: String,
      courseUrl: String,
      difficulty: {
        type: String,
        enum: ['beginner', 'intermediate', 'advanced']
      },
      
      // For poll posts
      pollOptions: [{
        option: String,
        votes: [{
          user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
          },
          votedAt: {
            type: Date,
            default: Date.now
          }
        }]
      }],
      
      // For event posts
      eventDate: Date,
      eventLocation: String,
      eventUrl: String,
      capacity: Number,
      attendees: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      }]
    },
    tags: [{
      type: String,
      trim: true,
      maxlength: [50, 'Tag cannot exceed 50 characters'],
    }],
    images: [{
      url: String,
      caption: String
    }],
    attachments: [{
      name: String,
      url: String,
      type: String,
      size: Number
    }],
    engagement: {
      likes: [{
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User'
        },
        likedAt: {
          type: Date,
          default: Date.now
        }
      }],
      comments: [{
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User'
        },
        content: {
          type: String,
          required: true,
          trim: true,
          maxlength: [1000, 'Comment cannot exceed 1000 characters']
        },
        createdAt: {
          type: Date,
          default: Date.now
        },
        replies: [{
          user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
          },
          content: {
            type: String,
            required: true,
            trim: true,
            maxlength: [500, 'Reply cannot exceed 500 characters']
          },
          createdAt: {
            type: Date,
            default: Date.now
          }
        }]
      }],
      shares: [{
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User'
        },
        sharedAt: {
          type: Date,
          default: Date.now
        }
      }],
      views: [{
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User'
        },
        viewedAt: {
          type: Date,
          default: Date.now
        }
      }]
    },
    isActive: {
      type: Boolean,
      default: true
    },
    isPinned: {
      type: Boolean,
      default: false
    },
    isApproved: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true,
  }
);

// Indexes for better performance
postSchema.index({ community: 1, createdAt: -1 });
postSchema.index({ author: 1, createdAt: -1 });
postSchema.index({ type: 1 });
postSchema.index({ title: 'text', content: 'text', tags: 'text' });
postSchema.index({ 'engagement.likes.user': 1 });

// Virtual for like count
postSchema.virtual('likeCount').get(function() {
  return this.engagement.likes.length;
});

// Virtual for comment count
postSchema.virtual('commentCount').get(function() {
  return this.engagement.comments.length;
});

// Virtual for share count
postSchema.virtual('shareCount').get(function() {
  return this.engagement.shares.length;
});

// Virtual for view count
postSchema.virtual('viewCount').get(function() {
  return this.engagement.views.length;
});

// Method to check if user liked the post
postSchema.methods.isLikedBy = function(userId) {
  return this.engagement.likes.some(like => like.user.toString() === userId.toString());
};

// Method to add a like
postSchema.methods.addLike = function(userId) {
  if (!this.isLikedBy(userId)) {
    this.engagement.likes.push({ user: userId });
  }
};

// Method to remove a like
postSchema.methods.removeLike = function(userId) {
  this.engagement.likes = this.engagement.likes.filter(
    like => like.user.toString() !== userId.toString()
  );
};

// Method to add a view
postSchema.methods.addView = function(userId) {
  // Only add view if user hasn't viewed recently (within last hour)
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
  const recentView = this.engagement.views.find(
    view => view.user.toString() === userId.toString() && view.viewedAt > oneHourAgo
  );
  
  if (!recentView) {
    this.engagement.views.push({ user: userId });
  }
};

const Post = mongoose.model('Post', postSchema);

export default Post;
