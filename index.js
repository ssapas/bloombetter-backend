require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Health check endpoint — Railway uses this to confirm the server is alive
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    message: 'BloomBetter backend is running',
    timestamp: new Date().toISOString()
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`✅ BloomBetter backend running on port ${PORT}`);
});