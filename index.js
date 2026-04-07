const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const crypto = require('crypto');
const nodemailer = require('nodemailer');

const User = require('./User.js'); 
const Order = require('./order.js');
const Contact = require('./Contact.js');
const Review = require('./Review.js');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(__dirname));

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });
const MONGODB_URI = process.env.MONGODB_URI;
const JWT_SECRET = process.env.JWT_SECRET || 'urjii_super_secret_123';

// Email Configuration (Nodemailer)
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS }
});

if (MONGODB_URI) {
    mongoose.connect(MONGODB_URI).then(() => console.log("MongoDB Connected")).catch(err => console.log(err));
}

const authMiddleware = (req, res, next) => {
    const token = req.header('Authorization');
    if (!token) return res.status(401).json({ error: 'No token, authorization denied' });
    try {
        const decoded = jwt.verify(token.replace('Bearer ', ''), JWT_SECRET);
        req.user = decoded;
        next();
    } catch (err) { res.status(401).json({ error: 'Token is not valid' }); }
};

const adminMiddleware = async (req, res, next) => {
    try {
        const user = await User.findById(req.user.userId);
        if (user.role !== 'admin') return res.status(403).json({ error: 'Access denied' });
        next();
    } catch(err) { res.status(500).json({ error: 'Server error' }); }
};

// Affiliates & Referrals
app.get('/api/ref/:code', async (req, res) => {
    try {
        await User.findOneAndUpdate({ referralCode: req.params.code }, { $inc: { referralClicks: 1 } });
        res.redirect('/');
    } catch (err) { res.redirect('/'); }
});

app.post('/api/affiliate/register', authMiddleware, async (req, res) => {
    try {
        await User.findByIdAndUpdate(req.user.userId, { affiliateRegistered: true });
        res.status(200).json({ message: "Successfully joined Affiliate Program!" });
    } catch (error) { res.status(500).json({ error: "Server error" }); }
});

// Auth
app.post('/api/register', async (req, res) => {
    try {
        const { firstName, lastName, email, phone, password, gender, age, country, referredBy } = req.body;
        if (await User.findOne({ $or: [{ email }, { phone }] })) return res.status(400).json({ error: "User exists." });
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        const referralCode = firstName.toUpperCase() + Math.floor(1000 + Math.random() * 9000);
        const newUser = new User({ firstName, lastName, email, phone, password: hashedPassword, gender, age, country, referralCode, referredBy });
        await newUser.save();
        res.status(201).json({ message: "Registered successfully" });
    } catch (error) { res.status(500).json({ error: "Server error." }); }
});

app.post('/api/login', async (req, res) => {
    try {
        const { identifier, password } = req.body;
        const user = await User.findOne({ $or:[{ email: identifier }, { phone: identifier }] });
        if (!user || !(await bcrypt.compare(password, user.password))) return res.status(400).json({ error: "Invalid credentials." });
        const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: '7d' });
        res.status(200).json({ token, user: { email: user.email, firstName: user.firstName, role: user.role } });
    } catch (error) { res.status(500).json({ error: "Server error." }); }
});

// Profile & Settings
app.get('/api/profile', authMiddleware, async (req, res) => {
    try { res.status(200).json(await User.findById(req.user.userId).select('-password')); } 
    catch (error) { res.status(500).json({ error: "Server error." }); }
});

app.put('/api/profile', authMiddleware, async (req, res) => {
    try {
        const user = await User.findById(req.user.userId);
        if (user.lastProfileUpdate && (new Date() - new Date(user.lastProfileUpdate)) < 30 * 24 * 60 * 60 * 1000) {
            return res.status(400).json({ error: "You can only update your profile once a month." });
        }
        await User.findByIdAndUpdate(req.user.userId, { ...req.body, lastProfileUpdate: new Date() });
        res.status(200).json({ message: "Profile updated successfully." });
    } catch (error) { res.status(500).json({ error: "Server error." }); }
});

app.put('/api/settings', authMiddleware, async (req, res) => {
    try {
        await User.findByIdAndUpdate(req.user.userId, { settings: req.body });
        res.status(200).json({ message: "Settings saved." });
    } catch (error) { res.status(500).json({ error: "Server error." }); }
});

// Newsletter
app.post('/api/newsletter', async (req, res) => {
    try {
        const user = await User.findOneAndUpdate({ email: req.body.email }, { newsletterSubscribed: true });
        res.status(200).json({ message: "Subscribed to newsletter successfully!" });
    } catch(err) { res.status(500).json({ error: "Subscription failed." }); }
});

// Order Processing & Nodemailer
app.post('/api/order', authMiddleware, upload.array('files', 5), async (req, res) => {
    try {
        const newOrder = new Order({ ...req.body, userId: req.user.userId, files: req.files ? req.files.map(f => ({ originalName: f.originalname, data: f.buffer })) : [] });
        await newOrder.save();
        
        // Handle Affiliate Commission Tracking Logic
        const user = await User.findById(req.user.userId);
        if(user.referredBy) {
            await User.findOneAndUpdate({ referralCode: user.referredBy }, { $inc: { successfulReferrals: 1 } });
        }

        if(process.env.EMAIL_USER) {
            transporter.sendMail({ from: process.env.EMAIL_USER, to: req.body.email, subject: 'Project Request Received - Urjii Software', text: `Hi ${req.body.fullName},\n\nYour project request for ${req.body.serviceType} has been received. We will contact you shortly!` }).catch(console.log);
            transporter.sendMail({ from: process.env.EMAIL_USER, to: process.env.EMAIL_USER, subject: 'New Client Order', text: `New order from ${req.body.fullName} for ${req.body.serviceType}. Budget: ${req.body.budgetRange}.` }).catch(console.log);
        }

        res.status(201).json({ message: "Order submitted successfully" });
    } catch (error) { res.status(500).json({ error: "Server error." }); }
});

// Review
app.post('/api/review', async (req, res) => {
    try { await new Review(req.body).save(); res.status(201).json({ message: "Review submitted!" }); } 
    catch (error) { res.status(500).json({ error: "Server error." }); }
});

// Admin Route
app.get('/api/admin/stats', authMiddleware, adminMiddleware, async (req, res) => {
    try {
        const orders = await Order.countDocuments();
        const users = await User.countDocuments();
        res.status(200).json({ orders, users });
    } catch (error) { res.status(500).json({ error: "Server error." }); }
});

module.exports = app;
