const express = require('express');
const router = express.Router();
const axios = require('axios');

// GET /api/team-image/:teamId
router.get('/:teamId', async (req, res) => {
  const teamId = req.params.teamId;
  const url = `https://img.sofascore.com/api/v1/team/${teamId}/image`;

  try {
    // Request con responseType 'stream' para pasar la imagen directamente
    const response = await axios.get(url, { responseType: 'stream' });

    // Copiamos los headers de contenido (tipo de imagen)
    res.setHeader('Content-Type', response.headers['content-type']);

    // Pipe del stream directamente a la respuesta
    response.data.pipe(res);
  } catch (error) {
    console.error('Error fetching team image:', error.message);
    res.status(500).send('Error fetching team image');
  }
});

module.exports = router;
