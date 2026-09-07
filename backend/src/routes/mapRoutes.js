const express = require('express');
const CampusService = require('../services/campusService');

const router = express.Router();

// GET /map/locations
router.get('/locations', async (req, res, next) => {
  try {
    const locations = await CampusService.getCampusLocations();
    res.json(locations);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
