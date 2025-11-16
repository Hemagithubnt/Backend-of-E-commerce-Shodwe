import axios from 'axios';

// Function to send email using Resend
async function sendEmail(to, subject, text, html) {
  try {
    const response = await axios.post('https://api.resend.com/emails', {
      from: 'E-commerce Shodwe <noreply@resend.dev>', // Resend default sender - works out of box
      to: to,
      subject: subject,
      html: html,
    }, {
      headers: {
        'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      }
    });

    console.log('✅ Email sent successfully:', response.data.id);
    
    return {
      success: true,
      messageId: response.data.id
    };
  } catch (error) {
    console.error('❌ Error sending email:', error.response?.data || error.message);
    return {
      success: false,
      error: error.message
    };
  }
}

export { sendEmail };
