const express = require('express');
const router = express.Router();
const menuService = require("../services/menu.service")
const { authenticateUser } = require("../middleware/authMiddleware")
// Get all users

// '/api/menus'
router.get('/', authenticateUser, async (req, res) => {
    try {
        const result = await menuService.getAllMenus(req.user);
        res.status(200).json(result.recordset);
    } catch (error) {
        console.error('Error executing stored procedure:', error);
        res.status(500).json({ error: 'Failed to get menus' });
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

router.get('/checkNameExits/:name', async (req, res) => {
    const menuRecord = await menuService.checkMenuNameExists(req.params.name);
    if (menuRecord.length !== 0) {
        res.status(200).json(`This name exists in the menu list already. Please change.`);
    } else {
        res.status(200).json('unique name');
    }
})

router.post('/', authenticateUser, async (req, res) => {
    try {
        const menuDataWithUser = {
            ...req.body,
            CreatedBy: req.user.loginID
        };
        const result = await menuService.addMenuItem(menuDataWithUser);

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

router.delete('/delete/:id', authenticateUser, async (req, res) => {
    try {
        await menuService.deleteMenuItem(
            req.params.id,
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