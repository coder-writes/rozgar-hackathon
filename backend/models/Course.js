import mongoose from 'mongoose';

const courseSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Course title is required'],
      trim: true,
      minlength: [5, 'Title must be at least 5 characters long'],
      maxlength: [200, 'Title cannot exceed 200 characters'],
    },
    description: {
      type: String,
      required: [true, 'Course description is required'],
      trim: true,
      maxlength: [2000, 'Description cannot exceed 2000 characters'],
    },
    instructor: {
      name: {
        type: String,
        required: [true, 'Instructor name is required'],
        trim: true
      },
      bio: String,
      avatar: String,
      credentials: [String],
      socialLinks: {
        linkedin: String,
        twitter: String,
        website: String
      }
    },
    category: {
      type: String,
      required: [true, 'Course category is required'],
      enum: [
        'programming', 'web-development', 'mobile-development', 'data-science',
        'machine-learning', 'ai', 'cybersecurity', 'cloud-computing',
        'devops', 'design', 'marketing', 'business', 'finance', 'other'
      ]
    },
    subcategory: String,
    difficulty: {
      type: String,
      required: [true, 'Course difficulty is required'],
      enum: ['beginner', 'intermediate', 'advanced']
    },
    duration: {
      hours: Number,
      weeks: Number,
      selfPaced: {
        type: Boolean,
        default: true
      }
    },
    pricing: {
      type: {
        type: String,
        enum: ['free', 'paid', 'subscription'],
        default: 'free'
      },
      amount: Number,
      currency: {
        type: String,
        default: 'INR'
      },
      discount: {
        percentage: Number,
        validUntil: Date
      }
    },
    thumbnail: {
      url: String,
      alt: String
    },
    trailer: {
      url: String,
      duration: Number
    },
    skills: [{
      type: String,
      trim: true
    }],
    prerequisites: [String],
    learningOutcomes: [String],
    curriculum: [{
      module: {
        type: String,
        required: true
      },
      lessons: [{
        title: {
          type: String,
          required: true
        },
        description: String,
        duration: Number, // in minutes
        type: {
          type: String,
          enum: ['video', 'text', 'quiz', 'assignment', 'project'],
          default: 'video'
        },
        content: {
          videoUrl: String,
          textContent: String,
          quiz: {
            questions: [{
              question: String,
              options: [String],
              correctAnswer: Number,
              explanation: String
            }]
          },
          assignment: {
            description: String,
            submissionFormat: String,
            dueDate: Date
          }
        },
        isPreview: {
          type: Boolean,
          default: false
        },
        order: Number
      }]
    }],
    tags: [String],
    language: {
      type: String,
      default: 'English'
    },
    subtitles: [String],
    certificate: {
      provided: {
        type: Boolean,
        default: false
      },
      criteria: String,
      template: String
    },
    ratings: {
      average: {
        type: Number,
        min: 0,
        max: 5,
        default: 0
      },
      count: {
        type: Number,
        default: 0
      },
      reviews: [{
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User'
        },
        rating: {
          type: Number,
          min: 1,
          max: 5,
          required: true
        },
        review: String,
        createdAt: {
          type: Date,
          default: Date.now
        }
      }]
    },
    enrollment: {
      count: {
        type: Number,
        default: 0
      },
      maxStudents: Number,
      isOpen: {
        type: Boolean,
        default: true
      }
    },
    status: {
      type: String,
      enum: ['draft', 'published', 'archived'],
      default: 'draft'
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    publishedAt: Date,
    lastUpdated: {
      type: Date,
      default: Date.now
    }
  },
  {
    timestamps: true,
  }
);

// Indexes
courseSchema.index({ title: 'text', description: 'text', tags: 'text' });
courseSchema.index({ category: 1, difficulty: 1 });
courseSchema.index({ 'pricing.type': 1 });
courseSchema.index({ 'ratings.average': -1 });
courseSchema.index({ 'enrollment.count': -1 });
courseSchema.index({ status: 1 });

// Virtual for total lessons
courseSchema.virtual('totalLessons').get(function() {
  return this.curriculum.reduce((total, module) => total + module.lessons.length, 0);
});

// Virtual for total duration
courseSchema.virtual('totalDuration').get(function() {
  return this.curriculum.reduce((total, module) => {
    return total + module.lessons.reduce((moduleTotal, lesson) => moduleTotal + (lesson.duration || 0), 0);
  }, 0);
});

// Method to calculate course progress for a user
courseSchema.methods.getProgressForUser = async function(userId) {
  const CourseProgress = mongoose.model('CourseProgress');
  return await CourseProgress.findOne({ user: userId, course: this._id });
};

const Course = mongoose.model('Course', courseSchema);

