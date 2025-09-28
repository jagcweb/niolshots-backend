const cloudscraper = require('cloudscraper');

class CloudscraperBatchService {
  constructor() {}

  async fetchJson(url) {
    try {
      const body = await cloudscraper.get(url);
      return JSON.parse(body);
    } catch (err) {
      console.error(`Error fetching URL ${url}:`, err.message);
      return { error: err.message };
    }
  }

  async fetchMultipleJson(urls) {
    const results = {};

    for (const [key, url] of Object.entries(urls)) {
      try {
        console.log(`Fetching ${key}: ${url}`);
        results[key] = await this.fetchJson(url);
        // pausa corta para no saturar
        await new Promise(resolve => setTimeout(resolve, 100));
      } catch (err) {
        console.error(`Error fetching ${key}:`, err.message);
        results[key] = { error: err.message };
      }
    }

    return results;
  }

  async close() {
    // aquí no hace falta nada porque cloudscraper no abre navegador
    console.log('Cloudscraper service closed');
  }

  async reset() {
    // placeholder para mantener misma API
    console.log('Cloudscraper service reset');
  }
}

// Singleton
let instance = null;

function getInstance() {
  if (!instance) {
    instance = new CloudscraperBatchService();
  }
  return instance;
}

module.exports = {
  CloudscraperBatchService,
  getInstance
};
