const mongoose = require('mongoose');

const fileSchema = new mongoose.Schema({
    originalName: String,
    mimeType: String,
    size: Number,
    data: Buffer
});

const orderSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  service: { type: String, required: true },
  name: { type: String, required: true },
  jobTitle: { type: String },
  companyName: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, required: true },
  businessProblem: { type: String, required: true },
  hasWebsite: { type: String, required: true },
  launchDate: { type: Date, required: true },
  budgetRange: { type: String, required: true },
  primaryGoal: { type: String, required: true },
  preferredCommunication: { type: String, required: true },
  files:[fileSchema],
  status: { type: String, default: 'Pending' }
}, { timestamps: true });

module.exports = mongoose.model('Order', orderSchema);
