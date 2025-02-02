const router = require('express').Router();
const {
  getUser,
  getUsers,
  searchUsers,
} = require('../controllers/userController');

router.get('/search', searchUsers);
router.get('/', getUsers);
router.get('/:userId', getUser);

module.exports = router;
