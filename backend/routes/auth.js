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
  journal: user.journal,
  hasEmergencyContacts: user.hasEmergencyContacts
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
    const allowedUpdates = ['mood', 'streak', 'level', 'xp', 'emotionalScore'];
    
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
    
    // Simple XP boost for journaling
    req.user.xp += 50;
    if (req.user.xp >= 1000) {
      req.user.xp = 0;
      req.user.level += 1;
    }

    await req.user.save();
    res.json(userResponse(req.user));
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error during journal entry' });
  }
});

module.exports = router;

