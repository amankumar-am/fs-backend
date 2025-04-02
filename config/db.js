const sql = require('mssql');
require('dotenv').config();

const config = {
    user: process.env.MSSQL_USERNAME,
    password: process.env.MSSQL_PASSWORD,
    server: process.env.MSSQL_SERVER,
    database: process.env.MSSQL_DATABASE,
    options: {
        encrypt: false,
        trustServerCertificate: true
    }
};

// Create a connection pool
const poolPromise = new sql.ConnectionPool(config)
    .connect()
    .then(pool => {
        console.log('Connected to MSSQL');
        return pool;
    })
    .catch(err => console.error('Database Connection Failed!', err));

module.exports = {
    sql, poolPromise
};