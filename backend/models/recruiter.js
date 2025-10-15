import mongoose from 'mongoose';

const recruiterSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        companyName: {
            type: String,
            required: [true, 'Company name is required'],
            trim: true,
            minlength: [2, 'Company name must be at least 2 characters long'],
            maxlength: [200, 'Company name cannot exceed 200 characters'],
        },
        establishedYear: {
            type: Number,
            required: [true, 'Established year is required'],
            min: [1800, 'Year must be after 1800'],
            max: [new Date().getFullYear(), 'Year cannot be in the future'],
        },
        numberOfEmployees: {
            type: Number,
            required: [true, 'Number of employees is required'],
            min: [1, 'Must have at least 1 employee'],
        },
        jobPostings: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'JobPosting',
            },
        ],
        isActive: {
            type: Boolean,
            default: true,
        },
        profileCompletion: {
            type: Number,
            default: 0,
            min: 0,
            max: 100,
        },
    },
    {
        timestamps: true,
    }
);

// Indexes for faster queries
recruiterSchema.index({ companyName: 1 });
recruiterSchema.index({ isActive: 1 });

// Pre-save middleware to calculate profile completion
recruiterSchema.pre('save', function (next) {
    let completion = 0;

    // Company Name (25%)
    if (this.companyName && this.companyName.trim().length > 0) {
        completion += 25;
    }

    // Established Year (20%)
    if (this.establishedYear) {
        completion += 20;
    }

    // Number of Employees (20%)
    if (this.numberOfEmployees && this.numberOfEmployees > 0) {
        completion += 20;
    }

    // User Reference (25%)
    if (this.user) {
        completion += 25;
    }

    this.profileCompletion = completion;
    next();
});

// Instance method to check if profile is complete
recruiterSchema.methods.isProfileComplete = function () {
    return this.profileCompletion === 100;
};

// Instance method to get recruiter profile summary
recruiterSchema.methods.getProfileSummary = function () {
    return {
        companyName: this.companyName,
        establishedYear: this.establishedYear,
        numberOfEmployees: this.numberOfEmployees,
        jobPostingCount: this.jobPostings.length,
        profileCompletion: this.profileCompletion,
        isActive: this.isActive,
    };
};

// Static method to find recruiters by company name
recruiterSchema.statics.findByCompanyName = function (name) {
    return this.find({
        companyName: { $regex: name, $options: 'i' },
        isActive: true,
    });
};

// Virtual field for job postings count
recruiterSchema.virtual('jobPostingCount').get(function () {
    return this.jobPostings.length;
});

// Ensure virtuals are included in JSON output
recruiterSchema.set('toJSON', { virtuals: true });
recruiterSchema.set('toObject', { virtuals: true });

const Recruiter = mongoose.model('Recruiter', recruiterSchema);

export default Recruiter;