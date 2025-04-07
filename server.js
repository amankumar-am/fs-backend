const express = require('express');
const cors = require('cors');
const userRoutes = require('./routes/userRoutes');
const roleRoutes = require('./routes/roleRoutes');
const menuRoutes = require('./routes/menuRoutes');
const loginRoutes = require('./routes/loginRoutes');

const app = express();
require('events').EventEmitter.defaultMaxListeners = 15;
// Middleware
app.use(cors());
app.use(express.json()); // For parsing application/json
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/users', userRoutes);
app.use('/roles', roleRoutes);
app.use('/api/menus', menuRoutes);
app.use('/', loginRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: err.message
    });
});

// Start the server
const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});