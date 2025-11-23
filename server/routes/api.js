const express = require('express');
const router = express.Router();
const pool = require('../db');
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
        const result = await pool.query("SELECT check_in_date, check_out_date FROM bookings WHERE status = 'confirmed'");
        res.json(result.rows);
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
        // Check overlap: (StartA < EndB) and (EndA > StartB)
        const overlapCheck = await pool.query(
            `SELECT * FROM bookings 
       WHERE status = 'confirmed' 
       AND (check_in_date < $1 AND check_out_date > $2)`,
            [check_out_date, check_in_date]
        );

        if (overlapCheck.rows.length > 0) {
            return res.status(409).json({ error: 'Dates already booked' });
        }

        const result = await pool.query(
            `INSERT INTO bookings (guest_name, email, phone, check_in_date, check_out_date, guests_count, total_amount)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
            [guest_name, email, phone, check_in_date, check_out_date, guests_count, total_amount]
        );

        // Send Email
        await sendConfirmationEmail(result.rows[0]);

        // Create Calendar Event
        await createCalendarEvent(result.rows[0]);

        console.log(`Booking confirmed for ${email}`);

        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

// Admin: Get all bookings
router.get('/bookings', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM bookings ORDER BY created_at DESC');
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: 'Server error' });
    }
});

// Admin: Cancel booking
router.post('/bookings/:id/cancel', async (req, res) => {
    const { id } = req.params;
    try {
        const result = await pool.query("UPDATE bookings SET status = 'cancelled' WHERE id = $1 RETURNING *", [id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Booking not found' });
        }
        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: 'Server error' });
    }
});

module.exports = router;
