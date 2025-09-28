const express = require('express');
const cors = require('cors');

const matchesRouter = require('./routes/matches');
const tournamentsRouter = require('./routes/tournaments');
const matchRouter = require('./routes/match');
const statsRouter = require('./routes/stats');
const teamImageRouter = require('./routes/team-image'); // <-- nueva ruta

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/matches', matchesRouter);
app.use('/api/tournaments', tournamentsRouter);
app.use('/api/match', matchRouter);
app.use('/api/stats', statsRouter);
app.use('/api/team-image', teamImageRouter); // <-- registrar ruta

app.get('/', (req, res) => {
  res.send('API NiolShots funcionando');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`API server running on port ${PORT}`);
});
