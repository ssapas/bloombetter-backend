const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

async function sendCheckInEmail(to, name, message) {
  const msg = {
    to,
    from: process.env.SENDER_EMAIL,
    subject: `Good morning ${name} 🌸`,
    html: `
      <div style="font-family: Georgia, serif; max-width: 600px; margin: 0 auto; padding: 40px; background-color: #fff9f9;">
        <h1 style="color: #c9748a; font-size: 24px;">Good morning, ${name} 💕</h1>
        <p style="color: #555; font-size: 16px; line-height: 1.8;">${message}</p>
        <hr style="border: none; border-top: 1px solid #f0d9de; margin: 30px 0;" />
        <p style="color: #aaa; font-size: 12px;">
          BloomBetter is here to support you — not replace professional care.
          If you're struggling, please reach out to a healthcare provider.
        </p>
      </div>
    `
  };

  await sgMail.send(msg);
  console.log(`✅ Check-in email sent to ${to}`);
}

module.exports = { sendCheckInEmail };