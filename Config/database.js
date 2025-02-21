const pgp = require('pg-promise')();
const dotenv = require('dotenv');

dotenv.config();

const db = pgp({
    connectionString: process.env.DATABASE_URL,
    /*ssl: {
        rejectUnauthorized: false
    }*/
});

module.exports = db;

