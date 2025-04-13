import React, { useState, useEffect } from 'react';

const GuestRestaurantOrders = () => {
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
        // Logic to place an order
    };

    return (
        <div>
            <h1>Restaurant Menu</h1>
            <ul>
                {menu.map((item) => (
                    <li key={item.menu_item_id}>
                        {item.item_name} - ${item.item_price}
                        <button onClick={() => handleOrder(item.menu_item_id)}>Order</button>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default GuestRestaurantOrders;
