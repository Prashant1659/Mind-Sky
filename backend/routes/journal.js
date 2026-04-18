const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const User = require('../models/User');

// Helper: strip user doc down to journal response shape
const journalResponse = (user) => ({
  journal: user.journal || [],
  moodLogs: user.moodLogs || [],
  assessments: user.assessments || [],
  xp: user.xp,
  level: user.level,
});

// ── GET /api/journal ─────────────────────────────────────────────────
// Returns all journal entries for the authenticated user (newest first)
router.get('/', auth, async (req, res) => {
  try {
    const entries = req.user.journal || [];
    res.json({ journal: entries });
  } catch (err) {
    console.error('[GET /api/journal]', err);
    res.status(500).json({ message: 'Failed to fetch journal entries' });
  }
});

// ── POST /api/journal ─────────────────────────────────────────────────
// Create a new journal entry
router.post('/', auth, async (req, res) => {
  try {
    const { text, title, mood } = req.body;
    if (!text || !text.trim()) {
      return res.status(400).json({ message: 'Journal text is required' });
    }

    const entry = {
      title: title?.trim() || '',
      text: text.trim(),
      mood: mood || '😊',
      date: new Date(),
    };

    req.user.journal.unshift(entry);

    // XP boost for journaling
    req.user.xp = (req.user.xp || 0) + 50;
    if (req.user.xp >= 1000) {
      req.user.xp = req.user.xp - 1000;
      req.user.level = (req.user.level || 1) + 1;
    }

    await req.user.save();
    res.status(201).json(journalResponse(req.user));
  } catch (err) {
    console.error('[POST /api/journal]', err);
    res.status(500).json({ message: 'Failed to save journal entry' });
  }
});

// ── PUT /api/journal/:entryId ────────────────────────────────────────
// Update an existing journal entry
router.put('/:entryId', auth, async (req, res) => {
  try {
    const { entryId } = req.params;
    const { text, title, mood } = req.body;

    const entry = req.user.journal.id(entryId);
    if (!entry) {
      return res.status(404).json({ message: 'Journal entry not found' });
    }

    if (text !== undefined) entry.text = text.trim();
    if (title !== undefined) entry.title = title.trim();
    if (mood !== undefined) entry.mood = mood;
    entry.updatedAt = new Date();

    await req.user.save();
    res.json({ entry, journal: req.user.journal });
  } catch (err) {
    console.error('[PUT /api/journal/:entryId]', err);
    res.status(500).json({ message: 'Failed to update journal entry' });
  }
});

// ── DELETE /api/journal/:entryId ─────────────────────────────────────
// Delete a single journal entry
router.delete('/:entryId', auth, async (req, res) => {
  try {
    const { entryId } = req.params;
    const entry = req.user.journal.id(entryId);
    if (!entry) {
      return res.status(404).json({ message: 'Journal entry not found' });
    }

    entry.deleteOne();
    await req.user.save();
    res.json({ message: 'Entry deleted', journal: req.user.journal });
  } catch (err) {
    console.error('[DELETE /api/journal/:entryId]', err);
    res.status(500).json({ message: 'Failed to delete journal entry' });
  }
});

// ── DELETE /api/journal ───────────────────────────────────────────────
// Delete ALL journal entries for the user
router.delete('/', auth, async (req, res) => {
  try {
    req.user.journal = [];
    await req.user.save();
    res.json({ message: 'All entries deleted', journal: [] });
  } catch (err) {
    console.error('[DELETE /api/journal]', err);
    res.status(500).json({ message: 'Failed to clear journal' });
  }
});

module.exports = router;
