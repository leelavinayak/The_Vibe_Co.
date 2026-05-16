const express = require('express');
const router = express.Router();
const { createReview, getReviews } = require('../controllers/reviewController');

const { optionalProtect } = require('../middleware/auth');

router.route('/')
  .post(optionalProtect, createReview)
  .get(getReviews);

module.exports = router;
