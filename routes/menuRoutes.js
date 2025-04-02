const express = require('express');
const router = express.Router();
const { poolPromise } = require('../config/db');

// Get all users
router.get('/', async (req, res) => {
    try {
        const pool = await poolPromise;
        const result = await pool.request().query('SELECT * FROM MenuMaster');
        res.json(result.recordset);
    } catch (err) {
        console.error('SQL error', err);
        res.status(500).json({ error: 'Database error' });
    }
});

// Add more routes as needed
// router.get('/:id', ...);
// router.post('/', ...);
// router.put('/:id', ...);
// router.delete('/:id', ...);

module.exports = router;