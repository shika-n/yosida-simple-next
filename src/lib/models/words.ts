import { off } from "process";
import { getDatabase } from "../db";
import { hiraToKataMap, kataToHiraMap } from "../kana_map";

export interface Word {
	id: number;
	kanji: string;
	reading: string;
	is_common: number;
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

export function getWordsLike(str: string, offset?: number): Word[] | undefined {
	offset = offset ?? 0;
	const db = getDatabase();

	const katakana = str
		.split("")
		.map((char) => hiraToKataMap.get(char) ?? char)
		.join("");

	return db
		.prepare<unknown[], Word>(
			`
			SELECT *
			FROM words
			WHERE reading LIKE :hiraReading
				OR reading LIKE :kataReading
				OR kanji LIKE :kanji
			ORDER BY is_common DESC
			LIMIT 10
		`,
		)
		.all({
			kataReading: "%" + katakana + "%",
			hiraReading: "%" + str + "%",
			kanji: "%" + str + "%",
		});
}
