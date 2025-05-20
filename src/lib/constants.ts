import { Database } from "../../database.types";

type TableName = keyof Database["public"]["Tables"];

export const CLIENTS_PER_PAGE = 10;
export const TABLE_NAME: TableName =
  (process.env.CLIENTS_TABLE as TableName) || "users";
export const COFFEES_TO_EXCHANGE = 9;
