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

router.get('/max-id', async (req, res) => {
    try {
        const pool = await poolPromise;
        const result = await pool.request()
            .query('SELECT ISNULL(MAX(MenuID), 0) + 1 AS NextMenuID FROM MenuMaster');

        res.status(200).json({
            success: true,
            maxId: result.recordset[0].NextMenuID
        });
    } catch (error) {
        console.error('Error fetching max MenuID:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch maximum Menu ID',
            error: error.message
        });
    }
});

router.post('/', async (req, res) => {
    try {
        const pool = await poolPromise;
        const { Name, Path, Icon, Category } = req.body;

        // First get the next available ID
        const idResult = await pool.request()
            .query('SELECT ISNULL(MAX(MenuID), 0) + 1 AS NextMenuID FROM MenuMaster');

        const nextId = idResult.recordset[0].NextMenuID;

        // Insert the new menu
        const result = await pool.request()
            .input('MenuID', sql.Int, nextId)
            .input('Name', sql.NVarChar(30), Name)
            .input('Path', sql.NVarChar(20), Path)
            .input('Icon', sql.NVarChar(30), Icon)
            .input('Category', sql.Int, Category)
            .query(`
                INSERT INTO MenuMaster (MenuID, Name, Path, Icon, Category)
                VALUES (@MenuID, @Name, @Path, @Icon, @Category)
                SELECT SCOPE_IDENTITY() AS MenuID
            `);

        res.status(201).json({
            success: true,
            menuId: nextId,
            message: 'Menu created successfully'
        });
    } catch (error) {
        console.error('Error creating menu:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create menu',
            error: error.message
        });
    }
});


// Add more routes as needed
// router.get('/:id', ...);
// router.post('/', ...);
// router.put('/:id', ...);
// router.delete('/:id', ...);

module.exports = router;