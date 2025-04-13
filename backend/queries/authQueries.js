const bcrypt = require('bcrypt');
const { pool } = require('../config/db');

const seedUsers = async () => {
    const hashedPassword = await bcrypt.hash('admin123', 10);

    await pool.query(
        `INSERT INTO Staff (branch_id, staff_name, role, email, phone, username, password)
         VALUES (1, 'Admin User', 'ADMIN', 'admin@example.com', '1234567890', 'admin', $1)
         ON CONFLICT (username) DO NOTHING`,
        [hashedPassword]
    );
};

module.exports = { seedUsers };
