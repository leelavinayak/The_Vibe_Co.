const express = require('express');
const router = express.Router();
const { 
  getNotifications, 
  markAsRead, 
  deleteNotification, 
  clearNotifications 
} = require('../controllers/notificationController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.get('/', getNotifications);
router.put('/:id', markAsRead);
router.delete('/:id', deleteNotification);
router.delete('/', clearNotifications);

module.exports = router;
