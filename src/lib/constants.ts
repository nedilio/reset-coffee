export const CLIENTS_PER_PAGE = 10;
// Typed as "users" (the clients table shape) even when CLIENTS_TABLE points elsewhere:
// typing it as any table name would make every query a union and break the row types.
export const TABLE_NAME = (process.env.CLIENTS_TABLE || "users") as "users";
export const COFFEES_TO_EXCHANGE = 9;
