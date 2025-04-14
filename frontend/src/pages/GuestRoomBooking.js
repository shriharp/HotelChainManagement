import React, { useState, useEffect } from 'react';

const GuestRoomBooking = () => {
    const [rooms, setRooms] = useState([]);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchRooms = async () => {
            const city = localStorage.getItem('selectedCity');
            const checkInDate = '2025-04-14'; // Replace with actual date input
            const checkOutDate = '2025-04-15'; // Replace with actual date input

            try {
                const response = await fetch(
                    `http://localhost:5000/api/available-rooms?branchName=${city}&checkInDate=${checkInDate}&checkOutDate=${checkOutDate}`
                );
                const data = await response.json();
                if (response.ok) {
                    setRooms(Array.isArray(data) ? data : []);
                } else {
                    setError('Failed to fetch rooms.');
                }
            } catch (err) {
                console.error('Error fetching available rooms:', err);
                setError('Something went wrong. Please try again later.');
            }
        };

        fetchRooms();
    }, []);

    const handleBooking = async (roomId) => {
        const checkInDate = '2025-04-14'; // Replace with actual date input
        const checkOutDate = '2025-04-15'; // Replace with actual date input

        try {
            const response = await fetch(`http://localhost:5000/api/book-room`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${localStorage.getItem('token')}`, // Include JWT token
                },
                body: JSON.stringify({ roomId, checkInDate, checkOutDate }),
            });

            if (response.ok) {
                const bookingData = await response.json();
                localStorage.setItem('bookingId', bookingData.booking_id); // Save bookingId to localStorage

                // Update booking status to 'CHECKED_IN'
                await fetch(`http://localhost:5000/api/update-booking-status`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${localStorage.getItem('token')}`,
                    },
                    body: JSON.stringify({ bookingId: bookingData.booking_id }),
                });

                alert('Room booked successfully!');
                window.location.href = '/guest-dashboard';
            } else {
                const errorData = await response.json();
                alert(`Failed to book room: ${errorData.message}`);
            }
        } catch (err) {
            console.error('Error booking room:', err);
            alert('Something went wrong. Please try again later.');
        }
    };

    return (
        <div>
            <h1>Available Rooms</h1>
            {error && <p style={{ color: 'red' }}>{error}</p>}
            <ul>
                {rooms.length > 0 ? (
                    rooms.map((room) => (
                        <li key={room.room_id}>
                            {room.room_number} - {room.room_type} - ${room.price_per_night}
                            <button onClick={() => handleBooking(room.room_id)}>Book</button>
                        </li>
                    ))
                ) : (
                    <p>No rooms available.</p>
                )}
            </ul>
        </div>
    );
};

export default GuestRoomBooking;
