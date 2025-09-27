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