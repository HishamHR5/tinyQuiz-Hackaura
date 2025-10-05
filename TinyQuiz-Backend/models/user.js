const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  email: { 
    type: String, 
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  password: { 
    type: String, 
    required: function() { return !this.googleId; }, // Password not required for Google users
    minlength: [6, 'Password must be at least 6 characters long'],
    select: false
  },
  // Google OAuth fields
  googleId: {
    type: String,
    unique: true,
    sparse: true // Allow null values but ensure uniqueness when present
  },
  name: {
    type: String,
    trim: true
  },
  profilePicture: {
    type: String
  },
  provider: {
    type: String,
    enum: ['local', 'google'],
    default: 'local'
  },
  createdAt: { type: Date, default: Date.now }
}, {
  timestamps: true
});

// Only hash password if it's new or modified
userSchema.pre('save', async function (next) {
  // Skip hashing if password wasn't modified
  if (!this.isModified('password')) return next();
  
  try {
    // Hash password with salt rounds of 12 for better security
    this.password = await bcrypt.hash(this.password, 12);
    next();
  } catch (error) {
    next(error);
  }
});

// Instance method to compare passwords
userSchema.methods.comparePassword = async function(candidatePassword) {
  try {
    return await bcrypt.compare(candidatePassword, this.password);
  } catch (error) {
    throw new Error('Password comparison failed');
  }
};

// Instance method to generate auth token (we'll use this later)
userSchema.methods.generateAuthToken = function() {
  const jwt = require('jsonwebtoken');
  return jwt.sign({ id: this._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
};

module.exports = mongoose.model('User', userSchema);
