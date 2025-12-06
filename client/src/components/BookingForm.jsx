import React, { useState, useEffect } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { format } from 'date-fns';
import API_URL from '../config';
import './BookingForm.css';

const BookingForm = () => {
    const [dateRange, setDateRange] = useState(null);
    const [calendarData, setCalendarData] = useState({ bookedRanges: [], rules: {} });
    const [formData, setFormData] = useState({
        guest_name: '',
        email: '',
        phone: '',
        guests_count: 6,
    });
    const [step, setStep] = useState('details'); // details, payment, success
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        fetch(`${API_URL}/api/calendar-data`)
            .then(res => res.json())
            .then(data => {
                setCalendarData(data);
            })
            .catch(err => console.error(err));
    }, []);

    const isDateUnavailable = (date) => {
        const dateStr = format(date, 'yyyy-MM-dd');
        if (calendarData.rules[dateStr]?.status === 'blocked') return true;
        return calendarData.bookedRanges.some(range => {
            const start = new Date(range.start);
            const end = new Date(range.end);
            start.setHours(0, 0, 0, 0);
            end.setHours(0, 0, 0, 0);
            const d = new Date(date);
            d.setHours(0, 0, 0, 0);
            return d >= start && d < end;
        });
    };

    const getPriceForDate = (date) => {
        const dateStr = format(date, 'yyyy-MM-dd');
        return calendarData.rules[dateStr]?.price || 7000;
    };

    const calculateTotal = () => {
        if (!dateRange || !dateRange[0] || !dateRange[1]) return 0;
        let total = 0;
        let current = new Date(dateRange[0]);
        const end = new Date(dateRange[1]);
        while (current < end) {
            total += getPriceForDate(current);
            current.setDate(current.getDate() + 1);
        }
        return total;
    };

    const handleDetailsSubmit = (e) => {
        e.preventDefault();
        setError('');
        if (!dateRange || !dateRange[0] || !dateRange[1]) {
            setError('Please select check-in and check-out dates');
            return;
        }
        const checkIn = dateRange[0];
        const checkOut = dateRange[1];
        const nights = Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24));
        if (nights < 1) {
            setError('Minimum stay is 1 night');
            return;
        }
        setStep('payment');
    };

    const handlePayment = async () => {
        setLoading(true);
        setError('');
        const totalAmount = calculateTotal();

        try {
            // 1. Create Order
            const res = await fetch(`${API_URL}/api/create-payment-order`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ amount: totalAmount })
            });
            const order = await res.json();

            if (!res.ok) throw new Error(order.error || 'Failed to create order');

            // 2. Open Razorpay
            const options = {
                key: import.meta.env.VITE_RAZORPAY_KEY_ID,
                amount: order.amount,
                currency: order.currency,
                name: "Krish Homestay",
                description: "Booking Payment",
                order_id: order.id,
                handler: async function (response) {
                    await handleBookingCreation(response);
                },
                prefill: {
                    name: formData.guest_name,
                    email: formData.email,
                    contact: formData.phone
                },
                theme: {
                    color: "#3399cc"
                }
            };

            const rzp1 = new window.Razorpay(options);
            rzp1.on('payment.failed', function (response) {
                setError(response.error.description);
                setLoading(false);
            });
            rzp1.open();

        } catch (err) {
            setError(err.message);
            setLoading(false);
        }
    };

    const handleBookingCreation = async (paymentResponse) => {
        const checkIn = dateRange[0];
        const checkOut = dateRange[1];
        const totalAmount = calculateTotal();

        try {
            const res = await fetch(`${API_URL}/api/bookings`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...formData,
                    check_in_date: format(checkIn, 'yyyy-MM-dd'),
                    check_out_date: format(checkOut, 'yyyy-MM-dd'),
                    total_amount: totalAmount,
                    payment_id: paymentResponse.razorpay_payment_id,
                    order_id: paymentResponse.razorpay_order_id,
                    signature: paymentResponse.razorpay_signature
                })
            });

            if (!res.ok) {
                const errData = await res.json();
                throw new Error(errData.error || 'Booking failed after payment');
            }

            setStep('success');
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    if (step === 'success') {
        return (
            <div className="glass-card text-center section" style={{ padding: '50px' }}>
                <h2 style={{ color: 'var(--primary)', marginBottom: '20px' }}>Booking Confirmed!</h2>
                <p>Thank you, {formData.guest_name}.</p>
                <p>We have sent a confirmation to <strong>{formData.email}</strong>.</p>
                <button className="btn btn-primary mt-4" onClick={() => window.location.reload()}>Book Another Stay</button>
            </div>
        );
    }

    const nights = dateRange && dateRange[0] && dateRange[1] ? Math.ceil((dateRange[1] - dateRange[0]) / (1000 * 60 * 60 * 24)) : 0;
    const totalAmount = calculateTotal();

    const getTileContent = ({ date, view }) => {
        if (view !== 'month') return null;
        if (isDateUnavailable(date)) return null;
        const price = getPriceForDate(date);
        return <div style={{ fontSize: '10px', color: '#888', marginTop: '2px' }}>₹{price}</div>;
    };

    return (
        <div className="booking-container glass-card">
            <h2 className="text-center mb-4">Book Your Stay</h2>

            {step === 'details' ? (
                <div className="booking-grid">
                    <div className="calendar-section">
                        <Calendar
                            selectRange={true}
                            onChange={setDateRange}
                            value={dateRange}
                            tileDisabled={({ date }) => isDateUnavailable(date)}
                            tileContent={getTileContent}
                            minDate={new Date()}
                            className="custom-calendar"
                        />
                        <div className="mt-4 text-center" style={{ fontWeight: '500', color: 'var(--primary)' }}>
                            {nights > 0 ?
                                `${format(dateRange[0], 'MMM dd')} - ${format(dateRange[1], 'MMM dd')} (${nights} nights)`
                                : 'Select Check-in and Check-out dates'}
                        </div>
                    </div>

                    <form onSubmit={handleDetailsSubmit} className="form-section">
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

                        {error && <div className="error-message">{error}</div>}

                        <button type="submit" className="btn btn-primary" style={{ width: '100%', fontSize: '1.1rem' }}>
                            Proceed to Payment
                        </button>
                    </form>
                </div>
            ) : (
                <div className="payment-confirmation text-center">
                    <h3>Confirm Payment</h3>
                    <p className="mb-4">Total Amount: <strong>₹{totalAmount}</strong></p>

                    {error && <div className="error-message mb-3">{error}</div>}

                    <div className="d-flex justify-content-center gap-3">
                        <button className="btn btn-secondary" onClick={() => setStep('details')}>Back</button>
                        <button className="btn btn-primary" onClick={handlePayment} disabled={loading}>
                            {loading ? 'Processing...' : 'Pay with Razorpay'}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default BookingForm;
