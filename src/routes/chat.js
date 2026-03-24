const express = require('express');
const router = express.Router();
const supabase = require('../supabaseClient');
const authenticate = require('../middleware/authenticate');

// GET /api/chat/history — get last 10 messages for a session
router.get('/history', authenticate, async (req, res) => {
  const { sessionId } = req.query;

  if (!sessionId) {
    return res.status(400).json({ error: 'sessionId is required' });
  }

  const { data, error } = await supabase
    .from('chat_messages')
    .select('*')
    .eq('session_id', sessionId)
    .eq('user_id', req.user.id)
    .order('created_at', { ascending: true })
    .limit(10);

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  res.status(200).json({ messages: data });
});

module.exports = router;