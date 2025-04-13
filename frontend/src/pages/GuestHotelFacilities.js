import React, { useState, useEffect } from 'react';

const GuestHotelFacilities = () => {
    const [facilities, setFacilities] = useState([]);

    useEffect(() => {
        const fetchFacilities = async () => {
            try {
                const response = await fetch('http://localhost:5000/api/facilities', {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('token')}`,
                    },
                });
                const data = await response.json();
                setFacilities(data);
            } catch (err) {
                console.error('Error fetching facilities:', err);
            }
        };

        fetchFacilities();
    }, []);

    const handleUseFacility = async (facilityId) => {
        try {
            const response = await fetch('http://localhost:5000/api/use-facility', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${localStorage.getItem('token')}`,
                },
                body: JSON.stringify({ facilityId }),
            });

            if (response.ok) {
                alert('Facility used successfully!');
            } else {
                alert('Failed to use facility.');
            }
        } catch (err) {
            console.error('Error using facility:', err);
        }
    };

    return (
        <div>
            <h1>Hotel Facilities</h1>
            <ul>
                {facilities.map((facility) => (
                    <li key={facility.id}>
                        {facility.name} - ${facility.usage_fee}
                        <button onClick={() => handleUseFacility(facility.id)}>Use</button>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default GuestHotelFacilities;
