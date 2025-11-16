import http from "http";
import nodemailer from "nodemailer";

//configure the SMTP transporter
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com", //e.g. , 'smtp.gmail.com' for Gmail
  port: 465, // or 465 for secure
  secure: true, // true for port 465, false for other ports
  auth: {
    user: process.env.EMAIL, 
    pass: process.env.EMAIL_PASS, 
  },
});

// Function to send email
async function sendEmail(to, subject, text, html) {
  try {
    const info = await transporter.sendMail({
      from: process.env.EMAIL, //sender address
      to, //list of receivers
      subject, // Subject line
      text, // plain text body
      html, // html body
    });
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error("error sending email:", error);
    return { success: false, error: error.message };
  }
}

export {sendEmail};
