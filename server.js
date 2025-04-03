const express = require('express');
const cors = require('cors');
const userRoutes = require('./routes/userRoutes');
const roleRoutes = require('./routes/roleRoutes');
const menuRoutes = require('./routes/menuRoutes');
const loginRoutes = require('./routes/loginRoutes');

const app = express();

// Middleware
app.use(cors());
app.use(express.json()); // For parsing application/json

// Routes
app.use('/users', userRoutes);
app.use('/roles', roleRoutes);
app.use('/menus', menuRoutes);
app.use('/login', loginRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
});

// Start the server
const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});