const router = require('express').Router();
const {
  getRooms,
  getRoom,
  createRoom,
  editRoom,
  deleteRoom,
} = require('../controllers/roomController');
const messageRoutes = require('./messages');

router.get('/', getRooms);
router.get('/:roomId', getRoom);
router.post('/', createRoom);
router.put('/:roomId', editRoom);
router.delete('/:roomId', deleteRoom);
router.use('/:roomId/messages', messageRoutes);

module.exports = router;
