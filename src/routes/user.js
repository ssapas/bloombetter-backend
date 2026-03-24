const express = require('express');
const router = express.Router();
const supabase = require('../supabaseClient');
const authenticate = require('../middleware/authenticate');

// GET /api/user — get current user's profile
router.get('/', authenticate, async (req, res) => {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', req.user.id)
    .single();

  if (error) {
    return res.status(404).json({ error: 'User not found' });
  }

  res.status(200).json(data);
});

// PATCH /api/user — update current user's profile
router.patch('/', authenticate, async (req, res) => {
  const { name, babyName, babyDob, checkInTime } = req.body;

  const updates = {};
  if (name) updates.name = name;
  if (babyName) updates.baby_name = babyName;
  if (babyDob) updates.baby_dob = babyDob;
  if (checkInTime) updates.check_in_time = checkInTime;

  const { data, error } = await supabase
    .from('users')
    .update(updates)
    .eq('id', req.user.id)
    .select()
    .single();

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  res.status(200).json({ message: 'Profile updated', user: data });
});

module.exports = router;