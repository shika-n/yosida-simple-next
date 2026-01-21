import { getGlossariesOf } from "@/lib/models/glossary";
import { getRandomWord } from "@/lib/models/words";

export async function GET() {
	const word = getRandomWord();
	if (!word) {
		return Response.json(
			{ message: "This shouldn't happen. Is the database empty?" },
			{ status: 500 },
		);
	}

	const glossaries = getGlossariesOf(word);

	return Response.json({ word, glossaries });
}
