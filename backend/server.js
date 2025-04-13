const express = require('express');
const cors = require('cors'); // Import cors
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { pool } = require('./config/db');
const { seedUsers } = require('./queries/authQueries');

const app = express();
app.use(express.json());
app.use(cors()); // Enable CORS for all routes

const SECRET_KEY = 'your_secret_key';

// Seed initial users
seedUsers();

// Login API
app.post('/api/login', async (req, res) => {
    const { username, password } = req.body;

    try {
        const staffResult = await pool.query(
            'SELECT * FROM Staff WHERE username = $1',
            [username]
        );

        if (staffResult.rows.length > 0) {
            const staff = staffResult.rows[0];
            const isMatch = await bcrypt.compare(password, staff.password);

            if (isMatch) {
                const token = jwt.sign({ id: staff.staff_id, role: staff.role }, SECRET_KEY);
                return res.json({ token, role: staff.role });
            }
        }

        const guestResult = await pool.query(
            'SELECT * FROM Guest WHERE username = $1',
            [username]
        );

        if (guestResult.rows.length > 0) {
            const guest = guestResult.rows[0];
            const isMatch = await bcrypt.compare(password, guest.password);

            if (isMatch) {
                const token = jwt.sign({ id: guest.guest_id, role: 'GUEST' }, SECRET_KEY);
                return res.json({ token, role: 'GUEST' });
            }
        }

        res.status(401).json({ message: 'Invalid username or password' });
    } catch (err) {
        console.error('Error during login:', err);
        res.status(500).json({ message: 'Internal server error' });
    }
});

app.listen(5000, () => {
    console.log('Server is running on port 5000');
});


process.on('SIGTERM', async () => {
  console.log('Shutting down server...');
  await pool.end();  // Close the pool only when shutting down the server
  process.exit(0);
});
