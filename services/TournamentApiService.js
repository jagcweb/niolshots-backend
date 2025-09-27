const puppeteer = require('puppeteer');

class TournamentApiService {
  async getAllTournaments() {
    const browser = await puppeteer.launch({ headless: true });
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