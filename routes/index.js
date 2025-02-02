const router = require('express').Router();
const authRoutes = require('./auth');
const messageRoutes = require('./messages');
const roomsRoutes = require('./rooms');
const profileRoutes = require('./profile');
const contactRoutes = require('./contacts');
const userRoutes = require('./users');
const authHandler = require('../middleware/authMiddleware');

router.use('/auth', authRoutes);
router.use('/messages', authHandler, messageRoutes);
router.use('/rooms', authHandler, roomsRoutes);
router.use('/profile', authHandler, profileRoutes);
router.use('/contacts', authHandler, contactRoutes);
router.use('/users', authHandler, userRoutes);

module.exports = router;
