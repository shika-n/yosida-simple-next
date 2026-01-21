import { getGlossariesOf } from "@/lib/models/glossary";
import { getRandomWord } from "@/lib/models/words";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
	const params = request.nextUrl.searchParams;

	const word = getRandomWord(params.get("common") ? true : false);
	if (!word) {
		return NextResponse.json(
			{ message: "This shouldn't happen. Is the database empty?" },
			{ status: 500 },
		);
	}

	const glossaries = getGlossariesOf(word);

	return NextResponse.json({ word, glossaries });
}
