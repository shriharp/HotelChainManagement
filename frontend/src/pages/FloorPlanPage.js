import React, { useState, useEffect } from 'react';

const FloorPlanPage = () => {
    const [rooms, setRooms] = useState([]);

    useEffect(() => {
        const fetchRooms = async () => {
            const response = await fetch('http://localhost:5000/api/floor-plan');
            const data = await response.json();
            setRooms(data);
        };

        fetchRooms();
    }, []);

    return (
        <div>
            <h1>Floor Plan</h1>
            <ul>
                {rooms.map((room) => (
                    <li key={room.room_id}>
                        Room {room.room_number} - {room.isBooked ? 'Booked' : 'Available'}
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default FloorPlanPage;
