import mongoose from 'mongoose';

const communitySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Community name is required'],
      trim: true,
      minlength: [3, 'Community name must be at least 3 characters long'],
      maxlength: [100, 'Community name cannot exceed 100 characters'],
      unique: true
    },
    description: {
      type: String,
      required: [true, 'Community description is required'],
      trim: true,
      maxlength: [500, 'Description cannot exceed 500 characters'],
    },
    type: {
      type: String,
      required: [true, 'Community type is required'],
      enum: ['location', 'skill', 'topic'],
    },
    tags: [{
      type: String,
      trim: true,
      maxlength: [50, 'Tag cannot exceed 50 characters'],
    }],
    members: [{
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
      },
      joinedAt: {
        type: Date,
        default: Date.now
      },
      role: {
        type: String,
        enum: ['member', 'moderator', 'admin'],
        default: 'member'
      }
    }],
    admins: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }],
    moderators: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }],
    rules: [{
      type: String,
      trim: true,
      maxlength: [200, 'Rule cannot exceed 200 characters'],
    }],
    bannerImage: {
      type: String,
      trim: true
    },
    isActive: {
      type: Boolean,
      default: true
    },
    isPrivate: {
      type: Boolean,
      default: false
    },
    memberCount: {
      type: Number,
      default: 0
    },
    postCount: {
      type: Number,
      default: 0
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    }
  },
  {
    timestamps: true,
  }
);

// Index for better search performance
communitySchema.index({ name: 'text', description: 'text', tags: 'text' });
communitySchema.index({ type: 1 });
communitySchema.index({ memberCount: -1 });
communitySchema.index({ createdAt: -1 });

// Update member count when members array changes
communitySchema.pre('save', function() {
  this.memberCount = this.members.length;
});

// Virtual for getting member count
communitySchema.virtual('totalMembers').get(function() {
  return this.memberCount;
});

// Virtual for checking if user is member
communitySchema.methods.isMember = function(userId) {
  return this.members.some(member => member.user.toString() === userId.toString());
};

// Virtual for checking if user is admin
communitySchema.methods.isAdmin = function(userId) {
  return this.admins.some(admin => admin.toString() === userId.toString());
};

const Community = mongoose.model('Community', communitySchema);

export default Community;
