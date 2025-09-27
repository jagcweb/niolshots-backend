const puppeteer = require('puppeteer');

class MatchApiService {
  constructor() {
    this.matchesBaseUrl = "https://www.sofascore.com/api/v1/sport/football/scheduled-events";
    this.matchBaseUrl = "https://www.sofascore.com/api/v1/event";
  }

  async fetchJsonWithPuppeteer(url) {
    const puppeteer = require('puppeteer');

    let launchOptions = { headless: true };

    if (process.platform === 'win32') {
      // Windows: usa Chromium que Puppeteer descarga por defecto
      launchOptions.executablePath = undefined; // opcional, Puppeteer lo maneja solo
    } else if (process.platform === 'linux') {
      // Linux server: usar Chromium del sistema para evitar problemas
      launchOptions.executablePath = '/usr/bin/chromium-browser';
        launchOptions.args = [
    '--no-sandbox',
    '--disable-setuid-sandbox',
    '--disable-dev-shm-usage',
    '--disable-gpu',
    '--single-process'
  ];
    }

    const browser = await puppeteer.launch(launchOptions);

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