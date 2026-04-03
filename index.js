const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const bcrypt = require('bcryptjs'); // Used for secure password hashing
const User = require('./User.js'); 

const app = express();

app.use(cors());
app.use(express.json());

// Serve frontend files (HTML, CSS, JS, Images)
app.use(express.static(__dirname));

// MongoDB Connection
const MONGODB_URI = process.env.MONGODB_URI;

if (MONGODB_URI) {
    // Connect to MongoDB without deprecated options
    mongoose.connect(MONGODB_URI)
      .then(() => console.log("MongoDB Connected Successfully"))
      .catch(err => console.error("MongoDB Connection Error: ", err));
} else {
    console.error("CRITICAL ERROR: MONGODB_URI is missing from Vercel!");
}

// ==========================================
// REAL API ROUTES
// ==========================================

// --- REGISTER API ---
app.post('/api/register', async (req, res) => {
    try {
        const { firstName, lastName, email, phone, password, gender, age, country } = req.body;
        
        // 1. Check if user already exists in the database
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ error: "Email is already registered." });
        }

        // 2. Hash the password for security
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // 3. Create and save the new user
        const newUser = new User({
            firstName, 
            lastName, 
            email, 
            phone, 
            password: hashedPassword, 
            gender, 
            age, 
            country
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
        
        // 1. Find the user by email
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ error: "Invalid email or password." });
        }

        // 2. Compare the entered password with the hashed password in DB
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ error: "Invalid email or password." });
        }

        // 3. Login successful! Send user data back to frontend
        res.status(200).json({ 
            token: "urjii-auth-token-123", // Basic token placeholder
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

// Catch-all route to prevent "Cannot GET /" errors
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Export for Vercel
module.exports = app;
