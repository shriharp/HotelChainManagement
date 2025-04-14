import React, { useState, useEffect } from 'react';

const GuestRestaurantOrders = () => {
    const [menu, setMenu] = useState([]); // Initialize as an empty array
    const [cart, setCart] = useState([]); // Cart to store selected items
    const [totalPrice, setTotalPrice] = useState(0); // Total price of items in the cart
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchMenu = async () => {
            const branchName = localStorage.getItem('selectedCity'); // Use branchName instead of branchId

            if (!branchName || branchName === 'undefined') { // Handle undefined or missing branchName
                setError('Branch name is missing or invalid. Please select a branch.');
                return;
            }

            console.log('Retrieved branchName:', branchName); // Debugging log

            try {
                const response = await fetch(`http://localhost:5000/api/menu?branchName=${branchName}`, {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('token')}`,
                    },
                });
                const data = await response.json();

                if (response.ok && Array.isArray(data)) {
                    setMenu(data); // Set menu only if data is an array
                } else {
                    setError('Failed to fetch menu.');
                }
            } catch (err) {
                console.error('Error fetching menu:', err);
                setError('Something went wrong. Please try again later.');
            }
        };

        fetchMenu();
    }, []);

    const addToCart = (menuItem) => {
        setCart((prevCart) => [...prevCart, menuItem]);
        setTotalPrice((prevTotal) => prevTotal + parseFloat(menuItem.item_price)); // Update total price
    };

    const placeOrder = async () => {
        try {
            const response = await fetch('http://localhost:5000/api/order', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${localStorage.getItem('token')}`,
                },
                body: JSON.stringify({ items: cart }),
            });

            if (response.ok) {
                alert('Order placed successfully!');
                setCart([]); // Clear the cart after successful order
                setTotalPrice(0); // Reset total price
            } else {
                alert('Failed to place order.');
            }
        } catch (err) {
            console.error('Error placing order:', err);
            alert('Something went wrong. Please try again later.');
        }
    };

    return (
        <div>
            <h1>Restaurant Menu</h1>
            {error && <p style={{ color: 'red' }}>{error}</p>}
            <ul>
                {menu.length > 0 ? (
                    menu.map((item) => (
                        <li key={item.menu_item_id}>
                            {item.item_name} - ₹{item.item_price}
                            <button onClick={() => addToCart(item)}>Add to Cart</button>
                        </li>
                    ))
                ) : (
                    <p>No menu items available.</p>
                )}
            </ul>

            <h2>Cart</h2>
            <ul>
                {cart.length > 0 ? (
                    cart.map((item, index) => (
                        <li key={index}>
                            {item.item_name} - ₹{item.item_price}
                        </li>
                    ))
                ) : (
                    <p>Your cart is empty.</p>
                )}
            </ul>

            {cart.length > 0 && (
                <div>
                    <p>Total Price: ₹{totalPrice.toFixed(2)}</p>
                    <button onClick={placeOrder}>Place Order</button>
                </div>
            )}
        </div>
    );
};

export default GuestRestaurantOrders;
