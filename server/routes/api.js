const express = require('express');
const router = express.Router();
const { getBookings, addBooking } = require('../services/sheetsService');
const { createCalendarEvent } = require('../services/calendarService');
const { sendConfirmationEmail } = require('../services/emailService');
const { createPaymentIntent } = require('../services/paymentService');

// Create Payment Intent
router.post('/create-payment-intent', async (req, res) => {
    const { amount } = req.body;
    try {
        const paymentIntent = await createPaymentIntent(amount);
        res.json({ clientSecret: paymentIntent.client_secret });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get availability (booked dates)
router.get('/availability', async (req, res) => {
    try {
        const bookings = await getBookings();
        // Filter only confirmed bookings
        const confirmedBookings = bookings.filter(b => b.status === 'confirmed');

        // Return just the dates needed for the frontend
        const bookedDates = confirmedBookings.map(b => ({
            check_in_date: b.check_in_date,
            check_out_date: b.check_out_date
        }));

        res.json(bookedDates);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

// Create booking
router.post('/bookings', async (req, res) => {
    const { guest_name, email, phone, check_in_date, check_out_date, guests_count, total_amount } = req.body;

    if (!guest_name || !email || !check_in_date || !check_out_date) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    try {
        const bookings = await getBookings();

        // Check overlap
        const newStart = new Date(check_in_date);
        const newEnd = new Date(check_out_date);

        const hasOverlap = bookings.some(booking => {
            if (booking.status !== 'confirmed') return false;
            const start = new Date(booking.check_in_date);
            const end = new Date(booking.check_out_date);
            return (newStart < end && newEnd > start);
        });

        if (hasOverlap) {
            return res.status(409).json({ error: 'Dates already booked' });
        }

        // Add to Google Sheet
        const newBooking = {
            guest_name,
            email,
            phone,
            check_in_date,
            check_out_date,
            guests_count,
            total_amount
        };

        const savedBooking = await addBooking(newBooking);

        // Send Email
        await sendConfirmationEmail(savedBooking);

        // Create Calendar Event
        await createCalendarEvent(savedBooking);

        console.log(`Booking confirmed for ${email}`);

        res.status(201).json(savedBooking);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

module.exports = router;
