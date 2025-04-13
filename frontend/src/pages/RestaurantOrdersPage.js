import React, { useState, useEffect } from 'react';

const RestaurantOrdersPage = () => {
    const [menu, setMenu] = useState([]);

    useEffect(() => {
        const fetchMenu = async () => {
            const response = await fetch('http://localhost:5000/api/menu');
            const data = await response.json();
            setMenu(data);
        };

        fetchMenu();
    }, []);

    const handleOrder = async (menuItemId) => {
        try {
            const response = await fetch('http://localhost:5000/api/order', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ menuItemId }),
            });

            if (response.ok) {
                alert('Order placed successfully!');
            } else {
                alert('Failed to place order.');
            }
        } catch (err) {
            alert('Something went wrong. Please try again later.');
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

export default RestaurantOrdersPage;
