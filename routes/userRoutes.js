const express = require('express');
const router = express.Router();
const sql = require('mssql'); // Need to import sql for parameter types
const { poolPromise } = require('../config/db');

// Get all users
router.get('/', async (req, res) => {
    try {
        const pool = await poolPromise;
        const result = await pool.request().query('SELECT * FROM UserMaster');
        res.json(result.recordset);
    } catch (err) {
        console.error('SQL error', err);
        res.status(500).json({ error: 'Database error' });
    }
});

// Get single user by ID
router.get('/:id', async (req, res) => {
    try {
        // Validate ID parameter
        const userId = parseInt(req.params.id);
        if (isNaN(userId)) {
            return res.status(400).json({ error: 'Invalid user ID' });
        }

        const pool = await poolPromise;
        const result = await pool.request()
            .input('id', sql.Int, userId)
            .query('SELECT * FROM UserDetails WHERE UserID = @id'); // Changed to UserMaster

        if (result.recordset.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.json(result.recordset[0]);
    } catch (err) {
        console.error('SQL error', err);
        res.status(500).json({ error: 'Database error' });
    }
});

module.exports = router;