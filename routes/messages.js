const router = require('express').Router({ mergeParams: true });
const {
  getMessages,
  getMessage,
  createMessage,
  editMessage,
  deleteMessage,
} = require('../controllers/messageController');

router.get('/', getMessages);
router.get('/:messageId', getMessage);
router.post('/', createMessage);
router.put('/:messageId', editMessage);
router.delete('/:messageId', deleteMessage);

module.exports = router;
