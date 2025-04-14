const express = require('express');
const cors = require('cors'); // Import cors
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { pool } = require('./config/db');
const { seedUsers } = require('./queries/authQueries');
const { getAvailableRooms } = require('./queries/guestQueries');
const { getBranchGuests, bookGuest } = require('./queries/staffQueries');
const { getBranchStatistics } = require('./queries/adminQueries');

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
        // Check if the user is a staff member
        const staffResult = await pool.query(
            'SELECT * FROM Staff WHERE username = $1 AND password = $2',
            [username, password]
        );

        if (staffResult.rows.length > 0) {
            const staff = staffResult.rows[0];
            const token = jwt.sign({ id: staff.staff_id, role: staff.role, branchId: staff.branch_id }, SECRET_KEY);

            if (staff.role === 'ADMIN') {
                return res.json({ token, role: 'ADMIN', redirect: '/admin-dashboard' });
            } else if (staff.role === 'STAFF') {
                return res.json({ token, role: 'STAFF', redirect: '/branch-staff-dashboard' });
            }
        }

        // Check if the user is a guest
        const guestResult = await pool.query('SELECT * FROM Guest WHERE username = $1', [username]);

        if (guestResult.rows.length > 0) {
            const guest = guestResult.rows[0];
            const isPasswordValid = await bcrypt.compare(password, guest.password);

            if (isPasswordValid) {
                const token = jwt.sign({ id: guest.guest_id, role: 'GUEST' }, SECRET_KEY);
                return res.json({ token, role: 'GUEST', redirect: '/guest-dashboard' });
            } else {
                return res.status(401).json({ message: 'Invalid username or password' });
            }
        }

        res.status(401).json({ message: 'Invalid username or password' });
    } catch (err) {
        console.error('Error during login:', err);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Updated API to fetch available rooms
app.get('/api/available-rooms', async (req, res) => {
    const { branchName, checkInDate, checkOutDate } = req.query;

    if (!branchName || !checkInDate || !checkOutDate) {
        return res.status(400).json({ message: 'Missing required query parameters.' });
    }

    try {
        const rooms = await getAvailableRooms(branchName, checkInDate, checkOutDate);
        res.json(rooms);
    } catch (err) {
        console.error('Error fetching available rooms:', err);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Add detailed logs to trace the request flow
app.post('/api/book-room', async (req, res) => {
    const { roomId, checkInDate, checkOutDate } = req.body;
    const token = req.headers.authorization?.split(' ')[1];

    console.log('Received booking request:', { roomId, checkInDate, checkOutDate });

    if (!roomId || !checkInDate || !checkOutDate) {
        console.error('Missing required fields:', { roomId, checkInDate, checkOutDate });
        return res.status(400).json({ message: 'Missing required fields.' });
    }

    if (!token) {
        console.error('Authorization token is missing.');
        return res.status(401).json({ message: 'Unauthorized access.' });
    }

    try {
        const decoded = jwt.verify(token, SECRET_KEY);
        const guestId = decoded.id;

        console.log('Decoded Token:', decoded);

        // Check if guest exists
        const guestCheck = await pool.query('SELECT * FROM Guest WHERE guest_id = $1', [guestId]);
        if (guestCheck.rows.length === 0) {
            console.error('Invalid guest ID:', guestId);
            return res.status(400).json({ message: 'Invalid guest ID.' });
        }

        console.log('Guest exists:', guestCheck.rows[0]);

        // Check if the guest already has an active booking
        const activeBookingCheck = await pool.query(
            `SELECT * FROM Booking WHERE guest_id = $1 AND booking_status IN ('RESERVED', 'CHECKED_IN')`,
            [guestId]
        );

        if (activeBookingCheck.rows.length > 0) {
            console.error('Guest already has an active booking:', activeBookingCheck.rows);
            return res.status(400).json({ message: 'You already have an active booking.' });
        }

        console.log('No active bookings found for guest.');

        // Check if room is available
        const roomCheck = await pool.query(
            `SELECT * FROM Room r
             WHERE r.room_id = $1
               AND r.room_id NOT IN (
                   SELECT room_id
                   FROM Booking
                   WHERE booking_status IN ('RESERVED', 'CHECKED_IN')
                     AND ($2 < check_out_date AND $3 > check_in_date)
               )`,
            [roomId, checkInDate, checkOutDate]
        );

        if (roomCheck.rows.length === 0) {
            console.error('Room not available:', { roomId, checkInDate, checkOutDate });
            return res.status(400).json({ message: 'Room is not available for the selected dates.' });
        }

        console.log('Room is available:', roomCheck.rows[0]);

        // Book the room
        const result = await pool.query(
            `INSERT INTO Booking (room_id, guest_id, booking_status, check_in_date, check_out_date)
             VALUES ($1, $2, 'RESERVED', $3, $4) RETURNING *`,
            [roomId, guestId, checkInDate, checkOutDate]
        );

        console.log('Room booked successfully:', result.rows[0]);
        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error('Error booking room:', err);
        res.status(500).json({ message: 'Internal server error.' });
    }
});

// API to fetch menu items for a specific branch
app.get('/api/menu', async (req, res) => {
    const { branchName } = req.query;

    if (!branchName) { // Validate branchName
        return res.status(400).json({ message: 'Invalid or missing branchName.' });
    }

    try {
        const result = await pool.query(
            `SELECT mi.menu_item_id, mi.item_name, mi.item_price, mi.description 
             FROM MenuItem mi
             JOIN Branch b ON mi.branch_id = b.branch_id
             WHERE b.branch_name = $1`,
            [branchName] // Use branchName in the query
        );

        res.json(result.rows);
    } catch (err) {
        console.error('Error fetching menu items:', err);
        res.status(500).json({ message: 'Internal server error.' });
    }
});

// API to place a restaurant order
app.post('/api/order', async (req, res) => {
    const { items } = req.body; // Expecting an array of items
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
        return res.status(401).json({ message: 'Unauthorized access.' });
    }

    if (!items || !Array.isArray(items) || items.length === 0) {
        return res.status(400).json({ message: 'Invalid or empty order items.' });
    }

    try {
        const decoded = jwt.verify(token, SECRET_KEY);
        const guestId = decoded.id;

        // Fetch guest's branch
        const branchResult = await pool.query(
            `SELECT b.branch_id FROM Booking bk
             JOIN Room r ON bk.room_id = r.room_id
             JOIN Branch b ON r.branch_id = b.branch_id
             WHERE bk.guest_id = $1 AND bk.booking_status IN ('RESERVED', 'CHECKED_IN')`,
            [guestId]
        );

        if (branchResult.rows.length === 0) {
            return res.status(400).json({ message: 'Guest is not associated with any branch.' });
        }

        const branchId = branchResult.rows[0].branch_id;

        // Calculate total cost of the order
        let totalCost = 0;
        for (const item of items) {
            const menuItemResult = await pool.query(
                'SELECT * FROM MenuItem WHERE menu_item_id = $1',
                [item.menu_item_id]
            );

            if (menuItemResult.rows.length === 0) {
                return res.status(404).json({ message: `Menu item with ID ${item.menu_item_id} not found.` });
            }

            const menuItem = menuItemResult.rows[0];
            totalCost += menuItem.item_price * (item.quantity || 1);
        }

        // Create a new restaurant order
        const orderResult = await pool.query(
            `INSERT INTO RestaurantOrder (guest_id, branch_id, total_cost)
             VALUES ($1, $2, $3) RETURNING order_id`,
            [guestId, branchId, totalCost]
        );

        const orderId = orderResult.rows[0].order_id;

        // Add order details
        for (const item of items) {
            const menuItemResult = await pool.query(
                'SELECT * FROM MenuItem WHERE menu_item_id = $1',
                [item.menu_item_id]
            );

            const menuItem = menuItemResult.rows[0];
            const lineTotal = menuItem.item_price * (item.quantity || 1);

            await pool.query(
                `INSERT INTO RestaurantOrderDetail (order_id, menu_item_id, quantity, item_price, line_total)
                 VALUES ($1, $2, $3, $4, $5)`,
                [orderId, item.menu_item_id, item.quantity || 1, menuItem.item_price, lineTotal]
            );
        }

        res.status(201).json({ message: 'Order placed successfully.', orderId });
    } catch (err) {
        console.error('Error placing order:', err);
        res.status(500).json({ message: 'Internal server error.' });
    }
});

// API to use a facility
app.post('/api/use-facility', async (req, res) => {
    const { facilityId, bookingId } = req.body; // Accept bookingId instead of relying on guestId
    const token = req.headers.authorization?.split(' ')[1];

    if (!facilityId || !bookingId) {
        return res.status(400).json({ message: 'Facility ID and Booking ID are required.' });
    }

    try {
        const decoded = jwt.verify(token, SECRET_KEY);

        // Check if the booking exists
        const bookingCheck = await pool.query(
            'SELECT * FROM Booking WHERE booking_id = $1',
            [bookingId]
        );

        if (bookingCheck.rows.length === 0) {
            return res.status(404).json({ message: 'Booking not found.' });
        }

        // Check if the facility exists
        const facilityCheck = await pool.query(
            'SELECT * FROM Facility WHERE facility_id = $1',
            [facilityId]
        );

        if (facilityCheck.rows.length === 0) {
            return res.status(404).json({ message: 'Facility not found.' });
        }

        // Log the facility usage
        await pool.query(
            `INSERT INTO FacilityUsage (booking_id, facility_id, usage_start, usage_cost)
             VALUES ($1, $2, NOW(), $3)`,
            [bookingId, facilityId, facilityCheck.rows[0].usage_fee]
        );

        res.status(200).json({ message: 'Facility used successfully.' });
    } catch (err) {
        console.error('Error using facility:', err);
        res.status(500).json({ message: 'Internal server error.' });
    }
});

// Add an API endpoint to fetch branch names
app.get('/api/branches', async (req, res) => {
    try {
        const result = await pool.query('SELECT branch_name FROM Branch');
        res.json(result.rows);
    } catch (err) {
        console.error('Error fetching branches:', err);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// API to fetch hotel facilities
app.get('/api/facilities', async (req, res) => {
    const { branchName } = req.query;

    if (!branchName) {
        return res.status(400).json({ message: 'Branch name is required.' });
    }

    try {
        const result = await pool.query(
            `SELECT f.facility_id, f.facility_name, f.usage_fee
             FROM Facility f
             LEFT OUTER JOIN Branch b ON f.branch_id = b.branch_id
             WHERE b.branch_name = $1`,
            [branchName]
        );

        res.json(result.rows || []); // Ensure an array is returned
    } catch (err) {
        console.error('Error fetching facilities:', err);
        res.status(500).json({ message: 'Internal server error.' });
    }
});

// Add detailed logs to debug the `/api/checkout` endpoint
app.get('/api/checkout', async (req, res) => {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
        console.error('No token provided in Authorization header.');
        return res.status(401).json({ message: 'Unauthorized access.' });
    }

    try {
        const decoded = jwt.verify(token, SECRET_KEY);
        console.log('Decoded token:', decoded);
        const guestId = decoded.id;

        // Fetch the active booking for the guest
        const bookingResult = await pool.query(
            `SELECT b.*, r.price_per_night
             FROM Booking b
             JOIN Room r ON b.room_id = r.room_id
             WHERE b.guest_id = $1 AND b.booking_status = 'CHECKED_IN'`,
            [guestId]
        );

        if (bookingResult.rows.length === 0) {
            console.error('No active booking found for guest ID:', guestId);
            return res.status(404).json({ message: 'No active booking found for the guest.' });
        }

        const booking = bookingResult.rows[0];
        console.log('Active booking:', booking);

        // Calculate room cost
        const checkInDate = new Date(booking.check_in_date);
        const checkOutDate = new Date(booking.check_out_date);
        const daysStayed = Math.ceil((checkOutDate - checkInDate) / (1000 * 60 * 60 * 24));
        const roomCost = daysStayed * parseFloat(booking.price_per_night);

        // Fetch facility usage costs
        const facilityUsageResult = await pool.query(
            `SELECT f.facility_name, fu.usage_cost 
             FROM FacilityUsage fu
             JOIN Facility f ON fu.facility_id = f.facility_id
             WHERE fu.booking_id = $1`,
            [booking.booking_id]
        );
        console.log('Facility usage:', facilityUsageResult.rows);

        // Fetch restaurant orders costs
        const restaurantOrderResult = await pool.query(
            `SELECT rod.item_price, rod.quantity, rod.line_total, mi.item_name
             FROM RestaurantOrder ro
             JOIN RestaurantOrderDetail rod ON ro.order_id = rod.order_id
             JOIN MenuItem mi ON rod.menu_item_id = mi.menu_item_id
             WHERE ro.guest_id = $1 AND ro.order_status = 'PLACED'`,
            [guestId]
        );
        console.log('Restaurant orders:', restaurantOrderResult.rows);

        // Calculate total costs
        const facilityCosts = facilityUsageResult.rows.reduce((sum, usage) => sum + parseFloat(usage.usage_cost), 0);
        const restaurantCosts = restaurantOrderResult.rows.reduce((sum, order) => sum + parseFloat(order.line_total), 0);
        const totalBill = roomCost + facilityCosts + restaurantCosts;

        console.log('Total bill:', totalBill);

        res.json({
            bookingId: booking.booking_id,
            roomCost,
            facilities: facilityUsageResult.rows,
            restaurantOrders: restaurantOrderResult.rows,
            totalBill,
        });
    } catch (err) {
        console.error('Error during checkout:', err);
        res.status(500).json({ message: 'Internal server error.' });
    }
});

// API to update booking status to 'CHECKED_IN'
app.post('/api/update-booking-status', async (req, res) => {
    const { bookingId } = req.body;
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
        return res.status(401).json({ message: 'Unauthorized access.' });
    }

    if (!bookingId) {
        return res.status(400).json({ message: 'Booking ID is required.' });
    }

    try {
        const decoded = jwt.verify(token, SECRET_KEY);
        const guestId = decoded.id;

        // Update booking status to 'CHECKED_IN'
        const result = await pool.query(
            `UPDATE Booking
             SET booking_status = 'CHECKED_IN'
             WHERE guest_id = $1 AND booking_id = $2 AND booking_status = 'RESERVED'`,
            [guestId, bookingId]
        );

        if (result.rowCount === 0) {
            return res.status(404).json({ message: 'No matching booking found to update.' });
        }

        res.status(200).json({ message: 'Booking status updated to CHECKED_IN.' });
    } catch (err) {
        console.error('Error updating booking status:', err);
        res.status(500).json({ message: 'Internal server error.' });
    }
});

// API to handle payment
app.post('/api/pay', async (req, res) => {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
        console.error('Payment failed: No token provided.');
        return res.status(401).json({ message: 'Unauthorized access.' });
    }

    try {
        const decoded = jwt.verify(token, SECRET_KEY);
        const guestId = decoded.id;

        console.log('Decoded token:', decoded);

        // Fetch the active booking for the guest
        const bookingResult = await pool.query(
            `SELECT booking_id FROM Booking 
             WHERE guest_id = $1 AND booking_status = 'CHECKED_IN'`,
            [guestId]
        );

        if (bookingResult.rows.length === 0) {
            console.error('Payment failed: No active booking found for guest ID:', guestId);
            return res.status(404).json({ message: 'No active booking found for the guest.' });
        }

        const bookingId = bookingResult.rows[0].booking_id;
        console.log('Active booking ID:', bookingId);

        // Mark the booking as 'PAID'
        const updateResult = await pool.query(
            `UPDATE Booking 
             SET booking_status = 'PAID' 
             WHERE booking_id = $1`,
            [bookingId]
        );

        console.log('Booking update result:', updateResult);

        res.status(200).json({ message: 'Payment successful. Booking marked as PAID.' });
    } catch (err) {
        console.error('Error during payment:', err);
        res.status(500).json({ message: 'Internal server error.' });
    }
});

// API for branch staff to fetch guests currently staying at their branch
app.get('/api/branch-guests', async (req, res) => {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
        return res.status(401).json({ message: 'Unauthorized access.' });
    }

    try {
        const decoded = jwt.verify(token, SECRET_KEY);
        const branchId = decoded.branchId;

        const guests = await getBranchGuests(branchId);
        res.json(guests);
    } catch (err) {
        console.error('Error fetching branch guests:', err);
        res.status(500).json({ message: 'Internal server error.' });
    }
});

// API for branch staff to book a guest into a room
app.post('/api/book-guest', async (req, res) => {
    const { guestId, roomId, checkInDate, checkOutDate } = req.body;
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
        return res.status(401).json({ message: 'Unauthorized access.' });
    }

    try {
        const decoded = jwt.verify(token, SECRET_KEY);
        const staffId = decoded.id;

        const booking = await bookGuest(guestId, roomId, checkInDate, checkOutDate, staffId);
        res.status(201).json(booking);
    } catch (err) {
        console.error('Error booking guest:', err);
        res.status(500).json({ message: 'Internal server error.' });
    }
});

// API for admin to fetch branch statistics
app.get('/api/branch-statistics', async (req, res) => {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
        return res.status(401).json({ message: 'Unauthorized access.' });
    }

    try {
        const decoded = jwt.verify(token, SECRET_KEY);

        if (decoded.role !== 'ADMIN') {
            return res.status(403).json({ message: 'Forbidden: Admin access required.' });
        }

        const statistics = await getBranchStatistics();
        res.json(statistics);
    } catch (err) {
        console.error('Error fetching branch statistics:', err);
        res.status(500).json({ message: 'Internal server error.' });
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
