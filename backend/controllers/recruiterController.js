import Recruiter from '../models/recruiter.js';
import User from '../models/userModel.js';

// Get recruiter profile by user ID
export const getRecruiterProfile = async (req, res) => {
    try {
        const userId = req.user.id;

        console.log('=== GET RECRUITER PROFILE ===');
        console.log('User ID:', userId);
        console.log('User object:', req.user);

        const recruiter = await Recruiter.findOne({ user: userId })
            .populate('user', 'name email')
            .populate('jobPostings');

        if (!recruiter) {
            console.log('❌ Recruiter profile not found for user:', userId);
            return res.status(404).json({
                success: false,
                message: 'Recruiter profile not found',
            });
        }

        console.log('✅ Recruiter profile found!');
        console.log('Recruiter ID:', recruiter._id);
        console.log('Company Name:', recruiter.companyName);

        res.status(200).json({
            success: true,
            data: recruiter,
        });
    } catch (error) {
        console.error('Error fetching recruiter profile:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while fetching recruiter profile',
            error: error.message,
        });
    }
};

// Create recruiter profile
export const createRecruiterProfile = async (req, res) => {
    try {
        const userId = req.user.id;
        
        console.log('=== CREATE RECRUITER PROFILE ===');
        console.log('User ID:', userId);
        console.log('User object:', req.user);
        console.log('Request body:', JSON.stringify(req.body, null, 2));

        // Check if recruiter profile already exists
        const existingRecruiter = await Recruiter.findOne({ user: userId });
        if (existingRecruiter) {
            console.log('❌ Recruiter profile already exists for user:', userId);
            return res.status(400).json({
                success: false,
                message: 'Recruiter profile already exists',
            });
        }

        // Create new recruiter profile
        const recruiterData = {
            user: userId,
            ...req.body,
        };

        console.log('Creating recruiter with data:', JSON.stringify(recruiterData, null, 2));
        const recruiter = await Recruiter.create(recruiterData);
        console.log('✅ Recruiter profile created successfully!');
        console.log('Recruiter ID:', recruiter._id);
        console.log('Recruiter data:', JSON.stringify(recruiter, null, 2));

        res.status(201).json({
            success: true,
            message: 'Recruiter profile created successfully',
            data: recruiter,
        });
    } catch (error) {
        console.error('❌ Error creating recruiter profile:', error);
        console.error('Error stack:', error.stack);
        res.status(500).json({
            success: false,
            message: 'Server error while creating recruiter profile',
            error: error.message,
        });
    }
};

// Update recruiter profile
export const updateRecruiterProfile = async (req, res) => {
    try {
        const userId = req.user.id;
        
        console.log('=== UPDATE RECRUITER PROFILE ===');
        console.log('User ID:', userId);
        console.log('User object:', req.user);
        console.log('Request body:', JSON.stringify(req.body, null, 2));

        const recruiter = await Recruiter.findOne({ user: userId });

        if (!recruiter) {
            console.log('❌ Recruiter profile not found for user:', userId);
            return res.status(404).json({
                success: false,
                message: 'Recruiter profile not found',
            });
        }

        console.log('✅ Found existing recruiter profile:', recruiter._id);

        // Update fields
        const allowedUpdates = [
            'companyName',
            'companyDescription',
            'industry',
            'companyWebsite',
            'companyEmail',
            'companyPhone',
            'companyLogo',
            'establishedYear',
            'numberOfEmployees',
            'employeeRange',
            'location',
            'hiringFor',
            'socialLinks',
            'benefits',
            'companySize',
            'companyType',
        ];

        allowedUpdates.forEach((field) => {
            if (req.body[field] !== undefined) {
                recruiter[field] = req.body[field];
            }
        });

        console.log('Saving updated recruiter profile...');
        await recruiter.save();
        console.log('✅ Recruiter profile updated successfully!');
        console.log('Recruiter ID:', recruiter._id);
        console.log('Updated data:', JSON.stringify(recruiter, null, 2));

        res.status(200).json({
            success: true,
            message: 'Recruiter profile updated successfully',
            data: recruiter,
        });
    } catch (error) {
        console.error('Error updating recruiter profile:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while updating recruiter profile',
            error: error.message,
        });
    }
};

// Get all recruiters (public)
export const getAllRecruiters = async (req, res) => {
    try {
        const { page = 1, limit = 10, search, industry, companySize } = req.query;

        const query = { isActive: true };

        if (search) {
            query.$or = [
                { companyName: { $regex: search, $options: 'i' } },
                { companyDescription: { $regex: search, $options: 'i' } },
            ];
        }

        if (industry) {
            query.industry = { $regex: industry, $options: 'i' };
        }

        if (companySize) {
            query.companySize = companySize;
        }

        const recruiters = await Recruiter.find(query)
            .populate('user', 'name email')
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .sort({ createdAt: -1 });

        const count = await Recruiter.countDocuments(query);

        res.status(200).json({
            success: true,
            data: recruiters,
            totalPages: Math.ceil(count / limit),
            currentPage: page,
            total: count,
        });
    } catch (error) {
        console.error('Error fetching recruiters:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while fetching recruiters',
            error: error.message,
        });
    }
};

// Get recruiter by ID (public)
export const getRecruiterById = async (req, res) => {
    try {
        const { id } = req.params;

        const recruiter = await Recruiter.findById(id)
            .populate('user', 'name email')
            .populate('jobPostings');

        if (!recruiter) {
            return res.status(404).json({
                success: false,
                message: 'Recruiter not found',
            });
        }

        res.status(200).json({
            success: true,
            data: recruiter,
        });
    } catch (error) {
        console.error('Error fetching recruiter:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while fetching recruiter',
            error: error.message,
        });
    }
};

// Delete recruiter profile
export const deleteRecruiterProfile = async (req, res) => {
    try {
        const userId = req.user.id;

        const recruiter = await Recruiter.findOneAndDelete({ user: userId });

        if (!recruiter) {
            return res.status(404).json({
                success: false,
                message: 'Recruiter profile not found',
            });
        }

        res.status(200).json({
            success: true,
            message: 'Recruiter profile deleted successfully',
        });
    } catch (error) {
        console.error('Error deleting recruiter profile:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while deleting recruiter profile',
            error: error.message,
        });
    }
};
