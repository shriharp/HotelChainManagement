import React, { useState, useEffect } from 'react';

const BranchStaffDashboard = () => {
    const [guests, setGuests] = useState([]);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchGuests = async () => {
            try {
                const response = await fetch('http://localhost:5000/api/branch-guests', {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('token')}`,
                    },
                });

                if (response.ok) {
                    const data = await response.json();
                    setGuests(data);
                } else {
                    setError('Failed to fetch guests.');
                }
            } catch (err) {
                console.error('Error fetching guests:', err);
                setError('Something went wrong. Please try again later.');
            }
        };

        fetchGuests();
    }, []);

    return (
        <div>
            <h1>Branch Staff Dashboard</h1>
            {error && <p style={{ color: 'red' }}>{error}</p>}
            <h2>Guests Currently Staying</h2>
            <ul>
                {guests.map((guest) => (
                    <li key={guest.booking_id}>
                        {guest.guest_name} - Room {guest.room_number} - Check-in: {guest.check_in_date} - Check-out: {guest.check_out_date}
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default BranchStaffDashboard;