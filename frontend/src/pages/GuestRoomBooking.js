import React, { useState, useEffect } from 'react';

const GuestRoomBooking = () => {
    const [rooms, setRooms] = useState([]);

    useEffect(() => {
        const fetchRooms = async () => {
            const city = localStorage.getItem('selectedCity');
            const response = await fetch(`http://localhost:5000/api/rooms?city=${city}`);
            const data = await response.json();
            setRooms(data);
        };

        fetchRooms();
    }, []);

    const handleBooking = async (roomId) => {
        try {
            const response = await fetch(`http://localhost:5000/api/book-room`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ roomId }),
            });

            if (response.ok) {
                alert('Room booked successfully!');
                window.location.href = '/guest-dashboard';
            } else {
                alert('Failed to book room.');
            }
        } catch (err) {
            alert('Something went wrong. Please try again later.');
        }
    };

    return (
        <div>
            <h1>Available Rooms</h1>
            <ul>
                {rooms.map((room) => (
                    <li key={room.room_id}>
                        {room.room_number} - {room.room_type} - ${room.price_per_night}
                        <button onClick={() => handleBooking(room.room_id)}>Book</button>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default GuestRoomBooking;
