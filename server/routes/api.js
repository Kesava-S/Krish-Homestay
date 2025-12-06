const express = require('express');
const router = express.Router();
const { getBookings, addBooking, getCalendarRules, updateCalendarRules } = require('../services/sheetsService');
const { createCalendarEvent } = require('../services/calendarService');
const { sendConfirmationEmail } = require('../services/emailService');
const { createOrder } = require('../services/paymentService');

// Admin Login
router.post('/admin/login', (req, res) => {
    const { username, password } = req.body;
    if (username === 'Kesavaram Sundararaj' && password === 'Sundararaj@786') {
        res.json({ success: true, token: 'admin-session-token' });
    } else {
        res.status(401).json({ error: 'Invalid credentials' });
    }
});

// Get Calendar Data (Bookings + Rules)
router.get('/calendar-data', async (req, res) => {
    try {
        const [bookings, rules] = await Promise.all([getBookings(), getCalendarRules()]);

        // Process Bookings
        const bookedDates = bookings
            .filter(b => b.status === 'confirmed')
            .map(b => ({
                start: b.check_in_date,
                end: b.check_out_date,
                type: 'booked'
            }));

        // Process Rules (Price & Blocks)
        const ruleData = rules.reduce((acc, rule) => {
            acc[rule.date] = {
                price: rule.price,
                status: rule.status
            };
            return acc;
        }, {});

        res.json({ bookedRanges: bookedDates, rules: ruleData });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

// Update Calendar Rules (Admin)
router.post('/admin/rules', async (req, res) => {
    try {
        const { rules } = req.body; // Array of { date, price, status }
        await updateCalendarRules(rules);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Create Payment Order (Razorpay)
router.post('/create-payment-order', async (req, res) => {
    const { amount } = req.body;
    try {
        const order = await createOrder(amount);
        res.json(order);
    } catch (err) {
        res.status(500).json({ error: err.message });
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
        const rules = await getCalendarRules(); // Check for blocked dates too

        // Check overlap with bookings
        const newStart = new Date(check_in_date);
        const newEnd = new Date(check_out_date);

        const hasBookingOverlap = bookings.some(booking => {
            if (booking.status !== 'confirmed') return false;
            const start = new Date(booking.check_in_date);
            const end = new Date(booking.check_out_date);
            return (newStart < end && newEnd > start);
        });

        // Check overlap with blocked dates
        // We iterate through each day of the requested stay
        let currentDate = new Date(newStart);
        let hasBlockOverlap = false;
        while (currentDate < newEnd) {
            const dateStr = currentDate.toISOString().split('T')[0];
            const rule = rules.find(r => r.date === dateStr);
            if (rule && rule.status === 'blocked') {
                hasBlockOverlap = true;
                break;
            }
            currentDate.setDate(currentDate.getDate() + 1);
        }

        if (hasBookingOverlap || hasBlockOverlap) {
            return res.status(409).json({ error: 'Dates not available' });
        }

        // Check for maximum 15 bookings per month
        const checkInMonth = newStart.getMonth();
        const checkInYear = newStart.getFullYear();

        const bookingsInMonth = bookings.filter(b => {
            if (b.status !== 'confirmed') return false;
            const bDate = new Date(b.check_in_date);
            return bDate.getMonth() === checkInMonth && bDate.getFullYear() === checkInYear;
        });

        if (bookingsInMonth.length >= 15) {
            return res.status(409).json({ error: 'Booking limit reached for this month. Please contact us directly.' });
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
