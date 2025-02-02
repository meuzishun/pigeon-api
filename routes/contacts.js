const router = require('express').Router();
const {
  getContacts,
  addContact,
  getContact,
  deleteContact,
} = require('../controllers/contactsController');

router.get('/', getContacts);
router.put('/', addContact);
router.get('/:contactId', getContact);
router.delete('/:contactId', deleteContact);

module.exports = router;
