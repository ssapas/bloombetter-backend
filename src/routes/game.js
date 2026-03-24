const express = require('express');
const router = express.Router();
const supabase = require('../supabaseClient');
const authenticate = require('../middleware/authenticate');

// POST /api/game/log — record a completed game session
router.post('/log', authenticate, async (req, res) => {
  const { gameId, score, durationSeconds } = req.body;

  if (!gameId) {
    return res.status(400).json({ error: 'gameId is required' });
  }

  const { data, error } = await supabase
    .from('game_progress')
    .insert({
      user_id: req.user.id,
      game_id: gameId,
      score: score || null,
      duration_seconds: durationSeconds || null
    })
    .select()
    .single();

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  // Also log a mood score if provided (games can capture mood)
  if (req.body.moodScore) {
    await supabase
      .from('mood_logs')
      .insert({
        user_id: req.user.id,
        score: req.body.moodScore,
        source: 'game'
      });
  }

  res.status(201).json({ message: 'Game progress logged', progress: data });
});

// GET /api/game/history — get user's game history
router.get('/history', authenticate, async (req, res) => {
  const { data, error } = await supabase
    .from('game_progress')
    .select('*')
    .eq('user_id', req.user.id)
    .order('completed_at', { ascending: false })
    .limit(20);

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  res.status(200).json({ history: data });
});

module.exports = router;