const express = require('express');
const router = express.Router();
const MatchApiService = require('../services/MatchApiService');
const matchApi = new MatchApiService();

// GET /api/match/:id
router.get('/:id', async (req, res) => {
  try {
    const matchId = req.params.id;
    const match = await matchApi.getMatch(matchId);
    res.json(match);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;