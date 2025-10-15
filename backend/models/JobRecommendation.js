import mongoose from 'mongoose';

const jobRecommendationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    jobPost: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Post',
      required: true
    },
    matchScore: {
      type: Number,
      min: 0,
      max: 100,
      required: true
    },
    matchFactors: {
      skillMatch: {
        score: Number,
        matchedSkills: [String],
        missingSkills: [String]
      },
      locationMatch: {
        score: Number,
        distance: Number, // in km if relevant
        isRemote: Boolean
      },
      experienceMatch: {
        score: Number,
        required: String,
        userLevel: String
      },
      salaryMatch: {
        score: Number,
        expectedRange: String,
        offeredRange: String
      },
      companyMatch: {
        score: Number,
        reason: String
      }
    },
    reason: {
      type: String,
      maxlength: [500, 'Reason cannot exceed 500 characters']
    },
    status: {
      type: String,
      enum: ['active', 'applied', 'dismissed', 'saved', 'expired'],
      default: 'active'
    },
    interactions: {
      viewed: {
        type: Boolean,
        default: false
      },
      viewedAt: Date,
      clicked: {
        type: Boolean,
        default: false
      },
      clickedAt: Date,
      saved: {
        type: Boolean,
        default: false
      },
      savedAt: Date,
      dismissed: {
        type: Boolean,
        default: false
      },
      dismissedAt: Date,
      dismissReason: String
    },
    generatedAt: {
      type: Date,
      default: Date.now
    },
    expiresAt: {
      type: Date,
      default: () => new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
    },
    algorithm: {
      version: {
        type: String,
        default: '1.0'
      },
      factors: [String] // factors used in calculation
    }
  },
  {
    timestamps: true,
  }
);

// Indexes
jobRecommendationSchema.index({ user: 1, matchScore: -1 });
jobRecommendationSchema.index({ user: 1, status: 1 });
jobRecommendationSchema.index({ jobPost: 1 });
jobRecommendationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
jobRecommendationSchema.index({ generatedAt: -1 });

// Static method to generate recommendations for a user
jobRecommendationSchema.statics.generateForUser = async function(userId, limit = 20) {
  const User = mongoose.model('User');
  const Post = mongoose.model('Post');
  
  const user = await User.findById(userId);
  if (!user) throw new Error('User not found');
  
  // Get active job posts
  const jobPosts = await Post.find({
    type: 'job',
    isActive: true,
    createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } // Last 30 days
  }).populate('community');
  
  const recommendations = [];
  
  for (const job of jobPosts) {
    // Skip if user already has recommendation for this job
    const existingRec = await this.findOne({ user: userId, jobPost: job._id });
    if (existingRec) continue;
    
    const matchScore = calculateMatchScore(user, job);
    
    if (matchScore >= 50) { // Only recommend jobs with 50%+ match
      recommendations.push({
        user: userId,
        jobPost: job._id,
        matchScore,
        matchFactors: calculateMatchFactors(user, job),
        reason: generateRecommendationReason(user, job, matchScore)
      });
    }
  }
  
  // Sort by match score and limit
  recommendations.sort((a, b) => b.matchScore - a.matchScore);
  const topRecommendations = recommendations.slice(0, limit);
  
  // Save recommendations
  if (topRecommendations.length > 0) {
    await this.insertMany(topRecommendations);
  }
  
  return topRecommendations;
};

// Helper function to calculate match score
function calculateMatchScore(user, jobPost) {
  let totalScore = 0;
  let factors = 0;
  
  // Skill match (40% weight)
  const skillScore = calculateSkillMatch(user.skills || [], jobPost.metadata?.skills || []);
  totalScore += skillScore * 0.4;
  factors++;
  
  // Location match (25% weight)
  const locationScore = calculateLocationMatch(user.location, jobPost.metadata?.location);
  totalScore += locationScore * 0.25;
  factors++;
  
  // Experience match (20% weight)
  const experienceScore = calculateExperienceMatch(user.workExperience, jobPost.metadata?.experience);
  totalScore += experienceScore * 0.2;
  factors++;
  
  // Recent activity (15% weight)
  const activityScore = calculateActivityScore(jobPost.createdAt);
  totalScore += activityScore * 0.15;
  factors++;
  
  return Math.round(totalScore);
}

