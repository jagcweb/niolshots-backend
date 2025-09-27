const puppeteer = require('puppeteer');

class StatsApiService {
  constructor() {
    this.baseUrl = "https://www.sofascore.com/api/v1/event";
  }

  async fetchJsonWithPuppeteer(url) {
    const puppeteer = require('puppeteer');

    let launchOptions = { headless: true };

    if (process.platform === 'win32') {
      launchOptions.executablePath = undefined;
    } else if (process.platform === 'linux') {
      launchOptions.executablePath = '/usr/bin/chromium-browser';
      launchOptions.args = [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-gpu',
        '--single-process'
      ];
    }

    let browser;
    try {
      browser = await puppeteer.launch(launchOptions);
      const page = await browser.newPage();

      // Timeout de 30s máximo para no colgar el VPS
      await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });

      // Extraemos el texto de body y parseamos JSON
      const content = await page.evaluate(() => document.body.innerText);

      return JSON.parse(content);

    } catch (err) {
      console.error('Error en Puppeteer:', err);
      throw err;

    } finally {
      if (browser) {
        try {
          await browser.close();
        } catch (err) {
          console.error('Error cerrando Puppeteer:', err);
        }
      }
    }
  }


  // Obtener mapa de tiros
  async getShots(matchId) {
    if (!matchId) return [];
    const shotsUrl = `${this.baseUrl}/${matchId}/shotmap`;

    try {
      const jsonObject = await this.fetchJsonWithPuppeteer(shotsUrl);
      return jsonObject.shotmap || [];
    } catch (e) {
      throw new Error(`Error fetching shots: ${e.message}`);
    }
  }

  // Obtener estadísticas de jugadores
  async getPlayerStats(matchId) {
    if (!matchId) return {};
    const url = `${this.baseUrl}/${matchId}/lineups`;
    try {
      const jsonObject = await this.fetchJsonWithPuppeteer(url);
      return jsonObject || {};
    } catch (e) {
      throw new Error(`Error fetching player stats: ${e.message}`);
    }
  }

  // Obtener incidencias del partido
  async getMatchIncidents(matchId) {
    if (!matchId) return [];
    const url = `${this.baseUrl}/${matchId}/incidents`;
    try {
      const jsonObject = await this.fetchJsonWithPuppeteer(url);
      return jsonObject.incidents || [];
    } catch (e) {
      throw new Error(`Error fetching match incidents: ${e.message}`);
    }
  }

// Obtener información principal del partido (equipos y tiempo)
async getMatchInfo(matchId) {
  if (!matchId) throw new Error("matchId is required");

  const url = `${this.baseUrl}/${matchId}`;
  try {
    const response = await this.fetchJsonWithPuppeteer(url);

    // Extraemos "event" primero
    const eventDetails = response.event || {};

    const homeTeam = eventDetails.homeTeam || {};
    const awayTeam = eventDetails.awayTeam || {};
    const time = eventDetails.time || {};

    const status = eventDetails.status || {
      code: 100,
      description: "Ended",
      type: "finished"
    };

    return { homeTeam, awayTeam, time, status };
  } catch (e) {
    throw new Error(`Error fetching match info: ${e.message}`);
  }
}


  async getMatchSummary(matchId) {
    if (!matchId) throw new Error("matchId is required");

    try {
      const [shots, playerStats, incidents, matchInfo] = await Promise.all([
        this.getShots(matchId),
        this.getPlayerStats(matchId),
        this.getMatchIncidents(matchId),
        this.getMatchInfo(matchId),
      ]);

      // Transformar incidents a fouls si es necesario
      const fouls = incidents
        .filter(i => i.player)
        .map(i => ({
          playerId: i.player.id,
          playerName: i.player.name,
          shirtNumber: parseInt(i.player.jerseyNumber || "0"),
          team: i.teamSide || "unknown",
          time: i.time,
          timeSeconds: (i.time || 0) * 60,
          foulType: i.cardType || "Falta",
          description: `${i.cardType || 'Falta'} para ${i.player.name}`,
          incidentId: i.id
        }));

      return {
        homeTeam: matchInfo.homeTeam,
        awayTeam: matchInfo.awayTeam,
        time: matchInfo.time,
        status: matchInfo.status,
        summary: {
          shots,
          stats: playerStats,
          fouls,
          saves: [], // si no tienes datos de paradas, dejar vacío
          incidents
        }
      };
    } catch (e) {
      throw new Error(`Error fetching match summary: ${e.message}`);
    }
  }

}

module.exports = StatsApiService;
