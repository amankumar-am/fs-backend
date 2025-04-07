const express = require('express');
const router = express.Router();
const menuService = require("../services/menu.service")
const { authenticateUser } = require("../middleware/authMiddleware")
// Get all users

router.get('/', async (req, res) => {
    try {
        const result = await menuService.getAllMenus();
        res.json(result.recordset);
    } catch (err) {
        console.error('SQL error', err);
        res.status(500).json({ error: 'Database error' });
    }
});

router.get('/:id', async (req, res) => {
    const menuRecord = await menuService.getMenuById(req.params.id);
    if (menuRecord.length === 0) {
        res.status(400).json("No record with given id: " + req.params.id);
    } else {
        res.json(menuRecord.recordset[0]);
    }
});

router.post('/', authenticateUser, async (req, res) => {
    try {
        const menuDataWithUser = {
            ...req.body,
            CreatedBy: req.user.loginID // or req.user.id depending on what you need
        };
        const result = await menuService.addMenuItem(menuDataWithUser);
        console.log(result);

        res.status(201).json({
            success: true,
            menuId: result.insertedId,
            message: result.message
        });
    } catch (error) {
        const statusCode = error.message.includes('required') ? 400 : 500;
        res.status(statusCode).json({
            success: false,
            message: error.message || 'Failed to create menu item'
        });
    }
});


router.put('/:id', authenticateUser, async (req, res) => {
    try {
        const updateDataWithUser = {
            ...req.body,
            UpdatedBy: req.user.loginID
        };

        await menuService.updateMenuItem(
            req.params.id,
            updateDataWithUser
        );
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// Add more routes as needed
// router.get('/:id', ...);
// router.post('/', ...);
// router.put('/:id', ...);
// router.delete('/:id', ...);

module.exports = router;