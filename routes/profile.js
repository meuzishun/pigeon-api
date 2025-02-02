const router = require('express').Router();
const {
  getProfile,
  editProfile,
  deleteProfile,
} = require('../controllers/profileController');

router.get('/', getProfile);
router.put('/', editProfile);
router.delete('/', deleteProfile);

module.exports = router;
