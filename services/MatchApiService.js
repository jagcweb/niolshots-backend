const { getInstance } = require('./CloudscraperBatchService');

class MatchApiService {
  constructor() {
    this.matchesBaseUrl = "https://www.sofascore.com/api/v1/sport/football/scheduled-events";
    this.matchBaseUrl = "https://www.sofascore.com/api/v1/event";
    this.cloudScraperService = getInstance();
    
    // Mapa de torneos principales por país
    this.mainTournaments = {
      // España
      'ES': ['laliga', 'primera-division', 'laliga-ea-sports', 'segunda-division', 'laliga-hypermotion', 'copa-del-rey', 'supercopa-de-espana'],
      'ESP': ['laliga', 'primera-division', 'laliga-ea-sports', 'segunda-division', 'laliga-hypermotion', 'copa-del-rey', 'supercopa-de-espana'],
      'spain': ['laliga', 'primera-division', 'laliga-ea-sports', 'segunda-division', 'laliga-hypermotion', 'copa-del-rey', 'supercopa-de-espana'],
      
      // Portugal
      'PT': ['liga-portugal-betclic', 'primeira-liga', 'taca-de-portugal', 'supercopa-candido-de-oliveira'],
      'POR': ['liga-portugal-betclic', 'primeira-liga', 'taca-de-portugal', 'supercopa-candido-de-oliveira'],
      'portugal': ['liga-portugal-betclic', 'primeira-liga', 'taca-de-portugal', 'supercopa-candido-de-oliveira'],
      
      // Turquía
      'TR': ['super-lig', 'turkiye-kupasi', 'super-kupa'],
      'TUR': ['super-lig', 'turkiye-kupasi', 'super-kupa'],
      'turkey': ['super-lig', 'turkiye-kupasi', 'super-kupa'],
      
      // Inglaterra
      'EN': ['premier-league', 'championship', 'efl-championship', 'fa-cup', 'efl-cup', 'carabao-cup', 'community-shield'],
      'ENG': ['premier-league', 'championship', 'efl-championship', 'fa-cup', 'efl-cup', 'carabao-cup', 'community-shield'],
      'england': ['premier-league', 'championship', 'efl-championship', 'fa-cup', 'efl-cup', 'carabao-cup', 'community-shield'],
      
      // Italia
      'IT': ['serie-a', 'serie-b', 'coppa-italia', 'supercoppa-italiana'],
      'ITA': ['serie-a', 'serie-b', 'coppa-italia', 'supercoppa-italiana'],
      'italy': ['serie-a', 'serie-b', 'coppa-italia', 'supercoppa-italiana'],
      
      // Alemania
      'DE': ['bundesliga', '2-bundesliga', 'dfb-pokal', 'dfl-supercup'],
      'DEU': ['bundesliga', '2-bundesliga', 'dfb-pokal', 'dfl-supercup'],
      'germany': ['bundesliga', '2-bundesliga', 'dfb-pokal', 'dfl-supercup'],
      
      // Francia
      'FR': ['ligue-1', 'ligue-2', 'coupe-de-france', 'trophee-des-champions'],
      'FRA': ['ligue-1', 'ligue-2', 'coupe-de-france', 'trophee-des-champions'],
      'france': ['ligue-1', 'ligue-2', 'coupe-de-france', 'trophee-des-champions'],
    };
    
    // Torneos internacionales (sin país específico)
    this.internationalTournaments = new Set([
      'champions-league', 'uefa-champions-league',
      'europa-league', 'uefa-europa-league', 
      'europa-conference-league', 'uefa-europa-conference-league',
      'supercopa-de-la-uefa', 'uefa-super-cup',
      'copa-mundial-de-clubes', 'fifa-club-world-cup',
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
    
    const tournamentSlug = tournament.slug?.toLowerCase() || '';
    const tournamentUniqueSlug = tournament.uniqueTournament?.slug?.toLowerCase() || '';
    const country = tournament.category?.country;
    
    // Primero verificar torneos internacionales (sin país específico)
    if (this.internationalTournaments.has(tournamentSlug) || 
        this.internationalTournaments.has(tournamentUniqueSlug)) {
      return true;
    }
    
    // Si no hay información del país, no es un torneo que nos interese
    if (!country) return false;
    
    // Obtener identificadores del país
    const alpha2 = country.alpha2?.toLowerCase();
    const alpha3 = country.alpha3?.toLowerCase(); 
    const countryName = country.name?.toLowerCase();
    const countrySlug = country.slug?.toLowerCase();
    
    // Buscar el país en nuestro mapa de torneos principales
    const countryKeys = [alpha2, alpha3, countryName, countrySlug].filter(Boolean);
    
    for (const countryKey of countryKeys) {
      const allowedTournaments = this.mainTournaments[countryKey];
      if (allowedTournaments) {
        // Verificar si el torneo está en la lista permitida para este país
        if (allowedTournaments.includes(tournamentSlug) || 
            allowedTournaments.includes(tournamentUniqueSlug)) {
          return true;
        }
        
        // Verificación adicional por coincidencia parcial para mayor flexibilidad
        const tournamentName = tournament.name?.toLowerCase() || '';
        return allowedTournaments.some(allowedTournament => {
          return tournamentName.includes(allowedTournament.replace(/-/g, ' ')) ||
                 tournamentSlug.includes(allowedTournament) ||
                 tournamentUniqueSlug.includes(allowedTournament);
        });
      }
    }
    
    return false;
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