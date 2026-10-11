require("dotenv").config({ quiet: true });

function requireEnv(name) {
  const value = process.env[name];

  if (!value || !value.trim()) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value.trim().replace(/\/$/, "");
}

const config = {
  port: Number(process.env.PORT) || 3000,
  radarrUrl: requireEnv("RADARR_URL"),
  radarrApiKey: requireEnv("RADARR_API_KEY"),
  sonarrUrl: requireEnv("SONARR_URL"),
  sonarrApiKey: requireEnv("SONARR_API_KEY"),
  jellyfinUrl: requireEnv("JELLYFIN_URL"),
  jellyfinApiKey: requireEnv("JELLYFIN_API_KEY"),
  ntfyUrl: requireEnv("NTFY_URL"),
};

module.exports = config;
