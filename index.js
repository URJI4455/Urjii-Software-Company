const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path'); // Added path module
const User = require('./User.js'); 

const app = express();

app.use(cors());
app.use(express.json());

// ==========================================
// NEW: SERVE FRONTEND FILES
// This tells the backend to serve your HTML, CSS, and Images
// ==========================================
app.use(express.static(__dirname));

// MongoDB Connection
const MONGODB_URI = process.env.MONGODB_URI;

if (MONGODB_URI) {
    mongoose.connect(MONGODB_URI)
      .then(() => console.log("MongoDB Connected Successfully"))
      .catch(err => console.log("MongoDB Connection Error: ", err));
} else {
    console.log("CRITICAL ERROR: MONGODB_URI is missing from Vercel Environment Variables!");
}

// ==========================================
// API ROUTES
// ==========================================
app.get('/api/test', (req, res) => {
    res.json({ message: "Backend is working perfectly!" });
});

app.post('/api/register', async (req, res) => {
    try {
        const { firstName, lastName, email, password, phone, gender, age, country } = req.body;
        // Basic logic (Update with actual DB save logic)
        res.status(201).json({ message: "User registered successfully" });
    } catch (error) {
        res.status(500).json({ error: "Registration failed" });
    }
});

app.post('/api/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        // Basic logic (Update with actual DB check logic)
        res.status(200).json({ token: "fake-jwt-token", user: { email, firstName: "Test" } });
    } catch (error) {
        res.status(500).json({ error: "Login failed" });
    }
});

// ==========================================
// NEW: CATCH-ALL ROUTE
// If someone visits the main domain ("/"), show them index.html
// ==========================================
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Export for Vercel
module.exports = app;
