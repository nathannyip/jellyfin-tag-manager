const config = require("../config");

async function notifyTagUpdate({ itemType, title, added }) {
  const message = `Jellyfin Tag Manager updated ${itemType} ${title}: ${added.join(", ")}`;

  const response = await fetch(config.ntfyUrl, {
    method: "POST",
    body: message,
  });

  if (!response.ok) {
    throw new Error(`ntfy error: ${response.status}`);
  }
}

module.exports = { notifyTagUpdate };
