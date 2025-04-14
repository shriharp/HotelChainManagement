import React, { useState, useEffect } from 'react';

const GuestCheckout = () => {
    const [bill, setBill] = useState(null);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchBill = async () => {
            const token = localStorage.getItem('token');
            if (!token) {
                console.error('No token found in localStorage.');
                alert('You are not logged in. Please log in to continue.');
                return;
            }

            console.log('Attempting to fetch bill from /api/checkout');

            try {
                const response = await fetch('http://localhost:5000/api/checkout', {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });

                if (!response.ok) {
                    console.error('Failed to fetch bill:', response.statusText);
                    setError('Failed to fetch bill. Please try again later.');
                    return;
                }

                const data = await response.json();
                setBill(data);
            } catch (err) {
                console.error('Error fetching bill:', err);
                setError('Something went wrong. Please try again later.');
            }
        };

        fetchBill();
    }, []);

    const handlePayment = () => {
        alert('Payment successful!');
        window.location.href = '/'; // Redirect to the login page
    };

    if (error) {
        return <p style={{ color: 'red' }}>{error}</p>;
    }

    if (!bill) {
        return <p>Loading bill details...</p>;
    }

    return (
        <div>
            <h1>Checkout</h1>
            
            <h2>Room Details</h2>
            <p>Room Cost: ₹{bill.roomCost}</p>

            <h2>Facilities Used</h2>
            <ul>
                {bill.facilities.map((facility, index) => (
                    <li key={index}>
                        {facility.facility_name} - ₹{facility.usage_cost}
                    </li>
                ))}
            </ul>

            <h2>Restaurant Orders</h2>
            <ul>
                {bill.restaurantOrders.map((order, index) => (
                    <li key={index}>
                        {order.item_name} (x{order.quantity}) - ₹{order.line_total}
                    </li>
                ))}
            </ul>

            <h2>Total Bill</h2>
            <p>₹{bill.totalBill}</p>

            <button onClick={handlePayment}>Pay Now</button>
        </div>
    );
};

export default GuestCheckout;
