import React from 'react';

const AdminDashboard = () => {
    const branches = [
        { id: 1, name: 'Trident Mumbai', location: 'Nariman Point, Mumbai', contact: '02212345678', totalSales: '₹1,20,00,000', totalRoomsBooked: 1200 },
        { id: 2, name: 'Trident Delhi', location: 'Connaught Place, Delhi', contact: '01187654321', totalSales: '₹95,00,000', totalRoomsBooked: 950 },
        { id: 3, name: 'Trident Bangalore', location: 'MG Road, Bangalore', contact: '08099887766', totalSales: '₹1,10,00,000', totalRoomsBooked: 1100 },
        { id: 4, name: 'Trident Hyderabad', location: 'Jubilee Hills, Hyderabad', contact: '8008802275', totalSales: '₹85,00,000', totalRoomsBooked: 850 },
    ];

    return (
        <div>
            <h1>Admin Dashboard</h1>
            <h2>Branch Details</h2>
            <ul>
                {branches.map((branch) => (
                    <li key={branch.id}>
                        <strong>{branch.name}</strong><br />
                        Location: {branch.location}<br />
                        Contact: {branch.contact}<br />
                        Total Sales: {branch.totalSales}<br />
                        Total Rooms Booked: {branch.totalRoomsBooked}
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default AdminDashboard;
