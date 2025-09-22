const express = require('express');
const router = express.Router();
const MatchApiService = require('../services/MatchApiService');
const matchApi = new MatchApiService();

// GET /api/matches?date=YYYY-MM-DD
router.get('/', async (req, res) => {
  try {
    const date = req.query.date;
    if (!date) return res.status(400).json({ error: 'Missing date parameter' });
    const matches = await matchApi.getMatches(date);
    res.json(matches);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;