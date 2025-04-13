import React, { useState, useEffect } from 'react';

const HotelFacilitiesPage = () => {
    const [facilities, setFacilities] = useState([]);

    useEffect(() => {
        const fetchFacilities = async () => {
            const response = await fetch('http://localhost:5000/api/facilities');
            const data = await response.json();
            setFacilities(data);
        };

        fetchFacilities();
    }, []);

    const handleUseFacility = async (facilityId) => {
        try {
            const response = await fetch('http://localhost:5000/api/use-facility', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ facilityId }),
            });

            if (response.ok) {
                alert('Facility used successfully!');
            } else {
                alert('Failed to use facility.');
            }
        } catch (err) {
            alert('Something went wrong. Please try again later.');
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

export default HotelFacilitiesPage;
