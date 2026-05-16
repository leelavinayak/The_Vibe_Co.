const express = require('express');
const router = express.Router();
const { submitContact, getContacts, getPublicStats, getMyInquiries } = require('../controllers/contactController');
const { protect, admin, optionalProtect } = require('../middleware/auth');

router.post('/', optionalProtect, submitContact);
router.get('/', protect, admin, getContacts);
router.get('/my-inquiries', protect, getMyInquiries);
router.get('/stats', getPublicStats);

module.exports = router;
