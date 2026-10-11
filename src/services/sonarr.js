const config = require("../config");
const { lookupRequesters } = require("./arr");

function getSonarrRequesters(tvdbId) {
  return lookupRequesters({
    baseUrl: config.sonarrUrl,
    apiKey: config.sonarrApiKey,
    resourcePath: `/api/v3/series?tvdbId=${encodeURIComponent(tvdbId)}`,
    notFoundMessage: `Series with TVDB ID ${tvdbId} not found in Sonarr`,
  });
}

module.exports = { getSonarrRequesters };
