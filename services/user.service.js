const { poolPromise } = require('../config/db');
const sql = require('mssql');

module.exports.getAllUsers = async () => {
    const pool = await poolPromise;

}

module.exports.getUserById = async (id) => {
    const pool = await poolPromise;

}

module.exports.addUser = async (menuData) => {
    const pool = await poolPromise;
    const transaction = new sql.Transaction(pool);

}


module.exports.updateUser = async (id, updateData) => {
    const pool = await poolPromise;

};


module.exports.deleteUser = async (id) => {
    const pool = await poolPromise;
    const transaction = new sql.Transaction(pool);

};
