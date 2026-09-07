const express = require('express');
const { body, validationResult } = require('express-validator');
const AuthService = require('../services/authService');
const { ApiError } = require('../middleware/errorHandler');

const router = express.Router();

// Middleware to handle validation errors
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new ApiError(400, errors.array()[0].msg);
  }
  next();
};

// POST /auth/register
router.post('/register',
  body('username').notEmpty().withMessage('Username is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('fullName').notEmpty().withMessage('Full name is required'),
  handleValidationErrors,
  async (req, res, next) => {
    try {
      const result = await AuthService.register(req.body);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }
);

// POST /auth/login
router.post('/login',
  body('username').notEmpty().withMessage('Username is required'),
  body('password').notEmpty().withMessage('Password is required'),
  handleValidationErrors,
  async (req, res, next) => {
    try {
      const result = await AuthService.login(req.body);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }
);

// POST /auth/guest
router.post('/guest', async (req, res, next) => {
  try {
    const result = await AuthService.loginAsGuest();
    res.json(result);
  } catch (error) {
    next(error);
  }
});

// POST /auth/forgot-password
router.post('/forgot-password',
  body('username').notEmpty().withMessage('Username is required'),
  handleValidationErrors,
  async (req, res, next) => {
    try {
      const result = await AuthService.forgotPassword(req.body);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }
);

module.exports = router;
