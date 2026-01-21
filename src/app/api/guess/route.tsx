import { getCurrentWord } from "@/lib/guess_data";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
	const body = await request.json();

	const guess = body.word;
	const currentWord = getCurrentWord();

	if (!currentWord) {
		return NextResponse.json(
			{ message: "Shouldn't happen. There is no current word!" },
			{ status: 500 },
		);
	}

	let result: string = "";
	for (let i = 0; i < currentWord.reading.length; ++i) {
		if (guess[i] === currentWord.reading[i]) {
			result += 1;
		} else if (currentWord.reading.includes(guess[i])) {
			result += 2;
		} else {
			result += 3;
		}
	}

	return NextResponse.json({ message: result });
}
