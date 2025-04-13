import React, { useState, useEffect } from 'react';

const StatisticsPage = () => {
    const [stats, setStats] = useState([]);

    useEffect(() => {
        const fetchStats = async () => {
            const response = await fetch('http://localhost:5000/api/statistics');
            const data = await response.json();
            setStats(data);
        };

        fetchStats();
    }, []);

    return (
        <div>
            <h1>Branch Statistics</h1>
            <ul>
                {stats.map((stat) => (
                    <li key={stat.branch_id}>
                        {stat.branch_name}: Profit - ${stat.profit}, Guests - {stat.guest_count}
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default StatisticsPage;