function calculateSkillMatch(userSkills, jobSkills) {
  if (!jobSkills || jobSkills.length === 0) return 70; // Default score if no skills specified
  
  const userSkillsLower = userSkills.map(skill => skill.toLowerCase());
  const jobSkillsLower = jobSkills.map(skill => skill.toLowerCase());
  
  const matchedSkills = jobSkillsLower.filter(skill => 
    userSkillsLower.some(userSkill => userSkill.includes(skill) || skill.includes(userSkill))
  );
  
  return Math.min(100, (matchedSkills.length / jobSkillsLower.length) * 100);
}

function calculateLocationMatch(userLocation, jobLocation) {
  if (!jobLocation) return 80; // Default score if no location specified
  if (!userLocation) return 60;
  
  // Check if it's remote
  if (jobLocation.toLowerCase().includes('remote')) return 100;
  
  // Simple string matching - in real implementation, use geocoding
  const userLoc = userLocation.toLowerCase();
  const jobLoc = jobLocation.toLowerCase();
  
  if (userLoc === jobLoc) return 100;
  if (userLoc.includes(jobLoc) || jobLoc.includes(userLoc)) return 80;
  
  // Check for same city/state
  const userParts = userLoc.split(',').map(p => p.trim());
  const jobParts = jobLoc.split(',').map(p => p.trim());
  
  for (const userPart of userParts) {
    for (const jobPart of jobParts) {
      if (userPart === jobPart) return 60;
    }
  }
  
  return 30; // Different locations
}

function calculateExperienceMatch(userExperience, requiredExperience) {
  if (!requiredExperience) return 75; // Default if no experience specified
  if (!userExperience) return 50;
  
  // Simple text matching - in real implementation, parse experience levels
  const userExp = userExperience.toLowerCase();
  const reqExp = requiredExperience.toLowerCase();
  
  if (userExp.includes('senior') && reqExp.includes('senior')) return 95;
  if (userExp.includes('junior') && reqExp.includes('junior')) return 95;
  if (userExp.includes('mid') && reqExp.includes('mid')) return 95;
  
  return 70; // Default match
}

function calculateActivityScore(createdAt) {
  const now = new Date();
  const daysDiff = (now - createdAt) / (1000 * 60 * 60 * 24);
  
  if (daysDiff <= 1) return 100; // Posted today
  if (daysDiff <= 3) return 90;  // Posted within 3 days
  if (daysDiff <= 7) return 80;  // Posted within a week
  if (daysDiff <= 14) return 70; // Posted within 2 weeks
  return 60; // Older posts
}

function calculateMatchFactors(user, jobPost) {
  return {
    skillMatch: {
      score: calculateSkillMatch(user.skills || [], jobPost.metadata?.skills || []),
      matchedSkills: [], // TODO: implement
      missingSkills: []   // TODO: implement
    },
    locationMatch: {
      score: calculateLocationMatch(user.location, jobPost.metadata?.location),
      isRemote: jobPost.metadata?.location?.toLowerCase().includes('remote') || false
    },
    experienceMatch: {
      score: calculateExperienceMatch(user.workExperience, jobPost.metadata?.experience),
      required: jobPost.metadata?.experience || 'Not specified',
      userLevel: user.workExperience || 'Not specified'
    }
  };
}

function generateRecommendationReason(user, jobPost, matchScore) {
  if (matchScore >= 90) return "Perfect match for your skills and location!";
  if (matchScore >= 80) return "Great opportunity that matches your profile!";
  if (matchScore >= 70) return "Good fit based on your skills and preferences.";
  if (matchScore >= 60) return "Interesting opportunity to consider.";
  return "Potential growth opportunity.";
}

// Method to mark as viewed
jobRecommendationSchema.methods.markAsViewed = function() {
  this.interactions.viewed = true;
  this.interactions.viewedAt = new Date();
  this.status = this.status === 'active' ? 'active' : this.status;
  return this.save();
};

// Method to mark as clicked
jobRecommendationSchema.methods.markAsClicked = function() {
  this.interactions.clicked = true;
  this.interactions.clickedAt = new Date();
  if (!this.interactions.viewed) {
    this.interactions.viewed = true;
    this.interactions.viewedAt = new Date();
  }
  return this.save();
};

// Static method to get active recommendations for user
jobRecommendationSchema.statics.getActiveForUser = function(userId, limit = 10) {
  return this.find({
    user: userId,
    status: 'active',
    expiresAt: { $gt: new Date() }
  })
  .populate('jobPost')
  .sort({ matchScore: -1 })
  .limit(limit);
};

const JobRecommendation = mongoose.model('JobRecommendation', jobRecommendationSchema);

export default JobRecommendation;
