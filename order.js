const mongoose = require('mongoose');

const fileSchema = new mongoose.Schema({
    originalName: String,
    mimeType: String,
    size: Number,
    data: Buffer // Storing file directly in MongoDB via Buffer
});

const orderSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  service: { type: String, required: true },
  name: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, required: true },
  description: { type: String, required: true },
  files: [fileSchema], // Array of uploaded files
  status: { type: String, default: 'Pending' }
}, { timestamps: true });

module.exports = mongoose.model('Order', orderSchema);
