const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const User = require('../models/User');

// All routes are protected
router.use(auth);

// Add friend
router.post('/friends/add/:userId', async (req, res) => {
  try {
    const friend = await User.findById(req.params.userId);
    if (!friend) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (req.user.friends.includes(friend._id)) {
      return res.status(400).json({ message: 'Already friends with this user' });
    }

    req.user.friends.push(friend._id);
    await req.user.save();

    res.json({ message: 'Friend added successfully', friend: friend });
  } catch (error) {
    res.status(500).json({ message: 'Error adding friend', error: error.message });
  }
});

// Remove friend
router.delete('/friends/remove/:userId', async (req, res) => {
  try {
    req.user.friends = req.user.friends.filter(
      friendId => friendId.toString() !== req.params.userId
    );
    await req.user.save();

    res.json({ message: 'Friend removed successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error removing friend', error: error.message });
  }
});

// Update preferences
router.put('/preferences', async (req, res) => {
  try {
    const { foodType, cuisine, spiceLevel, dietaryRestrictions } = req.body;
    
    req.user.preferences = {
      ...req.user.preferences,
      foodType: foodType || req.user.preferences.foodType,
      cuisine: cuisine || req.user.preferences.cuisine,
      spiceLevel: spiceLevel || req.user.preferences.spiceLevel,
      dietaryRestrictions: dietaryRestrictions || req.user.preferences.dietaryRestrictions
    };

    await req.user.save();
    res.json({ message: 'Preferences updated successfully', preferences: req.user.preferences });
  } catch (error) {
    res.status(500).json({ message: 'Error updating preferences', error: error.message });
  }
});

// Update allergies
router.put('/allergies', async (req, res) => {
  try {
    const { allergies } = req.body;
    
    req.user.allergies = allergies;
    await req.user.save();

    res.json({ message: 'Allergies updated successfully', allergies: req.user.allergies });
  } catch (error) {
    res.status(500).json({ message: 'Error updating allergies', error: error.message });
  }
});

module.exports = router;