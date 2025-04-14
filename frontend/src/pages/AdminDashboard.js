import React, { useState, useEffect } from 'react';

const AdminDashboard = () => {
    const [statistics, setStatistics] = useState([]);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchStatistics = async () => {
            try {
                const response = await fetch('http://localhost:5000/api/branch-statistics', {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('token')}`,
                    },
                });

                if (response.ok) {
                    const data = await response.json();
                    setStatistics(data);
                } else {
                    setError('Failed to fetch branch statistics.');
                }
            } catch (err) {
                console.error('Error fetching branch statistics:', err);
                setError('Something went wrong. Please try again later.');
            }
        };

        fetchStatistics();
    }, []);

    return (
        <div>
            <h1>Admin Dashboard</h1>
            {error && <p style={{ color: 'red' }}>{error}</p>}
            <h2>Branch Statistics</h2>
            <ul>
                {statistics.map((stat, index) => (
                    <li key={index}>
                        {stat.branch_name} - Total Bookings: {stat.total_bookings}, Total Revenue: ₹{stat.total_revenue}
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default AdminDashboard;
