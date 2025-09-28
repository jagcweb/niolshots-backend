const { getInstance } = require('./CloudscraperBatchService');

class TeamImageService {
  constructor() {
    this.baseUrl = "https://img.sofascore.com/api/v1/team";
    this.cloudScraperService = getInstance();
  }

  // Construir URL de la imagen del equipo
  getTeamImageUrl(teamId) {
    if (!teamId) throw new Error("teamId is required");
    return `${this.baseUrl}/${teamId}/image`;
  }

  // Descargar la imagen (binario)
  async getTeamImage(teamId) {
    if (!teamId) throw new Error("teamId is required");

    const url = this.getTeamImageUrl(teamId);

    try {
      // Necesitamos un fetchBinary en CloudscraperBatchService
      const imageBuffer = await this.cloudScraperService.fetchBinary(url);
      return imageBuffer;
    } catch (e) {
      throw new Error(`Error fetching team image: ${e.message}`);
    }
  }
}

module.exports = TeamApiService;
