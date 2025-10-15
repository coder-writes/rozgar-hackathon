import express from 'express';
import User from '../models/User.js';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const router = express.Router();

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, '..', 'uploads', 'resumes');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure multer for file upload
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadsDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, 'resume-' + uniqueSuffix + path.extname(file.originalname));
  },
});

const fileFilter = (req, file, cb) => {
  // Accept only PDF, DOC, and DOCX files
  const allowedTypes = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  ];

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only PDF, DOC, and DOCX files are allowed.'), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
});

// @route   POST /api/profile
// @desc    Create or update user profile
// @access  Public (should be protected with auth middleware in production)
router.post('/', upload.single('resume'), async (req, res) => {
  try {
    const { name, email, location, skills, workExperience } = req.body;

    // Parse skills if it's a JSON string
    let parsedSkills = skills;
    if (typeof skills === 'string') {
      try {
        parsedSkills = JSON.parse(skills);
      } catch (e) {
        parsedSkills = skills.split(',').map(skill => skill.trim());
      }
    }

    // Prepare user data
    const userData = {
      name,
      email,
      location,
      skills: parsedSkills,
      workExperience,
    };

    // Add resume data if file was uploaded
    if (req.file) {
      userData.resume = {
        filename: req.file.filename,
        path: req.file.path,
        mimetype: req.file.mimetype,
        size: req.file.size,
        uploadedAt: new Date(),
      };
    }

    // Check if user exists by email
    let user = await User.findOne({ email });

    if (user) {
      // Update existing user
      // If new resume is uploaded, delete old resume file
      if (req.file && user.resume && user.resume.path) {
        try {
          if (fs.existsSync(user.resume.path)) {
            fs.unlinkSync(user.resume.path);
          }
        } catch (err) {
          console.error('Error deleting old resume:', err);
        }
      }

      Object.assign(user, userData);
      await user.save();
      
      return res.status(200).json({
        success: true,
        message: 'Profile updated successfully',
        data: user,
      });
    } else {
      // Create new user
      user = new User(userData);
      await user.save();
      
      return res.status(201).json({
        success: true,
        message: 'Profile created successfully',
        data: user,
      });
    }
  } catch (error) {
    // Delete uploaded file if there was an error
    if (req.file && req.file.path) {
      try {
        if (fs.existsSync(req.file.path)) {
          fs.unlinkSync(req.file.path);
        }
      } catch (err) {
        console.error('Error deleting file:', err);
      }
    }

    console.error('Profile creation/update error:', error);
    
    return res.status(400).json({
      success: false,
      message: error.message || 'Error creating/updating profile',
      errors: error.errors,
    });
  }
});

// @route   GET /api/profile/:email
// @desc    Get user profile by email
// @access  Public
router.get('/:email', async (req, res) => {
  try {
    const user = await User.findOne({ email: req.params.email});

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    console.error('Error fetching profile:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching profile',
      error: error.message,
    });
  }
});

// @route   GET /api/profile
// @desc    Get all user profiles
// @access  Public
router.get('/', async (req, res) => {
  try {
    const { skill, location, page = 1, limit = 10 } = req.query;
    
    let query = { isActive: true };
    
    if (skill) {
      query.skills = { $in: [skill] };
    }
    
    if (location) {
      query.location = { $regex: location, $options: 'i' };
    }

    const users = await User.find(query)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });

    const count = await User.countDocuments(query);

    res.status(200).json({
      success: true,
      data: users,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      totalUsers: count,
    });
  } catch (error) {
    console.error('Error fetching profiles:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching profiles',
      error: error.message,
    });
  }
});

// @route   DELETE /api/profile/:email
// @desc    Delete user profile (soft delete)
// @access  Public (should be protected)
router.delete('/:email', async (req, res) => {
  try {
    const user = await User.findOne({ email: req.params.email });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    user.isActive = false;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Profile deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting profile:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting profile',
      error: error.message,
    });
  }
});

// @route   GET /api/profile/resume/:email
// @desc    Download user resume
// @access  Public
router.get('/resume/:email', async (req, res) => {
  try {
    const user = await User.findOne({ email: req.params.email, isActive: true });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    if (!user.resume || !user.resume.path) {
      return res.status(404).json({
        success: false,
        message: 'Resume not found',
      });
    }

    if (!fs.existsSync(user.resume.path)) {
      return res.status(404).json({
        success: false,
        message: 'Resume file not found on server',
      });
    }

    res.download(user.resume.path, user.resume.filename);
  } catch (error) {
    console.error('Error downloading resume:', error);
    res.status(500).json({
      success: false,
      message: 'Error downloading resume',
      error: error.message,
    });
  }
});

// @route   DELETE /api/profile/resume/:email
// @desc    Delete user resume
// @access  Public (should be protected)
router.delete('/resume/:email', async (req, res) => {
  try {
    const user = await User.findOne({ email: req.params.email });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    if (!user.resume || !user.resume.path) {
      return res.status(404).json({
        success: false,
        message: 'Resume not found',
      });
    }

    // Delete file from filesystem
    if (fs.existsSync(user.resume.path)) {
      fs.unlinkSync(user.resume.path);
    }

    // Clear resume data
    user.resume = {
      filename: null,
      path: null,
      mimetype: null,
      size: null,
      uploadedAt: null,
    };
    
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Resume deleted successfully',
      data: user,
    });
  } catch (error) {
    console.error('Error deleting resume:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting resume',
      error: error.message,
    });
  }
});

export default router;
