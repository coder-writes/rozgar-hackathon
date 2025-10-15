import jwt from 'jsonwebtoken';
import User from '../models/userModel.js';

const userAuth = async (req, res, next) => {
    try {
        // Check for token in cookies OR Authorization header
        let token = req.cookies.token;
        
        // If no token in cookies, check Authorization header
        if (!token && req.headers.authorization) {
            const authHeader = req.headers.authorization;
            if (authHeader.startsWith('Bearer ')) {
                token = authHeader.substring(7); // Remove 'Bearer ' prefix
            }
        }

        if (!token) {
            return res.status(401).json({ 
                success: false, 
                message: 'Not Authorized. Login Again' 
            });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        if (!decoded) {
            return res.status(401).json({ 
                success: false, 
                message: 'Not Authorized. Login Again' 
            });
        }
        
        // Fetch user to get role information
        const user = await User.findById(decoded.id).select('role email name');
        if (!user) {
            return res.status(404).json({ 
                success: false, 
                message: 'User not found' 
            });
        }
        
        // Set user data in req.user
        req.user = { 
            id: decoded.id, 
            userId: decoded.id,
            role: user.role,
            email: user.email,
            name: user.name
        };
        
        // Also set in req.body for backward compatibility
        if (!req.body) {
            req.body = {};
        }
        req.body.userId = decoded.id;
        
        console.log('User authenticated:', { id: user._id, role: user.role, email: user.email });
        
        next();
        
    } catch (err) {
        console.error('Authentication error:', err.message);
        return res.status(401).json({ 
            success: false, 
            message: 'Invalid or expired token. Please login again.' 
        });
    }
};

// Middleware to check if user is a recruiter
const isRecruiter = async (req, res, next) => {
    try {
        console.log('Checking recruiter role for user:', req.user);
        
        if (!req.user) {
            console.log('❌ No user found in request');
            return res.status(401).json({ 
                success: false, 
                message: 'Authentication required' 
            });
        }

        if (req.user.role !== 'recruiter') {
            console.log('❌ User is not a recruiter. Current role:', req.user.role);
            return res.status(403).json({ 
                success: false, 
                message: 'Access denied. Only recruiters can perform this action.' 
            });
        }

        console.log('✅ User is a recruiter, proceeding...');
        next();
    } catch (err) {
        console.error('Error in isRecruiter middleware:', err);
        return res.status(500).json({ 
            success: false, 
            message: err.message 
        });
    }
};

// Middleware to check if user is a job seeker
const isSeeker = async (req, res, next) => {
    try {
        if (!req.user) {
            return res.status(401).json({ 
                success: false, 
                message: 'Authentication required' 
            });
        }

        if (req.user.role !== 'seeker') {
            return res.status(403).json({ 
                success: false, 
                message: 'Access denied. Only job seekers can perform this action.' 
            });
        }

        next();
    } catch (err) {
        return res.status(500).json({ 
            success: false, 
            message: err.message 
        });
    }
};

// Export all middlewares
export default userAuth;
export { userAuth as authMiddleware, isRecruiter, isSeeker };