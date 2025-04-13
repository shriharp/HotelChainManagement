import React, { useState, useEffect } from 'react';

const GuestCheckout = () => {
    const [bill, setBill] = useState({});

    useEffect(() => {
        const fetchBill = async () => {
            const response = await fetch('http://localhost:5000/api/checkout');
            const data = await response.json();
            setBill(data);
        };

        fetchBill();
    }, []);

    const handlePayment = async () => {
        // Logic to pay pending dues
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
