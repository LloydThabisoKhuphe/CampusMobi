const express = require('express');
const CampusService = require('../services/campusService');

const router = express.Router();

// GET /services
router.get('/', async (req, res, next) => {
  try {
    const services = await CampusService.getServices();
    res.json(services);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
