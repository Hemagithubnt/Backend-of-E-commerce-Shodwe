import http from 'http';
import nodemailer from 'nodemailer';

// Configure the SMTP transporter
const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com', // Gmail SMTP host
  port: 587, // Changed from 465 to 587 (TLS instead of SSL - works better on servers)
  secure: false, // false for port 587, true for port 465
  auth: {
    user: process.env.EMAIL, // YOUR Gmail email
    pass: process.env.EMAIL_PASS, // YOUR Gmail App Password (NOT regular password)
  },
});

// Function to send email
async function sendEmail(to, subject, text, html) {
  try {
    const info = await transporter.sendMail({
      from: process.env.EMAIL, // Sender address
      to: to, // List of receivers
      subject: subject, // Subject line
      text: text, // Plain text body
      html: html, // HTML body
    });

    console.log('✅ Email sent successfully:', info.messageId);
    
    return {
      success: true,
      messageId: info.messageId
    };
  } catch (error) {
    console.error('❌ Error sending email:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

export { sendEmail };
