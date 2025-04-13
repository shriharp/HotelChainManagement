import React, { useState, useEffect } from 'react';

const GuestHotelFacilities = () => {
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
        // Logic to use a facility
    };

    return (
        <div>
            <h1>Hotel Facilities</h1>
            <ul>
                {facilities.map((facility) => (
                    <li key={facility.facility_id}>
                        {facility.facility_name} - ${facility.usage_fee}
                        <button onClick={() => handleUseFacility(facility.facility_id)}>Use</button>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default GuestHotelFacilities;
