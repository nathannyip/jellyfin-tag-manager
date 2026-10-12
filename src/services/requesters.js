const PREFIXED_TAG = /^\d+-(.+)$/;

function normalizeTagLabel(label) {
  const trimmed = String(label || "").trim();
  const match = PREFIXED_TAG.exec(trimmed);
  return match ? match[1] : trimmed;
}

function requesterNamesFromTags(tagIds, tagDefinitions) {
  const tagMap = new Map(
    tagDefinitions.map((tag) => [String(tag.id), tag.label])
  );

  const names = (tagIds || [])
    .map((tagId) => normalizeTagLabel(tagMap.get(String(tagId))))
    .filter(Boolean);

  return [...new Set(names)];
}

function mergeTags(existingTags, incomingTags) {
  const existing = existingTags || [];
  const present = new Set(existing.map(normalizeTagLabel).filter(Boolean));
  const added = [];

  for (const tag of incomingTags || []) {
    const name = normalizeTagLabel(tag);
    if (!name || present.has(name)) {
      continue;
    }

    present.add(name);
    added.push(name);
  }

  return {
    added,
    newTags: [...existing, ...added],
    needsUpdate: added.length > 0,
  };
}

module.exports = { requesterNamesFromTags, mergeTags };
