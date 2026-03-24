const express = require('express');
const router = express.Router();
const supabase = require('../supabaseClient');
const authenticate = require('../middleware/authenticate');

// POST /api/mood — save a mood score
router.post('/', authenticate, async (req, res) => {
  const { score, source } = req.body;

  if (!score || score < 1 || score > 10) {
    return res.status(400).json({ error: 'Score must be between 1 and 10' });
  }

  const { data, error } = await supabase
    .from('mood_logs')
    .insert({
      user_id: req.user.id,
      score,
      source: source || 'chat'
    })
    .select()
    .single();

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  res.status(201).json({ message: 'Mood logged', mood: data });
});

module.exports = router;