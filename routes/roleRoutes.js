const express = require('express');
const router = express.Router();
const roleService = require("../services/role.service")
// Get all roles

router.get('/', async (req, res) => {
    try {
        const result = await roleService.getAllRoles();
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