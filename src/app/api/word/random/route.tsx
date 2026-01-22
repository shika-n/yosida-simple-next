import { getGlossariesOf } from "@/lib/models/glossary";
import { getRandomWord } from "@/lib/models/words";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
	const params = request.nextUrl.searchParams;

	const isCommon = Number(params.get("common")) === 1;
	const isIdOnly = Number(params.get("idOnly")) === 1;

	const word = getRandomWord(isCommon);

	if (!word) {
		return NextResponse.json(
			{ message: "This shouldn't happen. Is the database empty?" },
			{ status: 500 },
		);
	}

	const glossaries = getGlossariesOf(word);

	if (isIdOnly) {
		return NextResponse.json({ word: { id: word.id } });
	}
	return NextResponse.json({ word, glossaries });
}
