const config = require("../config");
const { NotFoundError } = require("../errors");

function authHeaders(extraHeaders = {}) {
  return {
    Authorization: `MediaBrowser Token="${config.jellyfinApiKey}"`,
    ...extraHeaders,
  };
}

async function getJellyfinItem(jellyfinId) {
  const params = new URLSearchParams({
    ids: String(jellyfinId),
    fields: "Tags",
  });

  const response = await fetch(`${config.jellyfinUrl}/Items?${params}`, {
    headers: authHeaders(),
  });

  if (!response.ok) {
    throw new Error(`Jellyfin API error: ${response.status}`);
  }

  const body = await response.json();
  const item = body.Items?.[0];

  if (!item?.Id) {
    throw new NotFoundError(`Jellyfin item ${jellyfinId} not found`);
  }

  return item;
}

async function updateJellyfinTags(jellyfinId, tags) {
  // Jellyfin 12 applies only the fields present in the body, so sending Tags
  // leaves the rest of the item metadata unchanged.
  const response = await fetch(
    `${config.jellyfinUrl}/Items/${encodeURIComponent(jellyfinId)}`,
    {
      method: "POST",
      headers: authHeaders({ "Content-Type": "application/json" }),
      body: JSON.stringify({ Tags: tags }),
    }
  );

  if (response.status === 404) {
    throw new NotFoundError(`Jellyfin item ${jellyfinId} not found`);
  }

  if (!response.ok) {
    throw new Error(`Jellyfin update error: ${response.status}`);
  }
}

module.exports = { getJellyfinItem, updateJellyfinTags };
