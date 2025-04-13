import React, { useState, useEffect } from 'react';

const GuestCheckout = () => {
    const [bill, setBill] = useState({ total: 0, pending: 0 });

    useEffect(() => {
        const fetchBill = async () => {
            try {
                const response = await fetch('http://localhost:5000/api/checkout', {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('token')}`,
                    },
                });
                const data = await response.json();
                setBill(data);
            } catch (err) {
                console.error('Error fetching bill:', err);
            }
        };

        fetchBill();
    }, []);

    const handlePayment = async () => {
        try {
            const response = await fetch('http://localhost:5000/api/pay', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${localStorage.getItem('token')}`,
                },
            });

            if (response.ok) {
                alert('Payment successful!');
                window.location.href = '/guest-dashboard';
            } else {
                alert('Payment failed. Please try again.');
            }
        } catch (err) {
            console.error('Error during payment:', err);
        }
    };

    return (
        <div>
            <h1>Checkout</h1>
            <p>Total Bill: ${bill.total}</p>
            <p>Pending Dues: ${bill.pending}</p>
            <button onClick={handlePayment}>Pay Now</button>
        </div>
    );
};

export default GuestCheckout;
