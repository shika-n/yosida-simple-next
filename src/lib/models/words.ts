import { getDatabase } from "../db";

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

export function getRandomWord(isCommon?: boolean): Word | undefined {
	const db = getDatabase();

	let whereCluse = "";

	if (isCommon) {
		whereCluse = " WHERE is_common = TRUE";
	}

	return db
		.prepare<
			unknown[],
			Word
		>("SELECT * FROM words " + whereCluse + " ORDER BY RANDOM() LIMIT 1")
		.get();
}
