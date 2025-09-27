const puppeteer = require('puppeteer');

class MatchApiService {
  constructor() {
    this.matchesBaseUrl = "https://www.sofascore.com/api/v1/sport/football/scheduled-events";
    this.matchBaseUrl = "https://www.sofascore.com/api/v1/event";
  }

  async fetchJsonWithPuppeteer(url) {
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();

    await page.goto(url, { waitUntil: 'networkidle2' });
    const content = await page.evaluate(() => document.body.innerText);

    await browser.close();

    return JSON.parse(content);
  }

  async getMatches(date) {
    try {
      const url = `${this.matchesBaseUrl}/${date}`;
      const jsonObject = await this.fetchJsonWithPuppeteer(url);
      return jsonObject.events || [];
    } catch (e) {
      throw new Error(`Error fetching matches: ${e.message}`);
    }
  }

  async getMatch(matchId) {
    try {
      const url = `${this.matchBaseUrl}/${matchId}`;
      const jsonObject = await this.fetchJsonWithPuppeteer(url);
      return jsonObject.event;
    } catch (e) {
      throw new Error(`Error fetching match: ${e.message}`);
    }
  }
}

module.exports = MatchApiService;