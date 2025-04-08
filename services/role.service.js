const { poolPromise } = require('../config/db');
const sql = require('mssql');

module.exports.getAllRoles = async () => {
    const pool = await poolPromise;
    const records = await pool.request().query('SELECT * FROM RoleMaster');
    return records;
}
