const puppeteer = require('puppeteer');

class StatsApiService {
  constructor() {
    this.baseUrl = "https://www.sofascore.com/api/v1/event";
  }

  async fetchJsonWithPuppeteer(url) {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    await page.goto(url, { waitUntil: 'networkidle2' });
    const content = await page.evaluate(() => document.body.innerText);

    await browser.close();

    return JSON.parse(content);
  }

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

  async getPlayerStats(matchId) {
    const url = `${this.baseUrl}/${matchId}/lineups`;
    try {
      const jsonObject = await this.fetchJsonWithPuppeteer(url);
      return jsonObject;
    } catch (e) {
      throw new Error(`Error fetching player stats: ${e.message}`);
    }
  }

  async getMatchIncidents(matchId) {
    try {
      const url = `${this.baseUrl}/${matchId}/incidents`;
      const jsonObject = await this.fetchJsonWithPuppeteer(url);
      return jsonObject.incidents || [];
    } catch (e) {
      throw new Error(`Error fetching match incidents: ${e.message}`);
    }
  }

  async getMatchSummary(matchId) {
    try {
      const shots = await this.getShots(matchId);
      const stats = await this.getPlayerStats(matchId);
      const incidents = await this.getMatchIncidents(matchId);
      return {
        shots,
        stats,
        incidents
      };
    } catch (e) {
      throw new Error(`Error fetching match summary: ${e.message}`);
    }
  }
}

module.exports = StatsApiService;