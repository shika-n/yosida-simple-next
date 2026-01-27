import { getCurrentWord } from "@/lib/guess_data";
import {
	getGlossariesByWordId,
	getGlossariesOf,
	Glossary,
} from "@/lib/models/glossary";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
	req: NextRequest,
	{ params }: { params: Promise<{ id: number }> },
) {
	const { id }: { id: number } = await params;

	const offset = Number(req.nextUrl.searchParams.get("index"));

	let glossaries: Glossary[] = [];

	// Type is not enough, need to cast
	if (Number(id) === 0) {
		const currentWord = getCurrentWord();
		if (currentWord) {
			glossaries = getGlossariesOf(currentWord);
		}
	} else {
		glossaries = getGlossariesByWordId(id);
	}

	if (offset < 0 || offset >= glossaries.length) {
		return NextResponse.json({ length: glossaries.length });
	}
	return NextResponse.json({
		glossary: glossaries[offset],
		length: glossaries.length,
	});
}
