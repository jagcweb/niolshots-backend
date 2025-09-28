const { getInstance } = require('./CloudscraperBatchService');

class MatchApiService {
  constructor() {
    this.matchesBaseUrl = "https://www.sofascore.com/api/v1/sport/football/scheduled-events";
    this.matchBaseUrl = "https://www.sofascore.com/api/v1/event";
    this.cloudScraperService = getInstance();
    
    // Lista de IDs o nombres de torneos principales
    this.mainTournaments = new Set([
      // España
      'laliga', 'primera-division', 'laliga-ea-sports',
      'segunda-division', 'laliga-hypermotion', 'laliga-smartbank',
      'copa-del-rey', 'supercopa-de-espana',
      
      // Portugal
      'liga-portugal-betclic', 'primeira-liga',
      'taca-de-portugal', 'supercopa-candido-de-oliveira',
      
      // Turquía
      'super-lig', 'turkiye-kupasi', 'super-kupa',
      
      // Inglaterra
      'premier-league',
      'championship', 'efl-championship',
      'fa-cup', 'efl-cup', 'carabao-cup', 'community-shield',
      
      // Italia
      'serie-a', 'serie-b',
      'coppa-italia', 'supercoppa-italiana',
      
      // Alemania
      'bundesliga', '2-bundesliga',
      'dfb-pokal', 'dfl-supercup',
      
      // Francia
      'ligue-1', 'ligue-2',
      'coupe-de-france', 'trophee-des-champions',
      
      // Torneos internacionales de clubes
      'champions-league', 'uefa-champions-league',
      'europa-league', 'uefa-europa-league',
      'europa-conference-league', 'uefa-europa-conference-league',
      'supercopa-de-la-uefa', 'uefa-super-cup',
      'copa-mundial-de-clubes', 'fifa-club-world-cup',
      
      // Torneos internacionales de selecciones
      'copa-mundial', 'fifa-world-cup', 'world-cup',
      'copa-mundial-femenina', 'fifa-womens-world-cup',
      'euro', 'uefa-euro', 'european-championship',
      'copa-america',
      'copa-oro', 'concacaf-gold-cup',
      'copa-africana', 'afcon', 'africa-cup-of-nations',
      'copa-asiatica', 'afc-asian-cup',
      'copa-naciones-ofc', 'ofc-nations-cup',
      'copa-arabe', 'fifa-arab-cup',
      'juegos-olimpicos', 'olympics', 'olympic-games',
      'uefa-nations-league', 'nations-league',
      'world-cup-qualification', 'euro-qualification', 'clasificatorias'
    ]);
  }

  /**
   * Verifica si un torneo es considerado principal
   * @param {Object} tournament - Objeto tournament del evento
   * @returns {boolean}
   */
  isMainTournament(tournament) {
    if (!tournament) return false;
    
    const tournamentName = tournament.name?.toLowerCase() || '';
    const tournamentSlug = tournament.slug?.toLowerCase() || '';
    const tournamentUniqueSlug = tournament.uniqueTournament?.slug?.toLowerCase() || '';
    
    // Verificar por slug del torneo único (más específico)
    if (tournamentUniqueSlug && this.mainTournaments.has(tournamentUniqueSlug)) {
      return true;
    }
    
    // Verificar por slug del torneo
    if (tournamentSlug && this.mainTournaments.has(tournamentSlug)) {
      return true;
    }
    
    // Verificar por nombre (coincidencia parcial para mayor flexibilidad)
    const mainTournamentNames = [
      'laliga', 'primera division', 'segunda division', 'copa del rey', 'supercopa',
      'liga portugal', 'primeira liga', 'taça de portugal',
      'süper lig', 'super lig', 'türkiye kupası',
      'premier league', 'championship', 'fa cup', 'efl cup', 'carabao',
      'serie a', 'serie b', 'coppa italia', 'supercoppa',
      'bundesliga', 'dfb-pokal', 'dfl-supercup',
      'ligue 1', 'ligue 2', 'coupe de france', 'trophée des champions',
      'champions league', 'europa league', 'conference league',
      'world cup', 'copa mundial', 'euro', 'copa america', 'nations league',
      'copa oro', 'afcon', 'asian cup', 'olympics'
    ];
    
    return mainTournamentNames.some(mainName => 
      tournamentName.includes(mainName) || 
      tournamentSlug.includes(mainName.replace(/\s+/g, '-'))
    );
  }

  async getMatches(date, filterMainTournaments = true) {
    try {
      const url = `${this.matchesBaseUrl}/${date}`;
      const jsonObject = await this.cloudScraperService.fetchJson(url);
      const events = jsonObject.events || [];
      
      if (!filterMainTournaments) {
        return events;
      }
      
      // Filtrar solo torneos principales
      const filteredEvents = events.filter(event => {
        return this.isMainTournament(event.tournament);
      });
      
      console.log(`Eventos originales: ${events.length}, Eventos filtrados: ${filteredEvents.length}`);
      
      return filteredEvents;
    } catch (e) {
      throw new Error(`Error fetching matches: ${e.message}`);
    }
  }

  async getMatch(matchId) {
    try {
      const url = `${this.matchBaseUrl}/${matchId}`;
      const jsonObject = await this.cloudScraperService.fetchJson(url);
      return jsonObject.event;
    } catch (e) {
      throw new Error(`Error fetching match: ${e.message}`);
    }
  }

  /**
   * Obtiene los torneos únicos de una fecha para debugging
   * @param {string} date 
   */
  async getTournamentsList(date) {
    try {
      const url = `${this.matchesBaseUrl}/${date}`;
      const jsonObject = await this.cloudScraperService.fetchJson(url);
      const events = jsonObject.events || [];
      
      const tournaments = new Map();
      
      events.forEach(event => {
        if (event.tournament) {
          const key = event.tournament.uniqueTournament?.slug || event.tournament.slug || event.tournament.name;
          if (!tournaments.has(key)) {
            tournaments.set(key, {
              name: event.tournament.name,
              slug: event.tournament.slug,
              uniqueSlug: event.tournament.uniqueTournament?.slug,
              country: event.tournament.category?.name,
              isMain: this.isMainTournament(event.tournament)
            });
          }
        }
      });
      
      return Array.from(tournaments.values())
        .sort((a, b) => a.name.localeCompare(b.name));
    } catch (e) {
      throw new Error(`Error fetching tournaments list: ${e.message}`);
    }
  }
}

module.exports = MatchApiService;