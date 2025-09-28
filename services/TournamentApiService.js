// ELIMINAR: const puppeteer = require('puppeteer'); - Ya no es necesario
const { getInstance } = require('./CloudscraperBatchService.'); // CAMBIO: Importar el servicio centralizado

class TournamentApiService {
  constructor() {
    this.puppeteerService = getInstance(); // CAMBIO: Usar la instancia singleton
  }

  async getAllTournaments() {
    const url = 'https://www.sofascore.com/api/v1/search/suggestions/unique-tournaments?sport=football';
    
    try {
      // CAMBIO: Usar el servicio centralizado - solo 2 líneas en lugar de 45
      const jsonObject = await this.puppeteerService.fetchJson(url);
      return jsonObject.results || [];
    } catch (err) {
      console.error('Error fetching tournaments:', err);
      throw err;
    }
  }
}

module.exports = TournamentApiService;