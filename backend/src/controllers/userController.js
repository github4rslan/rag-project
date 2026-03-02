const bcrypt = require('bcryptjs');
const User   = require('../models/User');
const { Document, Chunk } = require('../models/Document');
const { Conversation }    = require('../models/Conversation');

// Get profile + stats
async function getProfile(req, res) {
  try {
    const user = await User.findById(req.user._id).select('-password');

    const totalDocs  = await Document.countDocuments({ userId: req.user._id });
    const totalChats = await Conversation.countDocuments({ userId: req.user._id });

    res.json({
      user,
      stats: { totalDocs, totalChats },
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
}

// Update name
async function updateProfile(req, res) {
  try {
    const { name } = req.body;

    if (!name?.trim()) {
      return res.status(400).json({ error: 'Name is required' });
    }

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { name },
      { new: true }
    ).select('-password');

    res.json({ user, message: 'Profile updated!' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update profile' });
  }
}

// Change password
async function changePassword(req, res) {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'Both fields are required' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }

    const user = await User.findById(req.user._id);
    const isMatch = await user.comparePassword(currentPassword);

    if (!isMatch) {
      return res.status(401).json({ error: 'Current password is incorrect' });
    }

    user.password = newPassword;
    await user.save();

    res.json({ message: 'Password changed successfully!' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to change password' });
  }
}

// Delete account
async function deleteAccount(req, res) {
  try {
    const userId = req.user._id;

    // Delete all user data
    await Document.deleteMany({ userId });
    await Chunk.deleteMany({ userId });
    await Conversation.deleteMany({ userId });
    await User.findByIdAndDelete(userId);

    res.json({ message: 'Account deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete account' });
  }
}

module.exports = { getProfile, updateProfile, changePassword, deleteAccount };