const puppeteer = require('puppeteer');

class TournamentApiService {
  async getAllTournaments() {
    const puppeteer = require('puppeteer');

    let launchOptions = { headless: true };

    if (process.platform === 'win32') {
      // Windows: usa Chromium que Puppeteer descarga por defecto
      launchOptions.executablePath = undefined;
    } else if (process.platform === 'linux') {
      // Linux server: usar Chromium del sistema y optimizado para VPS de 1GB
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

      // Timeout de 30s máximo
      await page.goto(
        'https://www.sofascore.com/api/v1/search/suggestions/unique-tournaments?sport=football',
        { waitUntil: 'networkidle2', timeout: 30000 }
      );

      const content = await page.evaluate(() => document.body.innerText);
      const jsonObject = JSON.parse(content);

      return jsonObject.results || [];

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
}

module.exports = TournamentApiService;
