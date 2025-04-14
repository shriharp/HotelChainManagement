import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/components.css'; // Corrected the import path

const GuestDashboard = () => {
    const [currentBooking, setCurrentBooking] = useState(null);
    const [loyaltyPoints, setLoyaltyPoints] = useState(0);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        const fetchGuestData = async () => {
            const token = localStorage.getItem('token');
            if (!token) {
                alert('You are not logged in. Please log in to continue.');
                navigate('/login');
                return;
            }

            try {
                // Fetch current booking
                const bookingResponse = await fetch('http://localhost:5000/api/checkout', {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });

                if (bookingResponse.ok) {
                    const bookingData = await bookingResponse.json();
                    setCurrentBooking(bookingData);
                } else {
                    setError('No active booking found.');
                }

                // Fetch loyalty points
                const loyaltyResponse = await fetch('http://localhost:5000/api/guest-loyalty', {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });

                if (loyaltyResponse.ok) {
                    const loyaltyData = await loyaltyResponse.json();
                    setLoyaltyPoints(loyaltyData.loyaltyPoints);
                }
            } catch (err) {
                console.error('Error fetching guest data:', err);
                setError('Something went wrong. Please try again later.');
            }
        };

        fetchGuestData();
    }, [navigate]);

    return (
        <div className="dashboard-container">
            <h1 className="dashboard-title">Welcome to Your Dashboard</h1>
            {error && <p className="error-message">{error}</p>}

            <div className="dashboard-section">
                <h2>Your Current Booking</h2>
                {currentBooking ? (
                    <div>
                        <p><strong>Room:</strong> {currentBooking.roomCost}</p>
                        <p><strong>Facilities Used:</strong></p>
                        <ul>
                            {currentBooking.facilities.map((facility, index) => (
                                <li key={index}>{facility.facility_name} - ₹{facility.usage_cost}</li>
                            ))}
                        </ul>
                        <p><strong>Restaurant Orders:</strong></p>
                        <ul>
                            {currentBooking.restaurantOrders.map((order, index) => (
                                <li key={index}>{order.item_name} (x{order.quantity}) - ₹{order.line_total}</li>
                            ))}
                        </ul>
                        <p><strong>Total Bill:</strong> ₹{currentBooking.totalBill}</p>
                    </div>
                ) : (
                    <p>No active booking found.</p>
                )}
            </div>

            <div className="dashboard-section">
                <h2>Your Loyalty Points</h2>
                <p><strong>Points:</strong> {loyaltyPoints}</p>
            </div>

            <div className="dashboard-actions">
                <button className="dashboard-button" onClick={() => navigate('/guest/restaurant-orders')}>
                    Order Food
                </button>
                <button className="dashboard-button" onClick={() => navigate('/guest/hotel-facilities')}>
                    Use Hotel Facilities
                </button>
                <button className="dashboard-button" onClick={() => navigate('/guest/checkout')}>
                    Check Out
                </button>
            </div>
        </div>
    );
};

export default GuestDashboard;
