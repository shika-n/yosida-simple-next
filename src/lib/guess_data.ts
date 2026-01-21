import { randomUUID } from "crypto";
import { getRandomWord, Word } from "./models/words";

let currentWord: Word | null;
let currentUuid: string | null;

export function newWord() {
	const isCommon = true;
	currentWord = getRandomWord(isCommon) ?? null;
	currentUuid = randomUUID();
}

export function getCurrentWord() {
	if (!currentWord) {
		newWord();
	}

	return currentWord;
}

export function getCurrentUuid() {
	if (!currentUuid) {
		newWord();
	}
	return currentUuid;
}
