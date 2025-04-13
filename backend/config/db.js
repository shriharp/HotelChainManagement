const { Pool } = require('pg');

const pool = new Pool({
    user: 'shriharpande', // PostgreSQL username
    host: 'localhost',    // Database host
    database: 'tridenthotel', // Database name
    port: 5432,           // Default PostgreSQL port
});

module.exports = { pool };