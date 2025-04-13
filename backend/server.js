const express = require('express');
const cors = require('cors'); // Import cors
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { pool } = require('./config/db');
const { seedUsers } = require('./queries/authQueries');
const { getAvailableRooms } = require('./queries/guestQueries');

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
                const currentDate = new Date().toISOString().split('T')[0];
                const bookingResult = await pool.query(
                    `SELECT * FROM Booking 
                     WHERE guest_id = $1 AND $2 BETWEEN check_in_date AND check_out_date`,
                    [guest.guest_id, currentDate]
                );

                const token = jwt.sign({ id: guest.guest_id, role: 'GUEST' }, SECRET_KEY);

                if (bookingResult.rows.length > 0) {
                    return res.json({ token, role: 'GUEST', redirect: '/guest-dashboard' });
                } else {
                    return res.json({ token, role: 'GUEST', redirect: '/guest/city-selection' });
                }
            }
        }

        res.status(401).json({ message: 'Invalid username or password' });
    } catch (err) {
        console.error('Error during login:', err);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// API to fetch available rooms
app.get('/api/available-rooms', async (req, res) => {
    const { branchId, checkInDate, checkOutDate } = req.query;

    try {
        const rooms = await getAvailableRooms(branchId, checkInDate, checkOutDate);
        res.json(rooms);
    } catch (err) {
        console.error('Error fetching available rooms:', err);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// API to book a room
app.post('/api/book-room', async (req, res) => {
    const { roomId } = req.body;
    const token = req.headers.authorization?.split(' ')[1];

    try {
        const decoded = jwt.verify(token, SECRET_KEY);
        const guestId = decoded.id;

        // Check if guestId exists in the Guest table
        const guestCheck = await pool.query('SELECT * FROM Guest WHERE guest_id = $1', [guestId]);
        if (guestCheck.rows.length === 0) {
            return res.status(400).json({ message: 'Invalid guest ID' });
        }

        const result = await pool.query(
            `INSERT INTO Booking (room_id, guest_id, booking_status, check_in_date, check_out_date)
             VALUES ($1, $2, 'RESERVED', CURRENT_DATE, CURRENT_DATE + INTERVAL '1 day') RETURNING *`,
            [roomId, guestId]
        );

        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error('Error booking room:', err);
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

// filepath: /Users/shriharpande/Documents/mit/sem 4/dbms/TridentHotel/backend/server.js
app.get('/api/branches', async (req, res) => {
    try {
        const result = await pool.query('SELECT branch_id, branch_name FROM Branch');
        res.json(result.rows);
    } catch (err) {
        console.error('Error fetching branches:', err);
        res.status(500).json({ message: 'Internal server error' });
    }
});
