import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Phone, Mail, Wifi, Coffee, Shield, Wind, Camera, Instagram } from 'lucide-react';
import BookingForm from '../components/BookingForm';

const VideoPlayer = ({ src }) => {
    const videoRef = React.useRef(null);

    React.useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    videoRef.current.play().catch(e => console.log("Autoplay prevented", e));
                } else {
                    videoRef.current.pause();
                }
            },
            { threshold: 0.5 } // Play when 50% visible
        );

        if (videoRef.current) {
            observer.observe(videoRef.current);
        }

        return () => {
            if (videoRef.current) {
                observer.unobserve(videoRef.current);
            }
        };
    }, []);

    return (
        <video
            ref={videoRef}
            controls
            loop
            muted
            playsInline
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        >
            <source src={src} type="video/mp4" />
            Your browser does not support the video tag.
        </video>
    );
};

const Home = () => {
    return (
        <div className="home">
            {/* Hero Section */}
            <section className="hero" style={{
                backgroundImage: 'linear-gradient(rgba(0,0,0,0.3), rgba(0,0,0,0.3)), url(/assets/hero.png)',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                height: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                textAlign: 'center',
                padding: '0 20px',
                position: 'relative'
            }}>
                <div className="hero-content" style={{ zIndex: 2 }}>
                    <h1 style={{ fontSize: 'clamp(2.5rem, 5vw, 5rem)', marginBottom: '20px', color: 'white', textShadow: '0 2px 10px rgba(0,0,0,0.3)' }}>Krish Homestay</h1>
                    <p style={{ fontSize: 'clamp(1rem, 2vw, 1.5rem)', marginBottom: '30px', maxWidth: '800px', margin: '0 auto 30px', textShadow: '0 1px 5px rgba(0,0,0,0.3)' }}>
                        Experience tranquility in a traditional Kerala home with soothing mountain views in Munnar.
                    </p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', alignItems: 'center' }}>
                        <Link to="/book" className="btn btn-primary" style={{ fontSize: '1.2rem', padding: '15px 40px' }}>Book Your Stay</Link>
                        <a href="https://wa.me/917305395094" target="_blank" rel="noreferrer" className="btn btn-primary" style={{
                            fontSize: '1.2rem',
                            padding: '15px 40px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '10px'
                        }}>
                            <Phone size={20} /> Chat on WhatsApp
                        </a>
                    </div>
                </div>
            </section>

            {/* About Section */}
            <section id="about" className="section container">
                <div className="grid-3" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', alignItems: 'center' }}>
                    <div>
                        <h2>About Our Homestay</h2>
                        <p className="mt-4">
                            Stay in a traditional Kerala home where tranquility and cleanliness come first. With soothing mountain views and a naturally calm atmosphere, it’s the perfect retreat for travellers seeking an immersive, genuine Munnar experience.
                        </p>
                        <p className="mt-4">
                            We offer a 3BHK private rental home with a caretaker, ensuring you have privacy and comfort.
                        </p>
                        <div className="mt-4" style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <MapPin color="var(--primary)" /> Munnar
                            </div>
                            <a href="https://maps.app.goo.gl/hPvtGG5KCE4GGYf2A" target="_blank" rel="noreferrer" className="btn btn-primary" style={{ padding: '8px 20px', fontSize: '0.9rem' }}>
                                View on Google Maps
                            </a>
                        </div>
                    </div>
                    <div>
                        <img src="/assets/about_image.jpg" alt="About Krish Homestay" style={{ width: '100%', borderRadius: '20px', boxShadow: 'var(--shadow)' }} />
                    </div>
                </div>
            </section>

            {/* Amenities */}
            <section id="amenities" className="section" style={{ background: 'white' }}>
                <div className="container">
                    <h2 className="text-center mb-4">Amenities</h2>
                    <div className="grid-3">
                        <div className="glass-card text-center">
                            <Wifi size={40} color="var(--primary)" />
                            <h3 className="mt-4">High-Speed WiFi</h3>
                            <p>Stay connected while enjoying nature.</p>
                        </div>
                        <div className="glass-card text-center">
                            <Coffee size={40} color="var(--primary)" />
                            <h3 className="mt-4">Home-Cooked Meals</h3>
                            <p>Authentic Kerala breakfast and meals on request.</p>
                        </div>
                        <div className="glass-card text-center">
                            <Shield size={40} color="var(--primary)" />
                            <h3 className="mt-4">Safe & Secure</h3>
                            <p>CCTV secured property with 24/7 power backup.</p>
                        </div>
                        <div className="glass-card text-center">
                            <Wind size={40} color="var(--primary)" />
                            <h3 className="mt-4">Nature Views</h3>
                            <p>Balcony with tea garden and valley views.</p>
                        </div>
                        <div className="glass-card text-center">
                            <Camera size={40} color="var(--primary)" />
                            <h3 className="mt-4">Sightseeing</h3>
                            <p>Guided trekking and sightseeing arrangements.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Rooms */}
            <section id="rooms" className="section container">
                <div className="grid-3" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', alignItems: 'center' }}>
                    <div>
                        <img src="/assets/cozy_room_new.jpg" alt="Room" style={{ width: '100%', borderRadius: '20px', boxShadow: 'var(--shadow)' }} />
                    </div>
                    <div>
                        <h2>Cozy Rooms</h2>
                        <p className="mt-4">
                            Our 3BHK home features spotlessly clean rooms with comfortable beds, fresh linens, and attached bathrooms with 24/7 hot water.
                        </p>
                        <ul style={{ listStyle: 'none', marginTop: '20px' }}>
                            <li style={{ marginBottom: '10px' }}>✓ Spacious Wardrobes</li>
                            <li style={{ marginBottom: '10px' }}>✓ Tea/Coffee Kettle</li>
                            <li style={{ marginBottom: '10px' }}>✓ Basic Toiletries</li>
                            <li style={{ marginBottom: '10px' }}>✓ Daily Housekeeping</li>
                        </ul>
                        <Link to="/book" className="btn btn-primary mt-4">Check Availability</Link>
                    </div>
                </div>
            </section>

            {/* Gallery Section */}
            <section id="gallery" className="section" style={{ background: 'white' }}>
                <div className="container">
                    <h2 className="text-center mb-4">Gallery</h2>
                    <p className="text-center mb-5">Explore our beautiful property and surroundings.</p>

                    <div className="gallery-grid" style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                        gap: '20px'
                    }}>
                        {/* Images */}
                        <img src="/assets/gallery_1.jpg" alt="Living Area" style={{ width: '100%', height: '450px', objectFit: 'cover', borderRadius: '10px', transition: 'transform 0.3s' }} className="gallery-item" />
                        <img src="/assets/gallery_2.jpg" alt="Balcony View" style={{ width: '100%', height: '450px', objectFit: 'cover', borderRadius: '10px' }} className="gallery-item" />
                        <img src="/assets/gallery_3.jpg" alt="Balcony Seating" style={{ width: '100%', height: '450px', objectFit: 'cover', borderRadius: '10px' }} className="gallery-item" />
                        <img src="/assets/gallery_4.jpg" alt="Parking & Entrance" style={{ width: '100%', height: '450px', objectFit: 'cover', borderRadius: '10px' }} className="gallery-item" />
                        <img src="/assets/gallery_5.jpg" alt="Outdoor Dining" style={{ width: '100%', height: '450px', objectFit: 'cover', borderRadius: '10px' }} className="gallery-item" />

                        {/* Video 1 */}
                        <div style={{ position: 'relative', height: '450px', borderRadius: '10px', overflow: 'hidden', background: '#000' }}>
                            <VideoPlayer src="/assets/video1.mp4" />
                        </div>
                    </div>
                </div>

            </section>



            {/* Booking Section */}
            <section id="book" className="section" style={{ background: 'var(--bg-light)' }}>
                <div className="container">
                    <BookingForm />
                </div>
            </section>

            {/* Footer */}
            <footer style={{ background: 'var(--bg-dark)', color: 'white', padding: '50px 0' }}>
                <div className="container grid-3">
                    <div>
                        <h3 style={{ color: 'white' }}>Krish Homestay</h3>
                        <p className="mt-4">Your home away from home in Munnar.</p>
                    </div>
                    <div>
                        <h3 style={{ color: 'white' }}>Contact Us</h3>
                        <p className="mt-4">Phone: +91 73053 95094</p>
                        <p>Email: krishhomestays@gmail.com</p>
                        <a href="https://wa.me/917305395094" target="_blank" rel="noreferrer" className="btn btn-primary mt-4">
                            Chat on WhatsApp
                        </a>
                        <a href="https://www.instagram.com/krish_homestay_munnar?igsh=Y200NDRvbHE1MmZv" target="_blank" rel="noreferrer" className="btn mt-4" style={{ background: '#E1306C', color: 'white', display: 'flex', alignItems: 'center', gap: '10px', justifyContent: 'center' }}>
                            <Instagram size={20} /> Follow on Instagram
                        </a>
                    </div>
                    <div>
                        <h3 style={{ color: 'white' }}>Location</h3>
                        <p className="mt-4">Munnar, Kerala, India</p>
                        <a href="https://maps.app.goo.gl/hPvtGG5KCE4GGYf2A" target="_blank" rel="noreferrer" style={{ textDecoration: 'underline', color: 'var(--primary-light)' }}>
                            Get Directions
                        </a>
                    </div>
                </div>
                <div className="text-center mt-4" style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '20px' }}>
                    <p>&copy; 2025 Krish Homestay. All rights reserved.</p>
                </div>
            </footer>
        </div >
    );
};

export default Home;
