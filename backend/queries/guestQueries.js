const { pool } = require('../config/db');

const getGuestBookings = async (guestId, currentDateTime) => {
    const result = await pool.query(
        `SELECT * FROM Booking 
         WHERE guest_id = $1 AND $2 BETWEEN check_in_date AND check_out_date`,
        [guestId, currentDateTime]
    );
    return result.rows;
};

const getGuestBookingsForDate = async (guestId, date) => {
    const result = await pool.query(
        `SELECT * FROM Booking 
         WHERE guest_id = $1 AND $2 BETWEEN check_in_date AND check_out_date`,
        [guestId, date]
    );
    return result.rows;
};

const getAvailableRooms = async (branchName, checkInDate, checkOutDate) => {
    // Debugging: Log all branches to verify data
    const branches = await pool.query(`SELECT * FROM Branch`);
    console.log('Branches in database:', branches.rows);

    console.log('Query Parameters:', { branchName, checkInDate, checkOutDate }); // Log parameters for debugging
    const result = await pool.query(
        `SELECT r.room_id, r.room_number, r.room_type, r.price_per_night, r.capacity
         FROM Room r
         JOIN Branch b ON r.branch_id = b.branch_id
         WHERE b.branch_name = $1
           AND r.room_id NOT IN (
               SELECT room_id
               FROM Booking
               WHERE booking_status IN ('RESERVED', 'CHECKED_IN')
                 AND ($2 < check_out_date AND $3 > check_in_date)
           )`,
        [branchName, checkInDate, checkOutDate]
    );

    // Debugging: Log query results
    console.log('Available rooms:', result.rows);
    console.log('Query Parameters:', { branchName, checkInDate, checkOutDate });

    return result.rows;
};

module.exports = { getGuestBookings, getGuestBookingsForDate, getAvailableRooms };