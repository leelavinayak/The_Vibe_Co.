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
router.delete('/clear', clearNotifications);
router.delete('/:id', deleteNotification);

module.exports = router;
