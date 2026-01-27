import { getCurrentWord } from "@/lib/guess_data";
import { kataToHiraMap } from "@/lib/kana_map";
import { getWordById } from "@/lib/models/words";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
	const body = await request.json();

	const guess = body.guess;
	const wordId = Number(body.word_id);
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

	return NextResponse.json({ result: result });
}
