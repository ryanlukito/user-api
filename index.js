require('dotenv').config();
require('./utils/accountUnlocker');
const PORT = process.env.PORT || 5000;

const express = require('express');
const rateLimit = require('express-rate-limit')
const app = express();


const connectDB = require('./config/db');
const userRoutes = require('./routes/userRoutes');
const authRoutes = require('./routes/authRoutes');
const logger = require('./middleware/logger');
const errorHandler = require('./middleware/errorHandler');

const globalLimiter = rateLimit({
    windowsMs: 10 * 60 * 1000,
    max: 100,
    message: "Too many requests from this IP"
})

connectDB();

app.use(express.json());
app.use(logger);

app.use(globalLimiter);

app.get('/', (req, res) => {
    res.json({message: 'API berjalan!'})
});

app.get('/error', (req, res, next) => {
    next(new Error('Test error handler'));
})

app.use('/users', userRoutes);

app.use('/auth', authRoutes);

app.use('/uploads', express.static('uploads'));

app.use(errorHandler);

app.listen(PORT, () => console.log(`Server berjalan di port ${PORT}`));