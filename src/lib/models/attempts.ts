import { getDatabase } from "../db";

export interface Attempt {
	id: number;
	word_id: number;
	success_at_nth: number;
}

export interface AttemptBins {
	bin: number;
	count: number;
}

export function insertAttemptEntry(wordId: number, nth: number) {
	const db = getDatabase();

	db.prepare(
		"INSERT INTO attempts (word_id, success_at_nth) VALUES (:wordId, :nth)",
	).run({ wordId, nth });
}

export function getAttemptsData(wordId: number): AttemptBins[] {
	const db = getDatabase();

	const res = db
		.prepare<unknown[], AttemptBins>(
			`
			WITH bins (bin) AS (
				VALUES (1), (2), (3), (4), (5), (6), (7), (8)
			)
			SELECT
				bin,
				COUNT(id) as count
			FROM bins b
			LEFT OUTER JOIN (SELECT * FROM attempts WHERE word_id = :wordId) a
				ON b.bin = a.success_at_nth
			GROUP BY bin
		`,
		)
		.all({ wordId });

	return res;
}
