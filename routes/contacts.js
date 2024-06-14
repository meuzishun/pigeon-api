const router = require('express').Router();
const authHandler = require('../middleware/authMiddleware');
const {
  getContacts,
  addContact,
  getContact,
  deleteContact,
} = require('../controllers/contactsController');

router.get('/', authHandler, getContacts);
router.put('/', authHandler, addContact);
router.get('/:contactId', authHandler, getContact);
router.delete('/:contactId', authHandler, deleteContact);

module.exports = router;
