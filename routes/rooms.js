const router = require('express').Router();
const authHandler = require('../middleware/authMiddleware');
const {
  getRooms,
  getRoom,
  createRoom,
  editRoom,
  deleteRoom,
} = require('../controllers/roomController');
const messageRoutes = require('./messages');

router.get('/', authHandler, getRooms);
router.get('/:roomId', authHandler, getRoom);
router.post('/', authHandler, createRoom);
router.put('/:roomId', authHandler, editRoom);
router.delete('/:roomId', authHandler, deleteRoom);
router.use('/:roomId/messages', authHandler, messageRoutes);

module.exports = router;
