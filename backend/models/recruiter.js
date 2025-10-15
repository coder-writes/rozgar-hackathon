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
        companyDescription: {
            type: String,
            trim: true,
            maxlength: [2000, 'Company description cannot exceed 2000 characters'],
        },
        industry: {
            type: String,
            trim: true,
            maxlength: [100, 'Industry cannot exceed 100 characters'],
        },
        companyWebsite: {
            type: String,
            trim: true,
        },
        companyEmail: {
            type: String,
            trim: true,
            lowercase: true,
        },
        companyPhone: {
            type: String,
            trim: true,
        },
        companyLogo: {
            type: String,
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
        employeeRange: {
            type: String,
            enum: ['1-10', '11-50', '51-200', '201-500', '501-1000', '1000+'],
        },
        location: {
            address: {
                type: String,
                trim: true,
            },
            city: {
                type: String,
                trim: true,
            },
            state: {
                type: String,
                trim: true,
            },
            country: {
                type: String,
                trim: true,
                default: 'India',
            },
            pincode: {
                type: String,
                trim: true,
            },
        },
        hiringFor: [
            {
                role: {
                    type: String,
                    trim: true,
                },
                positions: {
                    type: Number,
                    min: 1,
                },
                experienceRequired: {
                    type: String,
                    trim: true,
                },
                skills: [String],
            },
        ],
        socialLinks: {
            linkedin: String,
            twitter: String,
            facebook: String,
            instagram: String,
        },
        benefits: [String],
        companySize: {
            type: String,
            enum: ['Startup', 'Small', 'Medium', 'Large', 'Enterprise'],
        },
        companyType: {
            type: String,
            enum: ['Private', 'Public', 'Government', 'Non-Profit', 'Startup'],
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
        isVerified: {
            type: Boolean,
            default: false,
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
    const fields = [
        { field: 'companyName', weight: 15 },
        { field: 'companyDescription', weight: 10 },
        { field: 'industry', weight: 5 },
        { field: 'companyWebsite', weight: 5 },
        { field: 'establishedYear', weight: 5 },
        { field: 'numberOfEmployees', weight: 10 },
        { field: 'location.city', weight: 10 },
        { field: 'location.state', weight: 5 },
        { field: 'location.address', weight: 5 },
        { field: 'companyEmail', weight: 5 },
        { field: 'companyPhone', weight: 5 },
        { field: 'companyLogo', weight: 10 },
        { field: 'user', weight: 10 },
    ];

    fields.forEach(({ field, weight }) => {
        const value = field.includes('.') 
            ? field.split('.').reduce((obj, key) => obj?.[key], this)
            : this[field];
        
        if (value && (typeof value !== 'string' || value.trim().length > 0)) {
            completion += weight;
        }
    });

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