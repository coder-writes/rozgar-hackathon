import mongoose from 'mongoose';

const jobApplicationSchema = new mongoose.Schema(
  {
    applicant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    jobPost: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Post',
      required: true
    },
    jobTitle: {
      type: String,
      required: [true, 'Job title is required'],
      trim: true
    },
    company: {
      type: String,
      required: [true, 'Company name is required'],
      trim: true
    },
    location: {
      type: String,
      required: [true, 'Job location is required'],
      trim: true
    },
    salary: {
      type: String,
      trim: true
    },
    jobType: {
      type: String,
      enum: ['full-time', 'part-time', 'contract', 'internship', 'freelance'],
      required: true
    },
    status: {
      type: String,
      enum: ['applied', 'reviewing', 'interview', 'rejected', 'offered', 'accepted', 'withdrawn'],
      default: 'applied'
    },
    statusHistory: [{
      status: {
        type: String,
        enum: ['applied', 'reviewing', 'interview', 'rejected', 'offered', 'accepted', 'withdrawn']
      },
      date: {
        type: Date,
        default: Date.now
      },
      note: String
    }],
    applicationMethod: {
      type: String,
      enum: ['platform', 'external', 'email', 'referral'],
      default: 'platform'
    },
    applicationUrl: String,
    coverLetter: {
      type: String,
      maxlength: [2000, 'Cover letter cannot exceed 2000 characters']
    },
    resume: {
      filename: String,
      path: String,
      uploadedAt: Date
    },
    notes: {
      type: String,
      maxlength: [1000, 'Notes cannot exceed 1000 characters']
    },
    interviews: [{
      type: {
        type: String,
        enum: ['phone', 'video', 'in-person', 'technical', 'hr'],
        required: true
      },
      scheduledDate: Date,
      duration: Number, // in minutes
      interviewer: String,
      location: String, // for in-person or video link
      status: {
        type: String,
        enum: ['scheduled', 'completed', 'cancelled', 'rescheduled'],
        default: 'scheduled'
      },
      feedback: String,
      createdAt: {
        type: Date,
        default: Date.now
      }
    }],
    followUps: [{
      date: {
        type: Date,
        default: Date.now
      },
      type: {
        type: String,
        enum: ['email', 'call', 'message', 'visit'],
        required: true
      },
      description: String,
      response: String
    }],
    deadlines: [{
      type: {
        type: String,
        enum: ['application', 'response', 'interview', 'decision'],
        required: true
      },
      date: Date,
      description: String,
      isCompleted: {
        type: Boolean,
        default: false
      }
    }],
    recruiterContact: {
      name: String,
      email: String,
      phone: String,
      linkedin: String
    },
    expectedSalary: String,
    isArchived: {
      type: Boolean,
      default: false
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high'],
      default: 'medium'
    }
  },
  {
    timestamps: true,
  }
);

// Indexes for better performance
jobApplicationSchema.index({ applicant: 1, createdAt: -1 });
jobApplicationSchema.index({ status: 1 });
jobApplicationSchema.index({ jobPost: 1 });
jobApplicationSchema.index({ company: 1 });
jobApplicationSchema.index({ priority: 1 });

// Add status to history when status changes
jobApplicationSchema.pre('save', function() {
  if (this.isModified('status') && !this.isNew) {
    this.statusHistory.push({
      status: this.status,
      date: new Date()
    });
  }
});

// Virtual for days since application
jobApplicationSchema.virtual('daysSinceApplication').get(function() {
  const diffTime = Math.abs(new Date() - this.createdAt);
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
});

// Method to get next interview
jobApplicationSchema.methods.getNextInterview = function() {
  const now = new Date();
  return this.interviews
    .filter(interview => interview.scheduledDate > now && interview.status === 'scheduled')
    .sort((a, b) => a.scheduledDate - b.scheduledDate)[0];
};

// Method to get upcoming deadlines
jobApplicationSchema.methods.getUpcomingDeadlines = function() {
  const now = new Date();
  return this.deadlines
    .filter(deadline => deadline.date > now && !deadline.isCompleted)
    .sort((a, b) => a.date - b.date);
};

// Static method to get applications by status
jobApplicationSchema.statics.getByStatus = function(userId, status) {
  return this.find({ applicant: userId, status: status })
    .populate('jobPost')
    .sort({ createdAt: -1 });
};

// Static method to get recent applications
jobApplicationSchema.statics.getRecent = function(userId, limit = 10) {
  return this.find({ applicant: userId })
    .populate('jobPost')
    .sort({ createdAt: -1 })
    .limit(limit);
};

const JobApplication = mongoose.model('JobApplication', jobApplicationSchema);

export default JobApplication;
