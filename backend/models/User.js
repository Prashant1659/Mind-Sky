const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const UserSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  
  // Onboarding Data
  fullName: { type: String, required: true },
  phone: { type: String },
  dob: { type: String },
  location: { type: String },
  language: { type: String, default: 'English' },
  gender: { type: String },
  selectedGuide: { type: String },
  
  // Step 3
  institution: { type: String },
  course: { type: String },
  semester: { type: Number },
  studentId: { type: String },
  
  // Step 4
  sleep: { type: Number },
  activity: { type: String },
  social: { type: String },
  
  // Step 5
  baselineRatings: {
    q1: { type: Number },
    q2: { type: Number },
    q3: { type: Number },
  },
  
  // Step 6
  screening: {
    s1: { type: Boolean },
    s2: { type: Boolean },
    s3: { type: Boolean },
    s4: { type: Boolean },
    s5: { type: Boolean },
  },
  
  // Step 7
  goals: [{ type: String }],
  
  // Step 8
  consent1: { type: Boolean },
  consent2: { type: Boolean },
  consent3: { type: Boolean },
  consent4: { type: Boolean },
  consent5: { type: Boolean },
  
  // Current Experience
  // Current Experience & Gamification
  mood: { type: String, default: '😊' },
  streak: { type: Number, default: 0 },
  level: { type: Number, default: 1 },
  xp: { type: Number, default: 0 },
  emotionalScore: { type: Number, default: 75 },
  suggestedActivity: { type: String },
  journal: [{ 
    text: { type: String, required: true },
    date: { type: Date, default: Date.now }
  }],

  // AI Gateway fields
  sessionId: { type: String, default: () => uuidv4() },
  lastAiInsight: { type: mongoose.Schema.Types.Mixed, default: null },
  assessments: [{ type: mongoose.Schema.Types.Mixed }],
  chatHistory: [{
    role:      { type: String, enum: ['user', 'assistant'], required: true },
    content:   { type: String, required: true },
    timestamp: { type: Date, default: Date.now }
  }],
}, { timestamps: true });



module.exports = mongoose.model('User', UserSchema);
