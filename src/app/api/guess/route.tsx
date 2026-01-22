import { getCurrentWord } from "@/lib/guess_data";
import { getWordById } from "@/lib/models/words";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
	const body = await request.json();

	const guess = body.guess;
	const wordId = Number(body.word_id);
	const targetWord = wordId === 0 ? getCurrentWord() : getWordById(wordId);

	if (!targetWord) {
		return NextResponse.json(
			{ message: "Shouldn't happen. There is no current word!" },
			{ status: 500 },
		);
	}

	console.log("Targetting:", targetWord);

	let result: string = "";
	for (let i = 0; i < targetWord.reading.length; ++i) {
		if (guess[i] === targetWord.reading[i]) {
			result += 1;
		} else if (targetWord.reading.includes(guess[i])) {
			result += 2;
		} else {
			result += 3;
		}
	}

	return NextResponse.json({ result: result });
}
