const express = require('express');
const router = express.Router();
const TournamentApiService = require('../services/TournamentApiService');
const tournamentApi = new TournamentApiService();

// GET /api/tournaments
router.get('/', async (req, res) => {
  try {
    const tournaments = await tournamentApi.getAllTournaments();
    res.json({ results: tournaments }); // <--- envía como objeto con results
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


module.exports = router;