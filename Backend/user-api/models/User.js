const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: true,
    match: /^[a-zA-Z ]+$/, // Only alphabetic characters and spaces
  },
  email: {
    type: String,
    required: true,
    unique: true,
    match: /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, // Valid email format
  },
  password: {
    type: String,
    required: true,
  },
  imagePath: {
    type: String,
    default: null,
  },
});

module.exports = mongoose.model('User', userSchema);