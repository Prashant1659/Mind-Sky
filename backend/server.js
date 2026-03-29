require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const authRoutes       = require('./routes/auth');
const aiRoutes         = require('./routes/ai');
const assessmentRoutes = require('./routes/assessment');
const dashboardRoutes  = require('./routes/dashboard');
const { MongoMemoryServer } = require('mongodb-memory-server');

const app = express();

// Middleware
app.use(express.json());
app.use(cors());

// Routes
app.use('/api/auth',        authRoutes);
app.use('/api/ai',          aiRoutes);
app.use('/api/assessment',  assessmentRoutes);
app.use('/api/dashboard',   dashboardRoutes);

// MongoDB Connection
const PORT = process.env.PORT || 5001;

async function startServer() {
  try {
    let mongoUri = process.env.MONGO_URI;
    
    if (!mongoUri) {
      console.log('No MONGO_URI provided. Starting in-memory MongoDB for seamless local development...');
      const mongoServer = await MongoMemoryServer.create();
      mongoUri = mongoServer.getUri();
    }

    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB successfully');
    
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  } catch (err) {
    console.error('Failed to start server due to MongoDB connection error:', err);
  }
}

startServer();
