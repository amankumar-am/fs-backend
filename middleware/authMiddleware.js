// middleware/authMiddleware.js
const jwt = require('jsonwebtoken');

const authenticateUser = (req, res, next) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];

        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'Authentication failed: No token provided'
            });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET || "defaultSecret");
        req.user = decoded;
        next();
    } catch (error) {
        return res.status(401).json({
            success: false,
            message: 'Authentication failed: Invalid token'
        });
    }
};

module.exports = { authenticateUser }; // Make sure to export it this way