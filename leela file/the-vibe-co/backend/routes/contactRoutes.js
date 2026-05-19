const express = require('express');
const router = express.Router();
const { submitContact, getContacts, getPublicStats, getMyInquiries, cancelInquiry } = require('../controllers/contactController');
const { protect, admin, optionalProtect } = require('../middleware/auth');

router.post('/', optionalProtect, submitContact);
router.get('/', protect, admin, getContacts);
router.get('/my-inquiries', protect, getMyInquiries);
router.put('/:id/cancel', protect, cancelInquiry);
router.get('/stats', getPublicStats);

module.exports = router;
