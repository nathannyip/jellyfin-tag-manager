const config = require("../config");
const { lookupRequesters } = require("./arr");

function getRadarrRequesters(tmdbId) {
  return lookupRequesters({
    baseUrl: config.radarrUrl,
    apiKey: config.radarrApiKey,
    resourcePath: `/api/v3/movie?tmdbId=${encodeURIComponent(tmdbId)}`,
    notFoundMessage: `Movie with TMDB ID ${tmdbId} not found in Radarr`,
  });
}

module.exports = { getRadarrRequesters };
