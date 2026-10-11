const { NotFoundError } = require("../errors");
const { requesterNamesFromTags } = require("./requesters");

async function arrGet(baseUrl, apiKey, path) {
  const response = await fetch(`${baseUrl}${path}`, {
    headers: {
      "X-Api-Key": apiKey,
    },
  });

  if (!response.ok) {
    throw new Error(`Request to ${path} failed with status ${response.status}`);
  }

  return response.json();
}

async function lookupRequesters({
  baseUrl,
  apiKey,
  resourcePath,
  notFoundMessage,
}) {
  const [items, tags] = await Promise.all([
    arrGet(baseUrl, apiKey, resourcePath),
    arrGet(baseUrl, apiKey, "/api/v3/tag"),
  ]);

  const item = Array.isArray(items) ? items[0] : null;

  if (!item) {
    throw new NotFoundError(notFoundMessage);
  }

  return requesterNamesFromTags(item.tags, tags);
}

module.exports = { lookupRequesters };
