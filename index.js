require('dotenv').config();
const express = require('express');
const cors = require('cors');

const authRoutes = require('./src/routes/auth');
const userRoutes = require('./src/routes/user');
const moodRoutes = require('./src/routes/mood');
const chatRoutes = require('./src/routes/chat');
const checkinRoutes = require('./src/routes/checkin');
const gameRoutes = require('./src/routes/game');
const { startScheduler } = require('./src/scheduler');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/mood', moodRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/checkin', checkinRoutes);
app.use('/api/game', gameRoutes);

// Health check
app.get('/health', async (req, res) => {
  // Test Supabase connection
  const { error } = await require('./src/supabaseClient')
    .from('users')
    .select('count')
    .limit(1);

  res.status(200).json({
    status: 'ok',
    message: 'BloomBetter backend is running',
    timestamp: new Date().toISOString(),
    database: error ? '❌ disconnected' : '✅ connected',
    scheduler: '✅ running',
    environment: process.env.NODE_ENV || 'development'
  });
});

// Start the scheduler
startScheduler();

app.listen(PORT, () => {
  console.log(`✅ BloomBetter backend running on port ${PORT}`);
});