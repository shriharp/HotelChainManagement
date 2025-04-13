const { Pool } = require('pg');

const pool = new Pool({
    user: 'shriharpande', // PostgreSQL username
    host: 'localhost',    // Database host
    database: 'tridenthotel', // Database name
    port: 5432,           // Default PostgreSQL port
});

pool.on('connect', () => {
    console.log('Connected to the database successfully.');
});

pool.on('error', (err) => {
    console.error('Unexpected error on idle database client:', err);
    process.exit(-1);
});

module.exports = { pool };