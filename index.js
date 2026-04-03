const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const User = require('../models/User');
const Order = require('../models/Order');

const app = express();

// --- CORS CONFIGURATION ---
// This allows your frontend (hosted anywhere, e.g., GitHub Pages or Vercel) to talk to this backend
app.use(cors({
    origin: '*', // For production, change '*' to your actual frontend URL, e.g., 'https://urjiisoftware.com'
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true
}));

app.use(express.json());

// --- MONGODB CONNECTION FOR VERCEL SERVERLESS ---
let isConnected = false;
const connectDB = async () => {
    if (isConnected) return;
    try {
        const db = await mongoose.connect(process.env.MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        isConnected = db.connections[0].readyState;
        console.log("MongoDB Connected");
    } catch (err) {
        console.error("MongoDB Connection Error:", err);
    }
};

// --- ROUTES ---

// 1. Health Check Route
app.get('/', (req, res) => {
    res.send('Urjii Software Backend is running securely!');
});

// 2. Register Route
app.post('/api/register', async (req, res) => {
    await connectDB();
    try {
        const { firstName, lastName, email, fullPhone, password } = req.body;
        
        // Check if user exists
        const existingUser = await User.findOne({ $or: [{ email }, { fullPhone }] });
        if (existingUser) return res.status(400).json({ error: "Email or Phone already registered." });

        // Hash Password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Save User
        const newUser = new User({ firstName, lastName, email, fullPhone, password: hashedPassword });
        await newUser.save();

        res.status(201).json({ message: "User registered successfully", user: newUser });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 3. Login Route
app.post('/api/login', async (req, res) => {
    await connectDB();
    try {
        const { identifier, password } = req.body;
        
        // Find by Email OR Phone
        const user = await User.findOne({ $or: [{ email: identifier }, { fullPhone: identifier }] });
        if (!user) return res.status(400).json({ error: "Invalid credentials" });

        // Check Password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ error: "Invalid credentials" });

        res.status(200).json({ message: "Login successful", user });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 4. Create Order Route
app.post('/api/orders', async (req, res) => {
    await connectDB();
    try {
        const newOrder = new Order(req.body);
        await newOrder.save();
        res.status(201).json({ message: "Order placed successfully", order: newOrder });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Export for Vercel
module.exports = app;
