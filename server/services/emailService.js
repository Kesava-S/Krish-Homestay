const nodemailer = require('nodemailer');
require('dotenv').config();

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER, // krishhomestays@gmail.com
        pass: process.env.EMAIL_PASS, // App Password (NOT the regular password)
    },
});

async function sendConfirmationEmail(bookingDetails) {
    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: bookingDetails.email,
        subject: 'Booking Confirmation - Krish Homestay',
        html: `
      <h1>Booking Confirmed!</h1>
      <p>Dear ${bookingDetails.guest_name},</p>
      <p>Thank you for booking with Krish Homestay.</p>
      <h3>Booking Details:</h3>
      <ul>
        <li><strong>Check-in:</strong> ${bookingDetails.check_in_date}</li>
        <li><strong>Check-out:</strong> ${bookingDetails.check_out_date}</li>
        <li><strong>Guests:</strong> ${bookingDetails.guests_count}</li>
        <li><strong>Total Amount:</strong> ₹${bookingDetails.total_amount}</li>
      </ul>
      <p>We look forward to hosting you!</p>
      <p>Regards,<br>Krish Homestay Team</p>
    `,
    };

    try {
        const info = await transporter.sendMail(mailOptions);
        console.log('Email sent: ' + info.response);
        return info;
    } catch (error) {
        console.error('Error sending email:', error);
        return null;
    }
}

module.exports = { sendConfirmationEmail };
