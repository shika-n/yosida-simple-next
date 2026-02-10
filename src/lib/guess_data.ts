import { randomUUID } from "crypto";
import { getRandomWord, getWordById, Word } from "./models/words";
import { getDatabase } from "./db";

interface CurrentData {
	id: number;
	word_id: number;
	uuid: string;
}

function queryCurrentData(): CurrentData {
	const db = getDatabase();
	const query = db.prepare<unknown[], CurrentData>(
		"SELECT * FROM current_data WHERE id = 1",
	);

	let res = query.all();
	if (res.length > 0) {
		return res[0];
	}

	newWord();
	return query.all()[0];
}

export function newWord() {
	const isCommon = true;
	const newWordId = getRandomWord(isCommon)?.id ?? 0;
	const newCurrentUuid = randomUUID();

	const db = getDatabase();
	db.prepare(
		`
		INSERT INTO current_data (id, word_id, uuid)
			VALUES (1, :wordId, :uuid)
		ON CONFLICT(id) DO
			UPDATE SET word_id = :wordId, uuid = :uuid
	`,
	).run({ wordId: newWordId, uuid: newCurrentUuid });
}

export function getCurrentWord(): Word {
	const res = queryCurrentData();
	return getWordById(res.word_id)!;
}

export function getCurrentUuid(): string {
	const res = queryCurrentData();
	return res.uuid;
}
