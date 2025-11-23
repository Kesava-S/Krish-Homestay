import React, { useState, useEffect } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { format } from 'date-fns';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import API_URL from '../config';
import './BookingForm.css';

// Initialize Stripe (Replace with your Publishable Key)
const stripePromise = loadStripe('pk_test_51...'); // User needs to replace this

const CheckoutForm = ({ bookingData, onPaymentSuccess, onCancel }) => {
    const stripe = useStripe();
    const elements = useElements();
    const [error, setError] = useState(null);
    const [processing, setProcessing] = useState(false);

    const handleSubmit = async (event) => {
        event.preventDefault();
        setProcessing(true);

        if (!stripe || !elements) {
            return;
        }

        // 1. Create Payment Intent on Backend
        const res = await fetch(`${API_URL}/api/create-payment-intent`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ amount: bookingData.total_amount })
        });
        const { clientSecret } = await res.json();

        // 2. Confirm Card Payment
        const result = await stripe.confirmCardPayment(clientSecret, {
            payment_method: {
                card: elements.getElement(CardElement),
                billing_details: {
                    name: bookingData.guest_name,
                    email: bookingData.email,
                },
            },
        });

        if (result.error) {
            setError(result.error.message);
            setProcessing(false);
        } else {
            if (result.paymentIntent.status === 'succeeded') {
                onPaymentSuccess();
            }
        }
    };

    return (
        <form onSubmit={handleSubmit} className="payment-form">
            <h3>Payment Details</h3>
            <p>Total: ₹{bookingData.total_amount}</p>
            <div className="card-element-container">
                <CardElement options={{
                    style: {
                        base: {
                            fontSize: '16px',
                            color: '#424770',
                            '::placeholder': {
                                color: '#aab7c4',
                            },
                        },
                        invalid: {
                            color: '#9e2146',
                        },
                    },
                }} />
            </div>
            {error && <div className="error-message">{error}</div>}
            <div className="payment-actions">
                <button type="button" onClick={onCancel} className="btn btn-secondary">Back</button>
                <button type="submit" disabled={!stripe || processing} className="btn btn-primary">
                    {processing ? 'Processing...' : `Pay ₹${bookingData.total_amount}`}
                </button>
            </div>
        </form>
    );
};

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

        // Check if blocked by admin
        if (calendarData.rules[dateStr]?.status === 'blocked') return true;

        // Check if booked
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

        // Iterate through nights (start date inclusive, end date exclusive)
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

    const handlePaymentSuccess = async () => {
        setLoading(true);
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
                    total_amount: totalAmount
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
                <div className="payment-section">
                    <Elements stripe={stripePromise}>
                        <CheckoutForm
                            bookingData={{ ...formData, total_amount: totalAmount }}
                            onPaymentSuccess={handlePaymentSuccess}
                            onCancel={() => setStep('details')}
                        />
                    </Elements>
                </div>
            )}
        </div>
    );
};

export default BookingForm;
