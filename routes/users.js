const router = require('express').Router();
const authHandler = require('../middleware/authMiddleware');
const {
  getUser,
  getUsers,
  searchUsers,
} = require('../controllers/userController');

router.get('/search', authHandler, searchUsers);
router.get('/', authHandler, getUsers);
router.get('/:userId', authHandler, getUser);

module.exports = router;
