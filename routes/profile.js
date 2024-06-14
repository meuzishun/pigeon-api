const router = require('express').Router();
const authHandler = require('../middleware/authMiddleware');
const {
  getProfile,
  editProfile,
  deleteProfile,
} = require('../controllers/profileController');

router.get('/', authHandler, getProfile);
router.put('/', authHandler, editProfile);
router.delete('/', authHandler, deleteProfile);

module.exports = router;
