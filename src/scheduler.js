const cron = require('node-cron');
const supabase = require('./supabaseClient');
const { sendCheckInEmail } = require('./email');

// This function finds all users due a check-in in the current 15-min window
async function getUsersDueCheckIn() {
  const now = new Date();
  const hours = now.getUTCHours().toString().padStart(2, '0');
  const minutes = now.getUTCMinutes();

  // Round down to nearest 1-min window
  const roundedMinutes = minutes.toString().padStart(2, '0');
  const currentWindow = `${hours}:${roundedMinutes}:00`;

  console.log(`⏰ Scheduler running — checking for users with check_in_time: ${currentWindow}`);

  // Find users whose check-in time matches this window
  const { data: users, error } = await supabase
    .from('users')
    .select('id, name, email, check_in_time')
    .eq('check_in_time', currentWindow);

  if (error) {
    console.error('Error fetching users for check-in:', error);
    return [];
  }

  // Filter out users who already received a check-in today
  const today = new Date().toISOString().split('T')[0];

  const filteredUsers = [];

  for (const user of users) {
    const { data: existingCheckIn } = await supabase
      .from('check_ins')
      .select('id')
      .eq('user_id', user.id)
      .gte('sent_at', `${today}T00:00:00Z`)
      .single();

    // Only include users who haven't had a check-in today
    if (!existingCheckIn) {
      filteredUsers.push(user);
    }
  }

  return filteredUsers;
}

// This function triggers the AI message generator and sends the email
async function processCheckIn(user) {
  try {
    console.log(`📧 Processing check-in for ${user.name} (${user.email})`);

    const message = `Good morning ${user.name}! This is your daily check-in from BloomBetter. How are you feeling today?`;

    // Send the email directly
    await sendCheckInEmail(user.email, user.name, message);

    // Log the check-in to the database
    const { error: logError } = await supabase
      .from('check_ins')
      .insert({
        user_id: user.id,
        message,
        email_delivered: true
      });

    if (logError) {
      console.error(`⚠️ Email sent but failed to log check-in:`, logError.message);
    }

    console.log(`✅ Check-in complete for ${user.name}`);

  } catch (err) {
    console.error(`❌ Failed check-in for ${user.name}:`, err.message);
  }
}

// Main scheduler — runs every 1 minute
function startScheduler() {
  console.log('🕐 Check-in scheduler started');

  cron.schedule('*/1 * * * *', async () => {
    const users = await getUsersDueCheckIn();

    if (users.length === 0) {
      console.log('No users due for check-in right now');
      return;
    }

    console.log(`Found ${users.length} user(s) due for check-in`);

    // Process each user one by one
    for (const user of users) {
      await processCheckIn(user);
    }
  });
}

module.exports = { startScheduler };