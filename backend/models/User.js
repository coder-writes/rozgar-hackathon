import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      minlength: [2, 'Name must be at least 2 characters long'],
      maxlength: [100, 'Name cannot exceed 100 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      trim: true,
      lowercase: true,
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        'Please provide a valid email address',
      ],
    },
    location: {
      type: String,
      required: [true, 'Location is required'],
      trim: true,
      maxlength: [200, 'Location cannot exceed 200 characters'],
    },
    skills: {
      type: [String],
      required: [true, 'At least one skill is required'],
      validate: {
        validator: function (skills) {
          return skills && skills.length > 0;
        },
        message: 'At least one skill must be provided',
      },
    },
    workExperience: {
      type: String,
      required: [true, 'Work experience is required'],
      trim: true,
      minlength: [10, 'Work experience must be at least 10 characters long'],
      maxlength: [2000, 'Work experience cannot exceed 2000 characters'],
    },
    resume: {
      filename: {
        type: String,
        default: null,
      },
      path: {
        type: String,
        default: null,
      },
      mimetype: {
        type: String,
        default: null,
      },
      size: {
        type: Number,
        default: null,
      },
      uploadedAt: {
        type: Date,
        default: null,
      },
    },
    profileCompletion: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true, // Automatically adds createdAt and updatedAt fields
  }
);

// Index for faster queries (email index already created by unique: true)
userSchema.index({ location: 1 });
userSchema.index({ skills: 1 });

// Pre-save middleware to calculate profile completion
userSchema.pre('save', function (next) {
  let completion = 0;
  
  // Name (20%)
  if (this.name && this.name.trim().length > 0) {
    completion += 20;
  }
  
  // Email (20%)
  if (this.email && this.email.trim().length > 0) {
    completion += 20;
  }
  
  // Location (15%)
  if (this.location && this.location.trim().length > 0) {
    completion += 15;
  }
  
  // Work Experience (15%)
  if (this.workExperience && this.workExperience.trim().length > 0) {
    completion += 15;
  }
  
  // Skills (20%)
  if (this.skills && this.skills.length > 0) {
    completion += 20;
  }
  
  // Resume (10%)
  if (this.resume && this.resume.filename) {
    completion += 10;
  }
  
  this.profileCompletion = completion;
  next();
});

// Instance method to check if profile is complete
userSchema.methods.isProfileComplete = function () {
  return this.profileCompletion === 100;
};

// Instance method to get user profile summary
userSchema.methods.getProfileSummary = function () {
  return {
    name: this.name,
    email: this.email,
    location: this.location,
    skillCount: this.skills.length,
    hasResume: !!this.resume.filename,
    profileCompletion: this.profileCompletion,
  };
};

// Static method to find users by skill
userSchema.statics.findBySkill = function (skill) {
  return this.find({ skills: { $in: [skill] }, isActive: true });
};

// Static method to find users by location
userSchema.statics.findByLocation = function (location) {
  return this.find({ 
    location: { $regex: location, $options: 'i' }, 
    isActive: true 
  });
};

// Virtual field for skills count
userSchema.virtual('skillsCount').get(function () {
  return this.skills.length;
});

// Ensure virtuals are included in JSON output
userSchema.set('toJSON', { virtuals: true });
userSchema.set('toObject', { virtuals: true });

const User = mongoose.model('User', userSchema);

export default User;
