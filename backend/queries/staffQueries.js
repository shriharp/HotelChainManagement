const { pool } = require('../config/db'); // Import the pool object for database queries

const getBranchGuests = async (branchId) => {
    const query = `
        SELECT g.guest_name, g.email, g.phone, b.booking_id, r.room_number, b.check_in_date, b.check_out_date
        FROM Booking b
        JOIN Guest g ON b.guest_id = g.guest_id
        JOIN Room r ON b.room_id = r.room_id
        WHERE r.branch_id = $1 AND b.booking_status = 'CHECKED_IN';
    `;
    const result = await pool.query(query, [branchId]);
    return result.rows;
};

const bookGuest = async (guestId, roomId, checkInDate, checkOutDate, staffId) => {
    const query = `
        INSERT INTO Booking (guest_id, room_id, check_in_date, check_out_date, booked_by_staff, booking_status)
        VALUES ($1, $2, $3, $4, $5, 'CHECKED_IN') RETURNING *;
    `;
    const result = await pool.query(query, [guestId, roomId, checkInDate, checkOutDate, staffId]);
    return result.rows[0];
};

module.exports = {
    getBranchGuests,
    bookGuest,
};