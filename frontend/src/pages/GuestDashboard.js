import React from 'react';
import { useNavigate } from 'react-router-dom';

const GuestDashboard = () => {
    const navigate = useNavigate();

    return (
        <div>
            <h1>Guest Dashboard</h1>
            <button onClick={() => navigate('/guest/restaurant-orders')}>Order Food</button>
            <button onClick={() => navigate('/guest/hotel-facilities')}>Use Hotel Facilities</button>
            <button onClick={() => navigate('/guest/checkout')}>Checkout</button>
        </div>
    );
};

export default GuestDashboard;
