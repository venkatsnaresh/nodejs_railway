const nodemailer = require("nodemailer");
require("dotenv").config();

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS, // Use App Password here
  },
});

// Function to send an email
const sendMail = async (to, subject, text, html = "") => {
    const mailOptions = {
      from: `"KPMPP" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      text, // Plain text version
      html, // HTML version
    };
  
    return transporter.sendMail(mailOptions);
  };
  

// Ensure proper export
module.exports = sendMail;
