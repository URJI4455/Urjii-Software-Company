const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const crypto = require('crypto');

// Models
const User = require('./User.js'); 
const Order = require('./order.js');
const Contact = require('./Contact.js');
const Review = require('./Review.js');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(__dirname));

// Multer setup (Memory Storage for Vercel, max 10MB)
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });

const MONGODB_URI = process.env.MONGODB_URI;
const JWT_SECRET = process.env.JWT_SECRET || 'urjii_super_secret_123';

if (MONGODB_URI) {
    mongoose.connect(MONGODB_URI)
      .then(() => console.log("MongoDB Connected Successfully"))
      .catch(err => console.error("MongoDB Connection Error: ", err));
}

// Authentication Middleware
const authMiddleware = (req, res, next) => {
    const token = req.header('Authorization');
    if (!token) return res.status(401).json({ error: 'No token, authorization denied' });
    try {
        const decoded = jwt.verify(token.replace('Bearer ', ''), JWT_SECRET);
        req.user = decoded;
        next();
    } catch (err) {
        res.status(401).json({ error: 'Token is not valid' });
    }
};

// ==========================================
// API ROUTES
// ==========================================

// --- AFFILIATE CLICK TRACKING ---
app.get('/api/ref/:code', async (req, res) => {
    try {
        await User.findOneAndUpdate(
            { referralCode: req.params.code },
            { $inc: { referralClicks: 1 } }
        );
        res.redirect('/');
    } catch (err) {
        res.redirect('/');
    }
});

// --- REGISTER API ---
app.post('/api/register', async (req, res) => {
    try {
        const { firstName, lastName, email, phone, password, gender, age, country, referredBy } = req.body;
        
        const existingUser = await User.findOne({ $or: [{ email }, { phone }] });
        if (existingUser) return res.status(400).json({ error: "Email or Phone already registered." });

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        
        const referralCode = firstName.toUpperCase() + Math.floor(1000 + Math.random() * 9000);

        const newUser = new User({
            firstName, lastName, email, phone, password: hashedPassword, gender, age, country, referralCode, referredBy
        });

        await newUser.save();
        
        if (referredBy) {
            await User.findOneAndUpdate({ referralCode: referredBy }, { $inc: { successfulReferrals: 1 } });
        }

        res.status(201).json({ message: "User registered successfully" });
    } catch (error) {
        res.status(500).json({ error: "Server error during registration." });
    }
});

// --- LOGIN API (Email or Phone) ---
app.post('/api/login', async (req, res) => {
    try {
        const { identifier, password } = req.body;
        
        const user = await User.findOne({ $or:[{ email: identifier }, { phone: identifier }] });
        if (!user) return res.status(400).json({ error: "Invalid credentials." });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ error: "Invalid credentials." });

        const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: '7d' });

        res.status(200).json({ token, user: { email: user.email, phone: user.phone, firstName: user.firstName, lastName: user.lastName, referralCode: user.referralCode } });
    } catch (error) {
        res.status(500).json({ error: "Server error during login." });
    }
});

// --- FORGOT PASSWORD ---
app.post('/api/forgot-password', async (req, res) => {
    try {
        const { identifier } = req.body;
        const user = await User.findOne({ $or: [{ email: identifier }, { phone: identifier }] });
        if (!user) return res.status(400).json({ error: "User not found." });

        const resetToken = crypto.randomBytes(20).toString('hex');
        user.resetPasswordToken = resetToken;
        user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
        await user.save();

        res.status(200).json({ message: "Reset token generated successfully.", resetToken });
    } catch (error) {
        res.status(500).json({ error: "Server error." });
    }
});

// --- RESET PASSWORD ---
app.post('/api/reset-password', async (req, res) => {
    try {
        const { resetToken, newPassword } = req.body;
        const user = await User.findOne({ resetPasswordToken: resetToken, resetPasswordExpires: { $gt: Date.now() } });
        if (!user) return res.status(400).json({ error: "Invalid or expired token." });

        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(newPassword, salt);
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;
        await user.save();

        res.status(200).json({ message: "Password reset successful." });
    } catch (error) {
        res.status(500).json({ error: "Server error." });
    }
});

// --- GET PROFILE ---
app.get('/api/profile', authMiddleware, async (req, res) => {
    try {
        const user = await User.findById(req.user.userId).select('-password -resetPasswordToken -resetPasswordExpires');
        res.status(200).json(user);
    } catch (error) {
        res.status(500).json({ error: "Server error." });
    }
});

// --- UPDATE PROFILE ---
app.put('/api/profile', authMiddleware, async (req, res) => {
    try {
        const { firstName, lastName, gender, age, country } = req.body;
        await User.findByIdAndUpdate(req.user.userId, { firstName, lastName, gender, age, country });
        res.status(200).json({ message: "Profile updated successfully." });
    } catch (error) {
        res.status(500).json({ error: "Server error." });
    }
});

// --- UPDATE PASSWORD (SECURITY) ---
app.put('/api/password', authMiddleware, async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        const user = await User.findById(req.user.userId);
        
        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) return res.status(400).json({ error: "Incorrect current password." });

        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(newPassword, salt);
        await user.save();

        res.status(200).json({ message: "Password updated securely." });
    } catch (error) {
        res.status(500).json({ error: "Server error." });
    }
});

// --- ORDER & FILE UPLOADS ---
app.post('/api/order', authMiddleware, upload.array('files', 5), async (req, res) => {
    try {
        const { serviceType, fullName, email, phone, description } = req.body;
        
        const fileMetadata = req.files ? req.files.map(f => ({
            originalName: f.originalname,
            mimeType: f.mimetype,
            size: f.size,
            data: f.buffer 
        })) :[];

        const newOrder = new Order({
            userId: req.user.userId,
            service: serviceType,
            name: fullName,
            email: email,
            phone: phone,
            description: description,
            files: fileMetadata,
            status: 'Pending'
        });

        await newOrder.save();
        res.status(201).json({ message: "Order and files submitted successfully" });
    } catch (error) {
        res.status(500).json({ error: "Server error during order submission." });
    }
});

// --- CONTACT API ---
app.post('/api/contact', async (req, res) => {
    try {
        const { name, email, subject, message } = req.body;
        const newContact = new Contact({ name, email, subject, message });
        await newContact.save();
        res.status(201).json({ message: "Message sent successfully" });
    } catch (error) {
        res.status(500).json({ error: "Server error sending message." });
    }
});

// --- REVIEW API ---
app.post('/api/review', async (req, res) => {
    try {
        const { name, rating, review } = req.body;
        const newReview = new Review({ name, rating, review });
        await newReview.save();
        res.status(201).json({ message: "Review submitted successfully" });
    } catch (error) {
        res.status(500).json({ error: "Server error submitting review." });
    }
});

module.exports = app;
