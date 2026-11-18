const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// Postgres throws on a malformed uuid, so check ids that come from the browser before querying.
export const isUuid = (value: unknown): value is string =>
  typeof value === "string" && UUID.test(value);
