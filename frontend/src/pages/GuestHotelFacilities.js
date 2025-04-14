import React, { useState, useEffect } from 'react';

const GuestHotelFacilities = () => {
    const [facilities, setFacilities] = useState([]);
    const [error, setError] = useState('');
    

    useEffect(() => {
        const fetchFacilities = async () => {
            const branchName = localStorage.getItem('selectedCity'); // Ensure branchName is retrieved correctly

            if (!branchName) {
                setError('Branch name is missing. Please select a branch.');
                return;
            }

            try {
                const response = await fetch(`http://localhost:5000/api/facilities?branchName=${branchName}`, {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('token')}`,
                    },
                });
                const data = await response.json();

                if (response.ok && Array.isArray(data)) {
                    setFacilities(data); // Ensure data is an array
                } else {
                    setFacilities([]); // Fallback to an empty array
                    setError('Failed to fetch facilities.');
                }
            } catch (err) {
                console.error('Error fetching facilities:', err);
                setFacilities([]); // Fallback to an empty array
                setError('Something went wrong. Please try again later.');
            }
        };

        fetchFacilities();
    }, []);

    const handleUseFacility = async (facilityId) => {
        const bookingId = localStorage.getItem('bookingId'); // Retrieve bookingId from localStorage
        if (!bookingId) {
            alert('Booking ID is missing. Please ensure you are checked in.');
            return;
        }

        try {
            const response = await fetch('http://localhost:5000/api/use-facility', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${localStorage.getItem('token')}`,
                },
                body: JSON.stringify({ facilityId, bookingId }), // Include bookingId in the request body
            });

            if (response.ok) {
                alert('Facility used successfully!');
            } else {
                const errorData = await response.json();
                alert(`Failed to use facility: ${errorData.message}`);
            }
        } catch (err) {
            console.error('Error using facility:', err);
            alert('Something went wrong. Please try again later.');
        }
    };

    return (
        <div>
            <h1>Hotel Facilities</h1>
            {error && <p style={{ color: 'red' }}>{error}</p>}
            <ul>
                {facilities.length > 0 ? (
                    facilities.map((facility) => (
                        <li key={facility.facility_id}>
                            {facility.facility_name} - ${facility.usage_fee}
                            <button onClick={() => handleUseFacility(facility.facility_id)}>Use</button>
                        </li>
                    ))
                ) : (
                    <p>No facilities available.</p>
                )}
            </ul>
        </div>
    );
};

export default GuestHotelFacilities;
