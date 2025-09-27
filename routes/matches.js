const express = require('express');
const router = express.Router();
const MatchApiService = require('../services/MatchApiService');
const matchApi = new MatchApiService();

// GET /api/matches?date=YYYY-MM-DD
router.get('/:date', async (req, res) => {
  try {
    const date = req.params.date;
    const matches = await matchApi.getMatches(date);
    res.json({ events: matches });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


module.exports = router;