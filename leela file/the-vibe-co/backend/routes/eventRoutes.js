const express = require('express');
const router = express.Router();
const {
  getEvents,
  getEvent,
  createEvent,
  updateEvent,
  deleteEvent,
  getFeaturedEvents
} = require('../controllers/eventController');
const { protect, admin } = require('../middleware/auth');

router.get('/featured', getFeaturedEvents);
router.route('/')
  .get(getEvents)
  .post(protect, createEvent);

router.route('/:id')
  .get(getEvent)
  .put(protect, updateEvent)
  .delete(protect, deleteEvent);

module.exports = router;
