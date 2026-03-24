const express = require('express');
const router = express.Router();
const supabase = require('../supabaseClient');

// POST /api/auth/register
router.post('/register', async (req, res) => {
  const { email, password, name, babyName, babyDob } = req.body;

  if (!email || !password || !name) {
    return res.status(400).json({ error: 'Email, password and name are required' });
  }

  // Create auth user in Supabase
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password
  });

  if (authError) {
    return res.status(400).json({ error: authError.message });
  }

  // Create profile in users table
  const { error: profileError } = await supabase
    .from('users')
    .insert({
      id: authData.user.id,
      email,
      name,
      baby_name: babyName || null,
      baby_dob: babyDob || null
    });

  if (profileError) {
    return res.status(500).json({ error: profileError.message });
  }

  res.status(201).json({
    message: 'Account created successfully',
    user: authData.user
  });
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  });

  if (error) {
    return res.status(401).json({ error: 'Invalid email or password' });
  }

  res.status(200).json({
    message: 'Login successful',
    session: data.session,
    user: data.user
  });
});

module.exports = router;