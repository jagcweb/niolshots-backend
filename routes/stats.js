const express = require('express');
const router = express.Router();
const StatsApiService = require('../services/StatsApiService');
const statsApi = new StatsApiService();

// GET /api/stats/:matchId
router.get('/:matchId', async (req, res) => {
  try {
    const matchId = req.params.matchId;
    const summary = await statsApi.getMatchSummary(matchId);
    res.json(summary);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;