import React, { useState } from 'react';

const Login = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');

        try {
            const response = await fetch('http://localhost:5000/api/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username, password }),
            });

            const data = await response.json();

            if (response.ok) {
                localStorage.setItem('token', data.token);

                if (data.role === 'GUEST') {
                    const bookingId = data.bookingId; // Assuming bookingId is returned in the response

                    if (bookingId) {
                        localStorage.setItem('bookingId', bookingId);
                        window.location.href = '/guest-dashboard';
                    } else {
                        window.location.href = '/guest/city-selection';
                    }
                } else {
                    window.location.href = data.redirect;
                }
            } else {
                setError(data.message || 'Invalid credentials');
                console.error('Login failed:', data.message); // Log the backend message for debugging
            }
        } catch (err) {
            setError('Something went wrong. Please try again later.');
            console.error('Error during login:', err); // Log any errors in the request
        }
    };

    return (
        <div>
            <h1>Login</h1>
            <form onSubmit={handleLogin}>
                <input
                    type="text"
                    placeholder="Username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                />
                <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                />
                <button type="submit">Login</button>
            </form>
            {error && <p style={{ color: 'red' }}>{error}</p>}
        </div>
    );
};

export default Login;
