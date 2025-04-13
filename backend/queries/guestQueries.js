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

const getAvailableRooms = async (location, checkInDate, checkOutDate) => {
    console.log('Query Parameters:', { location, checkInDate, checkOutDate }); // Log parameters for debugging
    const result = await pool.query(
        `SELECT r.room_id, r.room_number, r.room_type, r.price_per_night, r.capacity
         FROM Room r
         JOIN Branch b ON r.branch_id = b.branch_id
         WHERE b.location = $1
           AND r.room_id NOT IN (
               SELECT b.room_id
               FROM Booking b
               WHERE b.booking_status IN ('RESERVED', 'CHECKED_IN')
                 AND ($2 < b.check_out_date AND $3 > b.check_in_date)
           )`,
        [location, checkInDate, checkOutDate]
    );
    return result.rows;
};

module.exports = { getGuestBookings, getGuestBookingsForDate, getAvailableRooms };