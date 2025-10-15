import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import userModel from '../models/userModel.js';
import transporter from '../config/nodemailer.js'; 

export const register =async (req, res) => {
    const { name, email, password, role } = req.body;

    if(!name || !email || !password) {
        return res.json({success: false, message:'Missing Details'})
    }  
    try{
        const existingUser = await userModel.findOne({ email });
        if(existingUser) {
            return res.json({success: false, message: 'User already exists'});
        }
        console.log("laude yaha tak phuch gye ho");
        const hashedPassword =await bcrypt.hash(password, 10); 
        // password: the plain-text string you want to protect (e.g. the user’s submitted password).
        // Internally, bcrypt generates a salt and then hashes your password + salt together.
        const user = new userModel({name, email, password: hashedPassword,role});
        await user.save();

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
        
        res.cookie('token', token, {
            httpOnly:true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'None' : 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000 
        });

        // sending welcome email
        const mailOptions = {
            from: process.env.SENDER_EMAIL,
            to: email,
            subject: 'Welcome to Rozgar',
            text: `Hi ${name},\n\nWelcome to Rozgar! We're excited to have you on board. Please verify your email to get started.\n\nBest regards,\nThe Rozgar Team`
        };

        await transporter.sendMail(mailOptions);    

        return res.json({ 
            success: true, 
            message: 'User registered successfully',
            tempToken: token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                isVerified: user.isAccountVerified
            }
        });
    }
    catch(err) {
        console.log("Registration error:", err);
        res.json({success: false, message: err.message})
    }
}

export const login = async (req, res) => {
    const { email, password } = req.body;

    if(!email || !password) {
        return res.json({success: false, message:'Email and Password are required'})
    }

    try {
        const user = await userModel.findOne({ email });
        if(!user) {
            return res.json({success: false, message: 'Invalid Email'});
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if(!isMatch) {
            return res.json({success: false, message: 'Invalid Password'});
        }

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });

        res.cookie('token', token, {
            httpOnly:true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'None' : 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000 
        });

        return res.json({ 
            success: true,
            message: 'Login successful',
            token: token,
            tempToken: user.isAccountVerified ? null : token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                isVerified: user.isAccountVerified
            }
        });
    }
    catch(err) {
        res.json({success: false, message: err.message})
    }
}

export const logout = (req, res) => {
    try{
        res.clearCookie('token', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'None' : 'strict'
        });

        return res.json({ success: true, message: 'Logged out successfully' });

    } catch(err) {
        return res.json({ success: false, message: err.message });
    }
}

// Send Verification OTP to User's Email
// in req.body there is No "userId" so by cookie we will get userId
export const sendVerifyOtp = async (req, res) => {
    try {
        // Get userId from middleware (req.user.id is set by userAuth middleware)
        const userId = req.user?.id;
        
        if (!userId) {
            return res.json({ success: false, message: 'Not Authorized. Login Again' });
        }

        const user = await userModel.findById(userId);
        if (!user) {
            return res.json({ success: false, message: 'User not found' });
        }
        
        if(user.isAccountVerified){
            return res.json({ success: false, message: 'Account already verified' });
        }

        // Generate OTP
        const otp = Math.floor(100000 + Math.random() * 900000);

        // Save OTP to user document
        user.verifyOtp = otp;
        user.verifyOtpExpireAt = Date.now() + 5 * 60 * 1000; // OTP valid for 5 minutes
        await user.save();

        // Send OTP email
        const mailOption = {
            from: process.env.SENDER_EMAIL,
            to: user.email,
            subject: 'Account Verification OTP',
            text: `Your OTP code is ${otp}. It is valid for 5 minutes.\n\nIf you didn't request this, please ignore this email.`
        };

        await transporter.sendMail(mailOption);

        return res.json({ success: true, message: 'Verification OTP sent on Email' });
    } catch(err) {
        console.error('Send OTP error:', err);
        return res.json({ success: false, message: err.message });
    }
}

// Verify Email using OTP
export const verifyEmail = async (req, res) => {
    try {
        const { otp } = req.body;
        const userId = req.user?.id;
        
        if(!userId || !otp) {
            return res.json({ success: false, message: 'Missing Details' });
        }

        const user = await userModel.findById(userId);
        if(!user) {
            return res.json({ success: false, message: 'User Not Found' });
        }

        if( user.verifyOtp ==='' || user.verifyOtp !== otp) {
            return res.json({ success: false, message: 'Invalid OTP' });
        }

        if(user.verifyOtpExpireAt < Date.now()) {
            return res.json({ success: false, message: 'OTP Expired' });
        }

        // Mark account as verified
        user.isAccountVerified = true;
        user.verifyOtp = '';
        user.verifyOtpExpireAt = 0;
        await user.save();

        // Generate new token for verified user
        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });

        res.cookie('token', token, {
            httpOnly:true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'None' : 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000 
        });

        return res.json({ 
            success: true, 
            message: 'Email Verified Successfully',
            token: token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                isVerified: user.isAccountVerified
            }
        });
    } catch(err) {
        console.error('Verify email error:', err);
        return res.json({ success: false, message: err.message });
    }
}

export const isAuthenticated = async (req, res) => {
    try {


        return res.json({ success: true, user: req.user });
    } catch (err) {
        return res.json({ success: false, message: err.message });
    }
}

// Send Password Reset OTP
export const sendResetOtp = async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) {
            return res.json({ success: false, message: 'Email is required' });
        }

        const user = await userModel.findOne({ email });
        if (!user) {
            return res.json({ success: false, message: 'User not found' });
        }

        // Generate OTP
        const otp = Math.floor(100000 + Math.random() * 900000);

        // Save OTP to user document
        user.resetOtp = otp;
        user.resetOtpExpireAt = Date.now() + 15 * 60 * 1000; // OTP valid for 5 minutes
        await user.save();

        // Send OTP email
        const mailOption = {
            from: process.env.SENDER_EMAIL,
            to: email,
            subject: 'Password Reset OTP',
            text: `Your OTP for resetting password is ${otp}. Use this OTP to reset your password. It is valid for 15 minutes.`
        };

        await transporter.sendMail(mailOption);

        return res.json({ success: true, message: 'OTP sent to your email' });

    } catch (err) {
        return res.json({ success: false, message: err.message });
    }
}


// Reset Password using OTP
export const resetPassword = async (req, res) => {
    try {
        const { email, otp, newPassword } = req.body;
        if (!email || !otp || !newPassword) {
            return res.json({ success: false, message: 'Email, OTP, and new password are required' });
        }

        const user = await userModel.findOne({ email });
        if (!user) {
            return res.json({ success: false, message: 'User Not Found' });
        }

        if (user.resetOtp === '' || user.resetOtp !== otp) {
            return res.json({ success: false, message: 'Invalid OTP' });
        }

        if (user.resetOtpExpireAt < Date.now()) {
            return res.json({ success: false, message: 'OTP Expired' });
        }

        // Reset Password
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        user.password = hashedPassword;
        user.resetOtp = '';
        user.resetOtpExpireAt = 0;
        await user.save();

        return res.json({ success: true, message: 'Password has been Reset Successfully' });
    } catch (err) {
        return res.json({ success: false, message: err.message });
    }
}