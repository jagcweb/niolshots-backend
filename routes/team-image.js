const express = require('express');
const router = express.Router();
const cloudscraper = require('cloudscraper');

// GET /api/team-image/:teamId
router.get('/:teamId', async (req, res) => {
  const teamId = req.params.teamId;
  const url = `https://img.sofascore.com/api/v1/team/${teamId}/image`;

  try {
    const imageBuffer = await cloudscraper.get({ 
      uri: url,
      encoding: null, // importante para recibir buffer binario
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 ' +
                      '(KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36',
        'Referer': 'https://www.sofascore.com/'
      }
    });

    // Detectar tipo de imagen por los primeros bytes si quieres, o forzar png
    res.setHeader('Content-Type', 'image/png');
    res.send(imageBuffer);

  } catch (error) {
    console.error('Error fetching team image:', error.message);
    res.status(500).send('Error fetching team image');
  }
});

module.exports = router;
