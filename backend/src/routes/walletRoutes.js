const express = require('express');
const { body, validationResult } = require('express-validator');
const WalletService = require('../services/walletService');
const { guestGuard } = require('../middleware/authMiddleware');
const { ApiError } = require('../middleware/errorHandler');

const router = express.Router();

const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new ApiError(400, errors.array()[0].msg);
  }
  next();
};

// GET /wallet
router.get('/', async (req, res, next) => {
  try {
    // Check if guest
    if (req.user.isGuest) {
      throw new ApiError(403, 'Guests cannot access wallet');
    }
    
    const wallet = await WalletService.getWallet(req.user.userId);
    res.json(wallet);
  } catch (error) {
    next(error);
  }
});

// POST /wallet/topup
router.post('/topup',
  body('amount').isFloat({ min: 0.01 }).withMessage('Amount must be a positive number'),
  handleValidationErrors,
  async (req, res, next) => {
    try {
      if (req.user.isGuest) {
        throw new ApiError(403, 'Guests cannot top up wallet');
      }
      
      const result = await WalletService.topUp(req.user.userId, req.body.amount);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }
);

// POST /wallet/pay
router.post('/pay',
  body('amount').isFloat({ min: 0.01 }).withMessage('Amount must be a positive number'),
  handleValidationErrors,
  async (req, res, next) => {
    try {
      if (req.user.isGuest) {
        throw new ApiError(403, 'Guests cannot make payments');
      }
      
      const result = await WalletService.pay(req.user.userId, req.body);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }
);

module.exports = router;
