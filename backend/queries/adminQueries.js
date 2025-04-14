const getBranchStatistics = async () => {
    const query = `
        SELECT b.branch_name, 
               COUNT(DISTINCT bk.booking_id) AS total_bookings,
               SUM(r.price_per_night * (bk.check_out_date - bk.check_in_date)) AS total_revenue
        FROM Branch b
        LEFT JOIN Room r ON b.branch_id = r.branch_id
        LEFT JOIN Booking bk ON r.room_id = bk.room_id
        WHERE bk.booking_status IN ('CHECKED_IN', 'CHECKED_OUT')
        GROUP BY b.branch_name;
    `;
    const result = await pool.query(query);
    return result.rows;
};

module.exports = {
    getBranchStatistics,
};