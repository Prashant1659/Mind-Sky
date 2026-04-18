const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret_for_local_dev';

const auth = require('../middleware/auth');

const userResponse = (user) => ({
  id: user._id,
  email: user.email,
  fullName: user.fullName,
  selectedGuide: user.selectedGuide,
  mood: user.mood,
  streak: user.streak,
  level: user.level,
  xp: user.xp,
  emotionalScore: user.emotionalScore,
  journal: user.journal || [],
  moodLogs: user.moodLogs || [],
  assessments: user.assessments || [],
  hasEmergencyContacts: user.hasEmergencyContacts,
  completedActivities: user.completedActivities || []
});

// Register
router.post('/register', async (req, res) => {
  try {
    const { email, password, ...onboardingData } = req.body;

    let user = await User.findOne({ email });
    if (user) return res.status(400).json({ message: 'User already exists' });

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    user = new User({
      email,
      password: hashedPassword,
      ...onboardingData,
      streak: 1 // Start streak on registration
    });

    await user.save();

    const payload = { userId: user._id };
    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });

    res.status(201).json({ token, user: userResponse(user) });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error during registration' });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'Invalid credentials' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

    const payload = { userId: user._id };
    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });

    res.json({ token, user: userResponse(user) });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error during login' });
  }
});

// Update Profile (Mood, Streak, etc.)
router.put('/update-profile', auth, async (req, res) => {
  try {
    const updates = req.body;
    const allowedUpdates = [
      'mood', 'streak', 'level', 'xp', 'emotionalScore', 
      'selectedGuide', 'fullName', 'phone', 'location', 'goals'
    ];
    
    allowedUpdates.forEach(update => {
      if (updates[update] !== undefined) {
        req.user[update] = updates[update];
      }
    });

    await req.user.save();
    res.json(userResponse(req.user));
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error during profile update' });
  }
});

// Add Journal Entry
router.post('/add-journal', auth, async (req, res) => {
  try {
    const { text } = req.body;
    if (!text) return res.status(400).json({ message: 'Journal text is required' });

    req.user.journal.unshift({ text, date: new Date() });
    
    // XP for journaling: 200 XP
    req.user.xp += 200;
    if (req.user.xp >= 1000) {
      req.user.xp -= 1000;
      req.user.level += 1;
    }

    await req.user.save();
    res.json(userResponse(req.user));
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error during journal entry' });
  }
});

// Complete Activity (Gamification)
router.post('/complete-activity', auth, async (req, res) => {
  try {
    const { activityText } = req.body;
    if (!activityText) return res.status(400).json({ message: 'Activity text is required' });

    const user = req.user;
    
    // Initialize if not present
    if (!user.completedActivities) {
      user.completedActivities = [];
    }

    // Check if already completed to prevent spam
    if (user.completedActivities.includes(activityText)) {
      return res.status(400).json({ message: 'Activity already completed' });
    }

    // Add to completed list
    user.completedActivities.push(activityText);

    // Grant XP
    user.xp += 150;
    
    // Handle Level Up
    if (user.xp >= 1000) {
      const remainder = user.xp - 1000;
      user.level += 1;
      user.xp = remainder;
    }

    // Optional: Boost emotional score slightly on activity completion
    if (user.emotionalScore < 100) {
      user.emotionalScore = Math.min(100, user.emotionalScore + 2);
    }

    await user.save();
    res.json(userResponse(user));
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error completing activity' });
  }
});

// Add XP atomically (avoids frontend race conditions)
router.post('/add-xp', auth, async (req, res) => {
  try {
    const { amount, mood } = req.body;
    if (!amount || typeof amount !== 'number' || amount <= 0) {
      return res.status(400).json({ message: 'Invalid XP amount' });
    }

    // Re-fetch fresh user from DB to avoid stale reads
    const User = require('../models/User');
    const freshUser = await User.findById(req.user._id);

    freshUser.xp = (freshUser.xp || 0) + amount;

    // Handle potentially multiple level-ups
    while (freshUser.xp >= 1000) {
      freshUser.xp -= 1000;
      freshUser.level = (freshUser.level || 1) + 1;
    }

    // Optionally update mood and record log in the same save
    if (mood) {
      freshUser.mood = mood;
      // Initialize if not present (legacy migration safety)
      if (!freshUser.moodLogs) freshUser.moodLogs = [];
      freshUser.moodLogs.push({ mood, date: new Date() });
    }

    await freshUser.save();
    res.json(userResponse(freshUser));
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error adding XP' });
  }
});

module.exports = router;
