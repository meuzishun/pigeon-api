const router = require('express').Router();
const authHandler = require('../middleware/authMiddleware');
const {
  getRooms,
  getRoom,
  createRoom,
  editRoom,
  deleteRoom,
} = require('../controllers/roomController');

router.get('/', authHandler, getRooms);
router.get('/:roomId', authHandler, getRoom);
router.post('/', authHandler, createRoom);
router.put('/:roomId', authHandler, editRoom);
router.delete('/:roomId', authHandler, deleteRoom);

module.exports = router;
