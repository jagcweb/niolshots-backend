const puppeteer = require('puppeteer');

class PuppeteerBatchService {
  constructor() {
    this.browser = null;
    this.page = null;
    this.isInitialized = false;
  }

  async initialize() {
    if (this.isInitialized && this.browser) {
      return;
    }

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
        '--single-process',
        '--memory-pressure-off', // Optimización adicional para memoria
        '--disable-extensions',
        '--disable-plugins'
      ];
    }

    try {
      this.browser = await puppeteer.launch(launchOptions);
      this.page = await this.browser.newPage();
      this.isInitialized = true;
      console.log('Puppeteer initialized successfully');
    } catch (err) {
      console.error('Error initializing Puppeteer:', err);
      throw err;
    }
  }

  async fetchJson(url) {
    if (!this.isInitialized) {
      await this.initialize();
    }

    try {
      await this.page.goto(url, { 
        waitUntil: 'networkidle2', 
        timeout: 30000 
      });

      const content = await this.page.evaluate(() => document.body.innerText);
      return JSON.parse(content);
    } catch (err) {
      console.error(`Error fetching URL ${url}:`, err);
      throw err;
    }
  }

  async fetchMultipleJson(urls) {
    if (!this.isInitialized) {
      await this.initialize();
    }

    const results = {};
    
    for (const [key, url] of Object.entries(urls)) {
      try {
        console.log(`Fetching ${key}: ${url}`);
        results[key] = await this.fetchJson(url);
        
        // Pequeña pausa entre requests para no sobrecargar
        await new Promise(resolve => setTimeout(resolve, 100));
      } catch (err) {
        console.error(`Error fetching ${key}:`, err);
        results[key] = { error: err.message };
      }
    }

    return results;
  }

  async close() {
    if (this.browser) {
      try {
        await this.browser.close();
        this.browser = null;
        this.page = null;
        this.isInitialized = false;
        console.log('Puppeteer closed successfully');
      } catch (err) {
        console.error('Error closing Puppeteer:', err);
      }
    }
  }

  // Método para limpiar y reinicializar si hay problemas
  async reset() {
    await this.close();
    await this.initialize();
  }
}

// Singleton instance
let instance = null;

function getInstance() {
  if (!instance) {
    instance = new PuppeteerBatchService();
  }
  return instance;
}

module.exports = {
  PuppeteerBatchService,
  getInstance
};