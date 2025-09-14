const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const path = require('path');
// Les routes étaient situées dans public/routes, on corrige le chemin
const authRoutes = require('./public/routes/auth');
const errorHandler = require('./middlewares/errorHandler');
const envConfig = require('./config/env');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(session({
    secret: envConfig.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
}));

// Static files
app.use(express.static(path.join(__dirname, 'public')));

// Simple views: servir des fichiers statiques HTML

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'login.html'));
});

// Routes
app.use('/auth', authRoutes);

// Error handling middleware
app.use(errorHandler);

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});