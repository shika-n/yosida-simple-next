import { randomUUID } from "crypto";
import { getRandomWord, getWordById, Word } from "./models/words";

let currentWordId: number = 0;
let currentUuid: string = "";

export function newWord() {
	const isCommon = true;
	currentWordId = getRandomWord(isCommon)?.id ?? 0;
	currentUuid = randomUUID();
}

export function getCurrentWord(): Word {
	if (currentWordId <= 0) {
		newWord();
	}
	return getWordById(currentWordId)!;
}

export function getCurrentUuid(): string {
	if (currentUuid.trim().length === 0) {
		newWord();
	}
	return currentUuid;
}
