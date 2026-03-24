const supabase = require('../supabaseClient');

async function authenticate(req, res, next) {
  // Get the token from the request header
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Missing or invalid token' });
  }

  const token = authHeader.split(' ')[1];

  // Verify the token with Supabase
  const { data: { user }, error } = await supabase.auth.getUser(token);

  if (error || !user) {
    return res.status(401).json({ error: 'Unauthorised' });
  }

  // Attach user to request so routes can use it
  req.user = user;
  next();
}

module.exports = authenticate;