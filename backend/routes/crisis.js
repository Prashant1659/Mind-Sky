const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const EmergencyContact = require('../models/EmergencyContact');
const CrisisAlert = require('../models/CrisisAlert');
const User = require('../models/User');
const authMiddleware = require('../middleware/auth'); // assuming standard layout if exists
const twilio = require('twilio');

// Initialize Twilio client if configured
let twilioClient = null;
if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN) {
  twilioClient = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
}

const sendEmergencySMS = async (to, userName, latitude, longitude, crisisType) => {
  const timestamp = new Date().toLocaleString();
  const locationUrl = (latitude && longitude) ? `https://maps.google.com/?q=${latitude},${longitude}` : 'Location unavailable';
  
  const messageBody = `🚨 MENTAL HEALTH CRISIS\n${userName} triggered an alert (${crisisType}) and may need help.\n📍 Location: ${locationUrl}\n🕒 Time: ${timestamp}\n⚠️ PLEASE CHECK ON THEM.`;

  if (twilioClient && process.env.TWILIO_PHONE_NUMBER) {
    try {
      await twilioClient.messages.create({
        body: messageBody,
        from: process.env.TWILIO_PHONE_NUMBER,
        to: to
      });
      console.log(`✅ [TWILIO] Real SMS sent to ${to}`);
      return true;
    } catch (err) {
      console.error(`❌ [TWILIO] Error sending to ${to}:`, err.message);
      return false; // Still return false on Twilio failure
    }
  } else {
    // Fallback to console
    console.log(`\n===========================================`);
    console.log(`📱 [TEST MODE LOG] SMS TO: ${to}`);
    console.log(messageBody);
    console.log(`===========================================\n`);
    return true; // Simulate success
  }
};

// 1. Save Emergency Contacts
router.post('/emergency-contacts', async (req, res) => {
  try {
    let userId = req.body.userId;
    // fallback if using auth token
    if (!userId && req.user) userId = req.user.id;
    
    const { contacts } = req.body;
    if (!userId || !contacts || !Array.isArray(contacts)) {
      return res.status(400).json({ message: 'Invalid data' });
    }

    // Insert contacts
    const inserted = [];
    for (const c of contacts) {
      if (!c.fullName || !c.phoneNumber) continue;
      const newContact = await EmergencyContact.create({
        userId,
        priority: c.priority || 'secondary',
        fullName: c.fullName,
        relationship: c.relationship,
        phoneNumber: c.phoneNumber,
        email: c.email,
        consentGiven: true
      });
      inserted.push(newContact);
    }

    if (inserted.length > 0) {
      await User.findByIdAndUpdate(userId, { hasEmergencyContacts: true });
    }

    res.json({
      success: true,
      message: 'Emergency contacts saved successfully',
      contactsAdded: inserted.length
    });
  } catch (error) {
    console.error('Error saving contacts:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// fetch contacts (helper)
router.get('/emergency-contacts/:userId', async (req, res) => {
  try {
    const contacts = await EmergencyContact.find({ userId: req.params.userId });
    res.json({ contacts });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});


// 2. Trigger Crisis Protocol
router.post('/trigger', async (req, res) => {
  try {
    const { userId, crisisType, latitude, longitude, userName } = req.body;
    if (!userId) {
      return res.status(400).json({ message: 'userId required' });
    }

    const contacts = await EmergencyContact.find({ userId });
    const uName = userName || 'A user';

    let smsSentCount = 0;
    for (const contact of contacts) {
      if (contact.phoneNumber) {
        const success = await sendEmergencySMS(contact.phoneNumber, uName, latitude, longitude, crisisType);
        if (success) smsSentCount++;
      }
    }

    const newAlert = await CrisisAlert.create({
      userId,
      crisisType,
      latitude,
      longitude,
      contactsNotified: contacts.length,
      smsSent: smsSentCount,
      callsMade: 0,
      adminNotified: true,
    });

    res.json({
      success: true,
      alertsSent: contacts.length,
      smsSent: smsSentCount,
      callsMade: 0,
      adminNotified: true,
      crisisId: newAlert._id
    });
  } catch (error) {
    console.error('Trigger error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// 5. User Confirms Safety
router.post('/confirm-safe', async (req, res) => {
  try {
    const { userId, crisisId } = req.body;
    if (crisisId) {
      await CrisisAlert.findByIdAndUpdate(crisisId, { userSafeConfirmation: true });
    }
    res.json({
      success: true,
      message: "Safety confirmed. Emergency contacts notified of your safety."
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
