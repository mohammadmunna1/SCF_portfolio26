// Shared helpers for content migrations.

const normalise = (value) => (value === undefined || value === null ? "" : JSON.stringify(value));

export const isEmpty = (value) =>
  value === undefined || value === null || value === "" || (Array.isArray(value) && value.length === 0);

/** Equal values (empty values — "", [], null, missing — count as equal). */
export const same = (a, b) => normalise(a) === normalise(b) || (isEmpty(a) && isEmpty(b));

/**
 * True when `current` lists the keys it shares with `reference` in the reference's order —
 * i.e. nobody reordered them, even if keys were added or removed since.
 */
export function followsOrder(current, reference) {
  const shared = current.filter((key) => reference.includes(key));
  const expected = reference.filter((key) => shared.includes(key));
  return shared.join() === expected.join();
}

/** Puts the listed items first (in that order) and keeps everything else after, in its current order. */
export async function applyOrder(Model, keyField, orderedKeys) {
  const docs = await Model.find({}, { [keyField]: 1, order: 1 }).sort({ order: 1, _id: 1 }).lean();
  const first = orderedKeys.map((key) => docs.find((doc) => doc[keyField] === key)).filter(Boolean);
  const firstIds = new Set(first.map((doc) => String(doc._id)));
  const ordered = [...first, ...docs.filter((doc) => !firstIds.has(String(doc._id)))];
  if (!ordered.length) return;
  await Model.bulkWrite(
    ordered.map((doc, order) => ({ updateOne: { filter: { _id: doc._id }, update: { $set: { order } } } }))
  );
}