// Course Progress Schema
const courseProgressSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course',
      required: true
    },
    enrolledAt: {
      type: Date,
      default: Date.now
    },
    startedAt: Date,
    completedAt: Date,
    status: {
      type: String,
      enum: ['enrolled', 'in-progress', 'completed', 'dropped'],
      default: 'enrolled'
    },
    progress: {
      percentage: {
        type: Number,
        min: 0,
        max: 100,
        default: 0
      },
      lessonsCompleted: [{
        moduleIndex: Number,
        lessonIndex: Number,
        completedAt: {
          type: Date,
          default: Date.now
        },
        timeSpent: Number // in minutes
      }],
      quizScores: [{
        moduleIndex: Number,
        lessonIndex: Number,
        score: Number,
        maxScore: Number,
        attemptedAt: {
          type: Date,
          default: Date.now
        }
      }],
      assignments: [{
        moduleIndex: Number,
        lessonIndex: Number,
        submittedAt: Date,
        grade: String,
        feedback: String,
        fileUrl: String
      }]
    },
    lastAccessedAt: {
      type: Date,
      default: Date.now
    },
    timeSpent: {
      type: Number,
      default: 0 // total time in minutes
    },
    currentLesson: {
      moduleIndex: {
        type: Number,
        default: 0
      },
      lessonIndex: {
        type: Number,
        default: 0
      }
    },
    notes: [{
      moduleIndex: Number,
      lessonIndex: Number,
      content: String,
      timestamp: Number, // for video notes
      createdAt: {
        type: Date,
        default: Date.now
      }
    }],
    bookmarks: [{
      moduleIndex: Number,
      lessonIndex: Number,
      timestamp: Number,
      note: String,
      createdAt: {
        type: Date,
        default: Date.now
      }
    }],
    certificateIssued: {
      type: Boolean,
      default: false
    },
    certificateUrl: String
  },
  {
    timestamps: true,
  }
);

// Compound indexes
courseProgressSchema.index({ user: 1, course: 1 }, { unique: true });
courseProgressSchema.index({ user: 1, status: 1 });
courseProgressSchema.index({ course: 1, status: 1 });

// Update progress percentage when lessons are completed
courseProgressSchema.methods.updateProgress = async function() {
  const course = await Course.findById(this.course);
  if (course) {
    const totalLessons = course.totalLessons;
    const completedLessons = this.progress.lessonsCompleted.length;
    this.progress.percentage = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;
    
    // Update status based on progress
    if (this.progress.percentage === 100 && this.status !== 'completed') {
      this.status = 'completed';
      this.completedAt = new Date();
    } else if (this.progress.percentage > 0 && this.status === 'enrolled') {
      this.status = 'in-progress';
      this.startedAt = new Date();
    }
  }
};

// Method to mark lesson as completed
courseProgressSchema.methods.completeLesson = async function(moduleIndex, lessonIndex, timeSpent = 0) {
  const existingCompletion = this.progress.lessonsCompleted.find(
    completion => completion.moduleIndex === moduleIndex && completion.lessonIndex === lessonIndex
  );
  
  if (!existingCompletion) {
    this.progress.lessonsCompleted.push({
      moduleIndex,
      lessonIndex,
      timeSpent
    });
    
    this.timeSpent += timeSpent;
    await this.updateProgress();
  }
};

// Method to get next lesson
courseProgressSchema.methods.getNextLesson = async function() {
  const course = await Course.findById(this.course);
  if (!course) return null;
  
  const { moduleIndex, lessonIndex } = this.currentLesson;
  
  // Check if current lesson is completed
  const isCurrentCompleted = this.progress.lessonsCompleted.some(
    completion => completion.moduleIndex === moduleIndex && completion.lessonIndex === lessonIndex
  );
  
  if (!isCurrentCompleted) {
    return {
      moduleIndex,
      lessonIndex,
      module: course.curriculum[moduleIndex],
      lesson: course.curriculum[moduleIndex]?.lessons[lessonIndex]
    };
  }
  
  // Find next incomplete lesson
  for (let m = 0; m < course.curriculum.length; m++) {
    const module = course.curriculum[m];
    for (let l = 0; l < module.lessons.length; l++) {
      const isCompleted = this.progress.lessonsCompleted.some(
        completion => completion.moduleIndex === m && completion.lessonIndex === l
      );
      
      if (!isCompleted) {
        return {
          moduleIndex: m,
          lessonIndex: l,
          module,
          lesson: module.lessons[l]
        };
      }
    }
  }
  
  return null; // All lessons completed
};

const CourseProgress = mongoose.model('CourseProgress', courseProgressSchema);

export { Course, CourseProgress };
