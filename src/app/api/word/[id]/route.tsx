import { getCurrentWord } from "@/lib/guess_data";
import { getGlossariesOf } from "@/lib/models/glossary";
import { getWordById } from "@/lib/models/words";
import { NextResponse } from "next/server";

export async function GET(
	_: Request,
	{ params }: { params: Promise<{ id: number }> },
) {
	const { id } = await params;

	let word = getWordById(Number(id));

	if (Number(id) === 0) {
		word = getCurrentWord()!;
	}

	if (!word) {
		return NextResponse.json(
			{ message: "Word not found" },
			{ status: 404 },
		);
	}

	const glossaries = getGlossariesOf(word);

	return NextResponse.json({ word, glossaries });
}
