import { getDatabase } from "../db";
import { Word } from "./words";

export interface Glossary {
	id: number;
	meaning: string;
}

export function getGlossariesByWordId(id: number): Glossary[] {
	const db = getDatabase();
	return db
		.prepare<
			unknown[],
			Glossary
		>("SELECT id, meaning FROM glossaries g WHERE word_id = :word_id")
		.all({ word_id: id });
}

export function getGlossariesOf(word: Word): Glossary[] {
	return getGlossariesByWordId(word.id);
}
