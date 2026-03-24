const express = require('express');
const router = express.Router();
const supabase = require('../supabaseClient');
const { sendCheckInEmail } = require('../email');

// POST /api/checkin/generate
// Called by the scheduler for each user due a check-in
router.post('/generate', async (req, res) => {
  const { userId, name, email, message } = req.body;

  if (!userId || !name || !email || !message) {
    return res.status(400).json({ error: 'userId, name, email and message are required' });
  }

  try {
    // Send the email
    await sendCheckInEmail(email, name, message);

    // Log the check-in to the database
    const { error: logError } = await supabase
      .from('check_ins')
      .insert({
        user_id: userId,
        message,
        email_delivered: true
      });

    if (logError) {
      return res.status(500).json({ error: logError.message });
    }

    res.status(200).json({ message: 'Check-in sent and logged successfully' });

  } catch (err) {
    console.error('Check-in error:', err);
    res.status(500).json({ error: 'Failed to send check-in email' });
  }
});

module.exports = router;