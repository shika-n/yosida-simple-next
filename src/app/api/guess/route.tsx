import { getCurrentWord } from "@/lib/guess_data";
import { kataToHiraMap } from "@/lib/kana_map";
import { getWordById, updateSucessesAndFails } from "@/lib/models/words";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
	const body = await request.json();

	const guess = body.guess;
	const wordId = Number(body.word_id);
	const nthAttempt = Number(body.nth) + 1;
	const targetWord = wordId === 0 ? getCurrentWord() : getWordById(wordId);

	if (!targetWord) {
		return NextResponse.json(
			{ message: "Word not found!" },
			{ status: 404 },
		);
	}

	const targetReading = targetWord?.reading
		.split("")
		.map((char) => kataToHiraMap.get(char) ?? char)
		.join("");

	let result: string = "";
	for (let i = 0; i < targetReading.length; ++i) {
		if (guess[i] === targetReading[i]) {
			result += 1;
		} else if (targetReading.includes(guess[i])) {
			result += 2;
		} else {
			result += 3;
		}
	}

	if (result === "11111") {
		updateSucessesAndFails(targetWord.id, true, nthAttempt);
	} else if (nthAttempt === 6) {
		updateSucessesAndFails(targetWord.id, false, nthAttempt);
	}

	return NextResponse.json({ result: result });
}
