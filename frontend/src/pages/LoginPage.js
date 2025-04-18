import React, { useState } from 'react';

const LoginPage = () => {
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
                const { token, role, bookingId } = data; // Assuming bookingId is returned in the response
                localStorage.setItem('token', token);
                if (bookingId) {
                    localStorage.setItem('bookingId', bookingId); // Save bookingId to localStorage
                }
                // Redirect based on role
                if (role === 'ADMIN') {
                    window.location.href = '/admin-dashboard';
                } else if (role === 'STAFF') {
                    window.location.href = '/branch-staff-dashboard';
                } else {
                    window.location.href = '/guest-dashboard';
                }
            } else {
                setError(data.message || 'Invalid credentials');
            }
        } catch (err) {
            setError('Something went wrong. Please try again later.');
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

export default LoginPage;