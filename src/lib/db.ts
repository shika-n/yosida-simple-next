import Database from "better-sqlite3";

const db = new Database("dict.db");

export function getDatabase() {
	return db;
}
