import { getDatabase } from "../db";
import { hiraToKataMap } from "../kana_map";
import { isAscii } from "buffer";
import { insertAttemptEntry } from "./attempts";

export interface Word {
	id: number;
	kanji: string;
	reading: string;
	is_common: number;
	successes: number;
	fails: number;
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

export function getWordsLike(str: string, index?: number): Word[] | undefined {
	if (str.trim().length === 0) {
		return [];
	}

	index = Number(index) ?? 0;
	const db = getDatabase();

	if (isAscii(Buffer.from(str))) {
		return db
			.prepare<unknown[], Word>(
				`
			SELECT DISTINCT w.*
			FROM words w
			LEFT OUTER JOIN glossaries g ON w.id = g.word_id
			WHERE meaning LIKE :meaning
			ORDER BY is_common DESC
			LIMIT 10
			OFFSET :offset
		`,
			)
			.all({
				meaning: "%" + str + "%",
				offset: index * 10,
			});
	}

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
			OFFSET :offset
		`,
		)
		.all({
			kataReading: "%" + katakana + "%",
			hiraReading: "%" + str + "%",
			kanji: "%" + str + "%",
			offset: index * 10,
		});
}

export function updateSucessesAndFails(
	wordId: number,
	isSuccessAttempt: boolean,
	nth: number,
) {
	const db = getDatabase();
	if (isSuccessAttempt) {
		db.prepare(
			"UPDATE words SET successes = successes + 1 WHERE id = :wordId",
		).run({ wordId });
		insertAttemptEntry(wordId, nth);
	} else {
		db.prepare("UPDATE words SET fails = fails + 1 WHERE id = :wordId").run(
			{ wordId },
		);
	}
}
