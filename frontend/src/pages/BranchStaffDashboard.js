import React, { useState, useEffect } from 'react';

const BranchStaffDashboard = () => {
    const [rooms, setRooms] = useState([]);

    useEffect(() => {
        const fetchRooms = async () => {
            const response = await fetch('http://localhost:5000/api/branch-rooms');
            const data = await response.json();
            setRooms(data);
        };

        fetchRooms();
    }, []);

    const handleAddGuest = async (roomId) => {
        const guestName = prompt('Enter guest name:');
        if (!guestName) return;

        try {
            const response = await fetch('http://localhost:5000/api/add-guest', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ roomId, guestName }),
            });

            if (response.ok) {
                alert('Guest added successfully!');
                window.location.reload();
            } else {
                alert('Failed to add guest.');
            }
        } catch (err) {
            alert('Something went wrong. Please try again later.');
        }
    };

    return (
        <div>
            <h1>Branch Staff Dashboard</h1>
            <ul>
                {rooms.map((room) => (
                    <li key={room.room_id}>
                        Room {room.room_number} - {room.isBooked ? 'Booked' : 'Available'}
                        {!room.isBooked && (
                            <button onClick={() => handleAddGuest(room.room_id)}>Add Guest</button>
                        )}
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default BranchStaffDashboard;