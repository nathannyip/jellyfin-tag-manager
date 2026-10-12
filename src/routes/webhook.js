const express = require("express");
const { NotFoundError } = require("../errors");
const { mergeTags } = require("../services/requesters");
const { getRadarrRequesters } = require("../services/radarr");
const { getSonarrRequesters } = require("../services/sonarr");
const { getJellyfinItem, updateJellyfinTags } = require("../services/jellyfin");
const { notifyTagUpdate } = require("../services/ntfy");

const router = express.Router();

function parseEvent(body) {
  if (typeof body === "string") {
    return JSON.parse(body);
  }

  return body;
}

async function syncRequesterTags({ jellyfinId, title, itemType, requesters }) {
  const item = await getJellyfinItem(jellyfinId);
  const existingTags = item.Tags || [];
  const { added, newTags, needsUpdate } = mergeTags(existingTags, requesters);

  if (!needsUpdate) {
    return {
      success: true,
      status: "skipped",
      message: "Jellyfin tags already include every tag",
      jellyfinId,
      title,
      itemType,
      requesters,
      tags: existingTags,
    };
  }

  await updateJellyfinTags(jellyfinId, newTags);

  await notifyTagUpdate({ itemType, title, added });

  return {
    success: true,
    status: "updated",
    message: "Jellyfin tags updated",
    jellyfinId,
    title,
    itemType,
    added,
    tags: newTags,
  };
}

router.post("/jellyfin", async (req, res) => {
  try {
    const event = parseEvent(req.body);

    if (!event || typeof event !== "object" || Array.isArray(event)) {
      return res.status(400).json({
        success: false,
        message: "Invalid webhook payload",
      });
    }

    const {
      NotificationType: notificationType,
      ItemType: itemType,
      ItemId: jellyfinId,
      Name: title,
      Provider_tmdb: tmdbId,
      Provider_tvdb: tvdbId,
    } = event;

    if (!["Movie", "Series"].includes(itemType)) {
      return res.status(200).json({
        success: true,
        status: "skipped",
        message: "Unsupported item type",
        itemType,
      });
    }

    if (!jellyfinId) {
      return res.status(400).json({
        success: false,
        message: "Missing item ID",
      });
    }

    console.log("Received Jellyfin event:", {
      notificationType,
      itemType,
      jellyfinId,
      title,
      tmdbId,
      tvdbId,
    });

    let requesters;

    if (itemType === "Movie") {
      if (!tmdbId) {
        return res.status(400).json({
          success: false,
          message: "Movie is missing a TMDB ID",
        });
      }

      requesters = await getRadarrRequesters(tmdbId);
    } else if (!tvdbId) {
      return res.status(400).json({
        success: false,
        message: "Series is missing a TVDB ID",
      });
    } else {
      requesters = await getSonarrRequesters(tvdbId);
    }

    const result = await syncRequesterTags({
      jellyfinId,
      title,
      itemType,
      requesters,
    });

    console.log("Jellyfin tag sync:", {
      status: result.status,
      itemType,
      title,
      added: result.added || [],
    });

    return res.status(200).json(result);
  } catch (error) {
    if (error instanceof SyntaxError) {
      return res.status(400).json({
        success: false,
        message: "Invalid webhook payload",
      });
    }

    if (error instanceof NotFoundError) {
      return res.status(404).json({
        success: false,
        message: error.message,
      });
    }

    console.error("Webhook error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to process Jellyfin webhook",
    });
  }
});

module.exports = router;
