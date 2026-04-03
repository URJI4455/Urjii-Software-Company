const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const multer = require('multer');

// Models
const User = require('./User.js'); 
const Order = require('./order.js');
const Contact = require('./Contact.js');
const Review = require('./Review.js');

const app = express();

app.use(cors());
app.use(express.json());

// Serve frontend files
app.use(express.static(__dirname));

// Multer setup for file uploads (using memory storage for Vercel serverless compatibility)
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } }); // 10MB limit

// MongoDB Connection
const MONGODB_URI = process.env.MONGODB_URI;
const JWT_SECRET = process.env.JWT_SECRET || 'fallback_super_secret_key_123';

if (MONGODB_URI) {
    mongoose.connect(MONGODB_URI)
      .then(() => console.log("MongoDB Connected Successfully"))
      .catch(err => console.error("MongoDB Connection Error: ", err));
} else {
    console.error("CRITICAL ERROR: MONGODB_URI is missing from Vercel!");
}

// ==========================================
// API ROUTES
// ==========================================

// --- REGISTER API ---
app.post('/api/register', async (req, res) => {
    try {
        const { firstName, lastName, email, phone, password, gender, age, country } = req.body;
        
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ error: "Email is already registered." });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = new User({
            firstName, lastName, email, phone, password: hashedPassword, gender, age, country
        });

        await newUser.save();
        res.status(201).json({ message: "User registered successfully" });

    } catch (error) {
        console.error("Registration Error:", error);
        res.status(500).json({ error: "Server error during registration." });
    }
});

// --- LOGIN API ---
app.post('/api/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ error: "Invalid email or password." });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ error: "Invalid email or password." });
        }

        // Generate Real JWT Token
        const token = jwt.sign({ userId: user._id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });

        res.status(200).json({ 
            token: token,
            user: { 
                email: user.email, 
                firstName: user.firstName, 
                lastName: user.lastName, 
                phone: user.phone 
            } 
        });

    } catch (error) {
        console.error("Login Error:", error);
        res.status(500).json({ error: "Server error during login." });
    }
});

// --- ORDER API (With File Upload) ---
app.post('/api/order', upload.array('files', 5), async (req, res) => {
    try {
        const { serviceType, fullName, email, phone, description } = req.body;
        
        // Note: req.files contains the uploaded files in memory buffers
        // In a real production app, you would upload these buffers to AWS S3 or Cloudinary here.

        const newOrder = new Order({
            service: serviceType,
            name: fullName,
            email: email,
            phone: phone,
            description: description,
            // You can store file metadata here if you upload them to external storage
            status: 'Pending'
        });

        await newOrder.save();
        res.status(201).json({ message: "Order submitted successfully" });

    } catch (error) {
        console.error("Order Error:", error);
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

// Export for Vercel
module.exports = app;
