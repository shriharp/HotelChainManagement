import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const GuestCitySelection = () => {
    const [city, setCity] = useState('');
    const navigate = useNavigate();

    const handleCitySelection = () => {
        if (city) {
            localStorage.setItem('selectedCity', city);
            navigate('/guest/room-booking');
        } else {
            alert('Please select a city.');
        }
    };

    return (
        <div>
            <h1>Select City</h1>
            <select value={city} onChange={(e) => setCity(e.target.value)}>
                <option value="">Select a city</option>
                <option value="Mumbai">Mumbai</option>
                <option value="Delhi">Delhi</option>
                <option value="Bangalore">Bangalore</option>
            </select>
            <button onClick={handleCitySelection}>Next</button>
        </div>
    );
};

export default GuestCitySelection;
