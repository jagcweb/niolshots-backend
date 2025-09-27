const puppeteer = require('puppeteer');

class TournamentApiService {
  async getAllTournaments() {
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

    await page.goto('https://www.sofascore.com/api/v1/search/suggestions/unique-tournaments?sport=football', {
      waitUntil: 'networkidle2'
    });

    const content = await page.evaluate(() => document.body.innerText);

    await browser.close();

    const jsonObject = JSON.parse(content);
    return jsonObject.results || [];
  }
}

module.exports = TournamentApiService;