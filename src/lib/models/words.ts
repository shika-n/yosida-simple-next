import { getDatabase } from "../db";
import { getGlossariesOf, Glossary } from "./glossary";

export interface Word {
	id: number;
	kanji: string;
	reading: string;
}

export function getWordById(id: number): Word | undefined {
	const db = getDatabase();
	return db
		.prepare<unknown[], Word>("SELECT * FROM words where id = :id LIMIT 1")
		.get({ id });
}

export function getRandomWord(): Word | undefined {
	const db = getDatabase();
	return db
		.prepare<
			unknown[],
			Word
		>("SELECT * FROM words ORDER BY RANDOM() LIMIT 1")
		.get();
}
