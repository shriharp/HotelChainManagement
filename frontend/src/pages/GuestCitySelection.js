import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const GuestCitySelection = () => {
    const [city, setCity] = useState('');
    const [branches, setBranches] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchBranches = async () => {
            try {
                const response = await fetch('http://localhost:5000/api/branches');
                const data = await response.json();
                setBranches(data);
            } catch (err) {
                console.error('Error fetching branches:', err);
            }
        };

        fetchBranches();
    }, []);

    const handleCitySelection = () => {
        const selectedBranch = branches.find(branch => branch.branch_name === city);

        if (selectedBranch) {
            localStorage.setItem('selectedCity', city);
            localStorage.setItem('selectedBranchId', selectedBranch.branch_id || ''); // Ensure branchId is stored
            navigate('/guest/room-booking');
        } else {
            alert('Please select a valid city.');
        }
    };

    return (
        <div>
            <h1>Select City</h1>
            <select value={city} onChange={(e) => setCity(e.target.value)}>
                <option value="">Select a city</option>
                {branches.map((branch, index) => (
                    <option key={index} value={branch.branch_name}>{branch.branch_name}</option>
                ))}
            </select>
            <button onClick={handleCitySelection}>Next</button>
        </div>
    );
};

export default GuestCitySelection;
