const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { isValidEmail, isValidName, isStrongPassword } = require('../utils/validators');

// POST /user/create
const createUser = async (req, res) => {
  const { fullName, email, password } = req.body;

  if (!fullName || !email || !password) {
    return res.status(400).json({ error: 'All fields are required.' });
  }

  if (!isValidName(fullName)) {
    return res.status(400).json({ error: 'Validation failed: Full name must contain only alphabetic characters.' });
  }

  if (!isValidEmail(email)) {
    return res.status(400).json({ error: 'Validation failed: Invalid email format.' });
  }

  if (!isStrongPassword(password)) {
    return res.status(400).json({
      error: 'Validation failed: Password must be at least 8 characters long with one uppercase, one lowercase, one digit, and one special character.',
    });
  }

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'Validation failed: Email already exists.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ fullName, email, password: hashedPassword });
    await newUser.save();

    // Create token
    const token = jwt.sign(
      { userId: newUser._id, email: newUser.email },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '24h' }
    );

    // Send response without password
    const userResponse = {
      id: newUser._id,
      fullName: newUser.fullName,
      email: newUser.email
    };

    res.status(201).json({ 
      message: 'User created successfully.',
      token,
      user: userResponse
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error.' });
  }
};

// PUT /user/edit
const updateUser = async (req, res) => {
  const { email, fullName, password } = req.body;

  if (!email) {
    return res.status(400).json({ error: 'Email is required.' });
  }

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }

    if (fullName) {
      if (!isValidName(fullName)) {
        return res.status(400).json({ error: 'Validation failed: Full name must contain only alphabetic characters.' });
      }
      user.fullName = fullName;
    }

    if (password) {
      if (!isStrongPassword(password)) {
        return res.status(400).json({
          error: 'Validation failed: Password must be at least 8 characters long with one uppercase, one lowercase, one digit, and one special character.',
        });
      }
      user.password = await bcrypt.hash(password, 10);
    }

    await user.save();
    res.status(200).json({ message: 'User updated successfully.' });
  } catch (error) {
    res.status(500).json({ error: 'Server error.' });
  }
};

// DELETE /user/delete
const deleteUser = async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ error: 'Email is required.' });
  }

  try {
    const result = await User.deleteOne({ email });
    if (result.deletedCount === 0) {
      return res.status(404).json({ error: 'User not found.' });
    }
    res.status(200).json({ message: 'User deleted successfully.' });
  } catch (error) {
    res.status(500).json({ error: 'Server error.' });
  }
};

// GET /user/getAll
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ error: 'Server error.' });
  }
};

// POST /user/upload-image
const uploadImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded.' });
    }

    const imageUrl = `/images/${req.file.filename}`;
    res.status(200).json({ imageUrl });
  } catch (error) {
    res.status(500).json({ error: 'Server error.' });
  }
};

// POST /user/login
const loginUser = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required.' });
  }

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid credentials.' });
    }

    // Create token
    const token = jwt.sign(
      { userId: user._id, email: user.email },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '24h' }
    );

    // Send response without password
    const userResponse = {
      id: user._id,
      fullName: user.fullName,
      email: user.email
    };

    res.status(200).json({ 
      message: 'Login successful.',
      token,
      user: userResponse
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error.' });
  }
};

module.exports = { createUser, updateUser, deleteUser, getAllUsers, uploadImage, loginUser };