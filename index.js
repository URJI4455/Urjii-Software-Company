const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
// Crucial: This imports the User.js file from the same folder (no folders used)
const User = require('./User.js'); 

const app = express();

app.use(cors());
app.use(express.json());

// // This tells the app to get the connection string securely from Vercel
const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
    console.log("CRITICAL ERROR: MONGODB_URI is missing from Vercel Environment Variables!");
}

mongoose.connect(MONGODB_URI)
  .then(() => console.log("MongoDB Connected Successfully"))
  .catch(err => console.log("MongoDB Connection Error: ", err));
// --- API ROUTES ---

// 1. Test Route to see if backend is working
app.get('/api/test', (req, res) => {
    res.json({ message: "Backend is working perfectly in the flat folder setup!" });
});

// 2. Example Register Route
app.post('/api/register', async (req, res) => {
    try {
        const { firstName, lastName, email, password } = req.body;
        // Logic to save user goes here using the User model we imported
        // const newUser = new User({ firstName, lastName, email, password });
        // await newUser.save();
        res.status(201).json({ message: "User registered successfully" });
    } catch (error) {
        res.status(500).json({ error: "Registration failed" });
    }
});

// VERY IMPORTANT FOR VERCEL: 
// Do NOT use app.listen(). Instead, export the app like this:
module.exports = app;
