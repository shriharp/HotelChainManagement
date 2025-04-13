import React, { useState, useEffect } from 'react';

const GuestRestaurantOrders = () => {
    const [menu, setMenu] = useState([]);

    useEffect(() => {
        const fetchMenu = async () => {
            try {
                const response = await fetch('http://localhost:5000/api/menu', {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('token')}`,
                    },
                });
                const data = await response.json();
                setMenu(data);
            } catch (err) {
                console.error('Error fetching menu:', err);
            }
        };

        fetchMenu();
    }, []);

    const handleOrder = async (menuItemId) => {
        try {
            const response = await fetch('http://localhost:5000/api/order', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${localStorage.getItem('token')}`,
                },
                body: JSON.stringify({ menuItemId }),
            });

            if (response.ok) {
                alert('Order placed successfully!');
            } else {
                alert('Failed to place order.');
            }
        } catch (err) {
            console.error('Error placing order:', err);
        }
    };

    return (
        <div>
            <h1>Restaurant Menu</h1>
            <ul>
                {menu.map((item) => (
                    <li key={item.id}>
                        {item.name} - ${item.price}
                        <button onClick={() => handleOrder(item.id)}>Order</button>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default GuestRestaurantOrders;
