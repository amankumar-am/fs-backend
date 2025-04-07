const express = require('express');
const router = express.Router();
const sql = require('mssql'); // Need to import sql for parameter types
const jwt = require("jsonwebtoken");
const { poolPromise } = require('../config/db');

// Login Route
router.post("/login/auth", async (req, res) => {
    try {
        const { loginID, password } = req.body;

        const pool = await poolPromise;
        const result = await pool
            .request()
            .input("loginID", sql.VarChar, loginID)
            .query("SELECT * FROM UserMaster WHERE LoginID = @loginID");

        if (result.recordset.length === 0) {
            return res.status(401).json({ message: "Invalid credentials" });
        }

        const user = result.recordset[0];
        const userPassword = user.Password.trim();
        const enteredPassword = password.trim();

        if (enteredPassword === userPassword) {
            const token = jwt.sign({ id: user.ID, loginID: user.LoginID }, process.env.JWT_SECRET || "defaultSecret", { expiresIn: "1h" });

            return res.json({ message: "Login successful", token, user });
        } else {
            return res.status(401).json({ message: "Invalid credentials" });
        }

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
});

module.exports = router;
