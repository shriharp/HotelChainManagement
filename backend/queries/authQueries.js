const { pool } = require('../config/db');

// filepath: /Users/shriharpande/Documents/mit/sem 4/dbms/TridentHotel/backend/queries/authQueries.js
const bcrypt = require('bcrypt');

async function seedUsers() {
    try {
        // Seed Branches
        await pool.query(`
            INSERT INTO Branch (branch_name, location, contact_number)
            VALUES 
            ('Trident Mumbai', 'Nariman Point, Mumbai', '02212345678'),
            ('Trident Delhi', 'Connaught Place, Delhi', '01187654321'),
            ('Trident Bangalore', 'MG Road, Bangalore', '08099887766'),
            ('Trident Hyderabad', 'Jubilee Hills, Hyderabad', '8008802275')
            ON CONFLICT DO NOTHING;
        `);

        // Fetch branch IDs for use
        const branches = await pool.query(`SELECT * FROM Branch`);
        const branchMumbai = branches.rows.find(b => b.branch_name === 'Trident Mumbai')?.branch_id;
        const branchDelhi = branches.rows.find(b => b.branch_name === 'Trident Delhi')?.branch_id;
    
        // Hash passwords
        const adminPassword = await bcrypt.hash('adminPass123', 10);
        const staffPassword1 = await bcrypt.hash('staff123', 10);
        const staffPassword2 = await bcrypt.hash('staff456', 10);

        // Seed Staff
        await pool.query(`
            INSERT INTO Staff (branch_id, staff_name, role, email, phone, username, password)
            VALUES 
            ($1, 'Priya Sharma', 'ADMIN', 'priya@trident.in', '9876543210', 'priyas', $3),
            ($1, 'Amit Patel', 'STAFF', 'amit@trident.in', '9123456789', 'amitp', $4),
            ($2, 'Ritu Malhotra', 'STAFF', 'ritu@trident.in', '9988776655', 'ritum', $5)
            ON CONFLICT (email, username) 
            DO UPDATE SET password = EXCLUDED.password;
        `, [branchMumbai, branchDelhi, adminPassword, staffPassword1, staffPassword2]);

        // Hash guest passwords
        const guestPassword1 = await bcrypt.hash('passz', 10);
        const guestPassword2 = await bcrypt.hash('IshaSecure456', 10);
        const guestPassword3 = await bcrypt.hash('RohanPass789', 10);
        const guestPassword4 = await bcrypt.hash('Desai@pass321', 10);
        const guestPassword5 = await bcrypt.hash('Karan#999', 10);

        // Seed Guests
        await pool.query(`
            INSERT INTO Guest (guest_name, email, phone, username, password, loyalty_points)
            VALUES
            ('Aarav Mehta', 'aarav.mehta@gmail.com', '9876543210', 'aaravm', $1, 120),
            ('Isha Reddy', 'isha.reddy@yahoo.in', '9123456789', 'ishar', $2, 300),
            ('Rohan Verma', 'rohan.verma@outlook.com', '9988776655', 'rohanv', $3, 75),
            ('Sneha Desai', 'sneha.desai@gmail.com', '9871234567', 'snehad', $4, 200),
            ('Karan Singh', 'karan.singh@rediffmail.com', '9001122334', 'karans', $5, 0)
            ON CONFLICT (email, username) 
            DO UPDATE SET password = EXCLUDED.password;
        `, [guestPassword1, guestPassword2, guestPassword3, guestPassword4, guestPassword5]);

        console.log('✅ Seeding completed successfully');
    } catch (err) {
        console.error('❌ Error seeding data:', err);
    }
}

module.exports = { seedUsers };
