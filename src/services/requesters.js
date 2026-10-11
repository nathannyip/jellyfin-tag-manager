const REQUESTER_TAG = /^\d+-(.+)$/;

function requesterNamesFromTags(tagIds, tagDefinitions) {
  const tagMap = new Map(
    tagDefinitions.map((tag) => [String(tag.id), tag.label])
  );

  const requesters = (tagIds || [])
    .map((tagId) => tagMap.get(String(tagId)))
    .map((label) => REQUESTER_TAG.exec(label || "")?.[1])
    .filter(Boolean);

  return [...new Set(requesters)];
}

function mergeTags(existingTags, requesterTags) {
  const existing = existingTags || [];
  const requesters = requesterTags || [];
  const added = requesters.filter((requester) => !existing.includes(requester));

  return {
    added,
    newTags: [...new Set([...existing, ...requesters])],
    needsUpdate: added.length > 0,
  };
}

module.exports = { requesterNamesFromTags, mergeTags };
