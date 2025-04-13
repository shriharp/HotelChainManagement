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

module.exports = { getGuestBookings, getGuestBookingsForDate };