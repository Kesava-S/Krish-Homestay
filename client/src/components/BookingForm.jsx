import React, { useState, useEffect } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { format, parseISO } from 'date-fns';
import './BookingForm.css';

const BookingForm = () => {
    const [dateRange, setDateRange] = useState(null);
    const [bookedDates, setBookedDates] = useState([]);
    const [formData, setFormData] = useState({
        guest_name: '',
        email: '',
        phone: '',
        guests_count: 6,
    });
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        fetch('http://localhost:5000/api/availability')
            .then(res => res.json())
            .then(data => {
                setBookedDates(data);
            })
            .catch(err => console.error(err));
    }, []);

    const isDateBooked = (date) => {
        return bookedDates.some(booking => {
            // Parse dates as local dates to avoid timezone issues if possible, 
            // but ISO strings are usually UTC. We'll assume the API returns YYYY-MM-DD.
            // We need to be careful with timezones.
            const start = new Date(booking.check_in_date);
            const end = new Date(booking.check_out_date);
            // Reset times to compare just dates
            start.setHours(0, 0, 0, 0);
            end.setHours(0, 0, 0, 0);
            date.setHours(0, 0, 0, 0);

            return date >= start && date < end;
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        if (!dateRange || !dateRange[0] || !dateRange[1]) {
            setError('Please select check-in and check-out dates');
            setLoading(false);
            return;
        }

        const checkIn = dateRange[0];
        const checkOut = dateRange[1];

        const nights = Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24));
        if (nights < 1) {
            setError('Minimum stay is 1 night');
            setLoading(false);
            return;
        }

        const totalAmount = nights * 2500; // Base rate 2500

        try {
            const res = await fetch('http://localhost:5000/api/bookings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...formData,
                    check_in_date: format(checkIn, 'yyyy-MM-dd'),
                    check_out_date: format(checkOut, 'yyyy-MM-dd'),
                    total_amount: totalAmount
                })
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || 'Booking failed');
            }

            setSuccess(true);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div className="glass-card text-center section" style={{ padding: '50px' }}>
                <h2 style={{ color: 'var(--primary)', marginBottom: '20px' }}>Booking Confirmed!</h2>
                <p>Thank you, {formData.guest_name}.</p>
                <p>We have sent a confirmation to <strong>{formData.email}</strong> and <strong>{formData.phone}</strong>.</p>
                <button className="btn btn-primary mt-4" onClick={() => window.location.reload()}>Book Another Stay</button>
            </div>
        );
    }

    return (
        <div className="booking-container glass-card">
            <h2 className="text-center mb-4">Book Your Stay</h2>
            <div className="booking-grid">
                <div className="calendar-section">
                    <Calendar
                        selectRange={true}
                        onChange={setDateRange}
                        value={dateRange}
                        tileDisabled={({ date }) => isDateBooked(date)}
                        minDate={new Date()}
                        className="custom-calendar"
                    />
                    <div className="mt-4 text-center" style={{ fontWeight: '500', color: 'var(--primary)' }}>
                        {dateRange && dateRange[0] && dateRange[1] ?
                            `${format(dateRange[0], 'MMM dd')} - ${format(dateRange[1], 'MMM dd')} (${Math.ceil((dateRange[1] - dateRange[0]) / (1000 * 60 * 60 * 24))} nights)`
                            : 'Select Check-in and Check-out dates'}
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="form-section">
                    <div className="form-group">
                        <label>Full Name</label>
                        <input type="text" required value={formData.guest_name} onChange={e => setFormData({ ...formData, guest_name: e.target.value })} placeholder="John Doe" />
                    </div>
                    <div className="form-group">
                        <label>Email</label>
                        <input type="email" required value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} placeholder="john@example.com" />
                    </div>
                    <div className="form-group">
                        <label>Phone / WhatsApp</label>
                        <input type="tel" required value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} placeholder="+91 98765 43210" />
                    </div>
                    <div className="form-group">
                        <label>Guests</label>
                        <select value={formData.guests_count} onChange={e => setFormData({ ...formData, guests_count: parseInt(e.target.value) })}>
                            {[6, 7, 8, 9, 10, 11, 12].map(n => <option key={n} value={n}>{n} Guests</option>)}
                        </select>
                    </div>

                    {error && <div style={{ color: 'red', marginBottom: '15px', padding: '10px', background: '#ffe6e6', borderRadius: '5px' }}>{error}</div>}

                    <button type="submit" className="btn btn-primary" style={{ width: '100%', fontSize: '1.1rem' }} disabled={loading}>
                        {loading ? 'Processing...' : 'Confirm Booking'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default BookingForm;
