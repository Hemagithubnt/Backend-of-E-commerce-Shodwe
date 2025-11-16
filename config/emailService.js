import axios from 'axios';

async function sendEmail(to, subject, text, html) {
  try {
    const response = await axios.post('https://api.resend.com/emails', {
      from: 'E-commerce Shodwe <noreply@resend.dev>',
      to: process.env.EMAIL, // Use YOUR email (hmt364134@gmail.com) for testing
      subject: subject,
      html: html,
    }, {
      headers: {
        'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      }
    });

    console.log('✅ Email sent to:', process.env.EMAIL);
    return { success: true, messageId: response.data.id };
  } catch (error) {
    console.error('❌ Error sending email:', error.response?.data || error.message);
    return { success: false, error: error.message };
  }
}

export { sendEmail };
