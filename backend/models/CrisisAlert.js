const mongoose = require('mongoose');

const crisisAlertSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  crisisType: {
    type: String,
    enum: ['manual_button', 'ai_detected'],
    required: true
  },
  latitude: { type: Number },
  longitude: { type: Number },
  contactsNotified: { type: Number, default: 0 },
  smsSent: { type: Number, default: 0 },
  callsMade: { type: Number, default: 0 },
  adminNotified: { type: Boolean, default: false },
  userSafeConfirmation: { type: Boolean, default: false }
}, {
  timestamps: true
});

module.exports = mongoose.model('CrisisAlert', crisisAlertSchema);
