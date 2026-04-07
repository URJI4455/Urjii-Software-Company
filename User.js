const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phone: { type: String },
    password: { type: String, required: true },
    gender: { type: String },
    age: { type: Number },
    country: { type: String },
    role: { type: String, default: 'user' }, 
    lastProfileUpdate: { type: Date, default: null },
    affiliateRegistered: { type: Boolean, default: false },
    referralCode: { type: String },
    referredBy: { type: String },
    referralClicks: { type: Number, default: 0 },
    successfulReferrals: { type: Number, default: 0 },
    totalEarned: { type: Number, default: 0 },
    newsletterSubscribed: { type: Boolean, default: false },
    settings: {
        language: { type: String, default: 'EN' },
        notifications: { type: Boolean, default: true },
        theme: { type: String, default: 'dark' }
    },
    resetPasswordToken: String,
    resetPasswordExpires: Date
}, { timestamps: true });

module.exports = mongoose.model('User', UserSchema);
