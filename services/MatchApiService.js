const { getInstance } = require('./CloudscraperBatchService');


class MatchApiService {
  constructor() {
    this.matchesBaseUrl = "https://www.sofascore.com/api/v1/sport/football/scheduled-events";
    this.matchBaseUrl = "https://www.sofascore.com/api/v1/event";
    this.CloudscraperService = getInstance();
  }

  async getMatches(date) {
    try {
      const url = `${this.matchesBaseUrl}/${date}`;
      const jsonObject = await this.CloudscraperService.fetchJson(url);
      return jsonObject.events || [];
    } catch (e) {
      throw new Error(`Error fetching matches: ${e.message}`);
    }
  }

  async getMatch(matchId) {
    try {
      const url = `${this.matchBaseUrl}/${matchId}`;
      const jsonObject = await this.CloudscraperService.fetchJson(url);
      return jsonObject.event;
    } catch (e) {
      throw new Error(`Error fetching match: ${e.message}`);
    }
  }
}

module.exports = MatchApiService;