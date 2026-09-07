const express = require('express');
const StudentCardService = require('../services/studentCardService');
const { ApiError } = require('../middleware/errorHandler');

const router = express.Router();

// GET /card
router.get('/', async (req, res, next) => {
  try {
    if (req.user.isGuest) {
      throw new ApiError(403, 'Guests cannot access student card');
    }
    
    const card = await StudentCardService.getCard(req.user.userId);
    res.json(card);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
