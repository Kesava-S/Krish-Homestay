import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import BookingForm from './components/BookingForm';

function App() {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/book" element={<div className="section container" style={{ marginTop: '80px' }}><BookingForm /></div>} />
        {/* Add other routes as needed */}
      </Routes>
    </Router>
  );
}

export default App;
