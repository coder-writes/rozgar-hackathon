import express from 'express';
import {
    getRecruiterProfile,
    createRecruiterProfile,
    updateRecruiterProfile,
    getAllRecruiters,
    getRecruiterById,
    deleteRecruiterProfile,
} from '../controllers/recruiterController.js';
import { authMiddleware, isRecruiter } from '../middleware/userAuth.js';

const router = express.Router();

// Protected routes (require authentication AND recruiter role)
router.get('/profile', authMiddleware, isRecruiter, getRecruiterProfile);
router.post('/profile', authMiddleware, isRecruiter, createRecruiterProfile);
router.put('/profile', authMiddleware, isRecruiter, updateRecruiterProfile);
router.delete('/profile', authMiddleware, isRecruiter, deleteRecruiterProfile);

// Public routes
router.get('/', getAllRecruiters);
router.get('/:id', getRecruiterById);

export default router;