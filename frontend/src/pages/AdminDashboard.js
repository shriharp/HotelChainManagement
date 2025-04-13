import React, { useState, useEffect } from 'react';

const AdminDashboard = () => {
    const [branches, setBranches] = useState([]);

    useEffect(() => {
        const fetchBranches = async () => {
            const response = await fetch('http://localhost:5000/api/branches');
            const data = await response.json();
            setBranches(data);
        };

        fetchBranches();
    }, []);

    return (
        <div>
            <h1>Admin Dashboard</h1>
            <ul>
                {branches.map((branch) => (
                    <li key={branch.branch_id}>
                        {branch.branch_name} - Profit: ${branch.profit}
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default AdminDashboard;
