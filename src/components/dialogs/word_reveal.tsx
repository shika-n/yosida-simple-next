import { Glossary } from "@/lib/models/glossary";
import { Word } from "@/lib/models/words";
import { Dispatch, SetStateAction, useEffect, useState } from "react";

async function fetchWordData(
	setData: Dispatch<
		SetStateAction<{ word: Word; glossaries: Glossary[] } | null>
	>,
	wordId: number,
) {
	try {
		const res = await fetch("http://localhost:3000/api/word/" + wordId);
		if (res.status !== 200) {
			return;
		}
		const json = await res.json();
		setData(json);
	} catch (e) {
		return;
	}
}

export default function WordReveal({ wordId }: { wordId: number }) {
	const [data, setData] = useState<{
		word: Word;
		glossaries: Glossary[];
	} | null>(null);

	useEffect(() => {
		fetchWordData(setData, wordId);
	}, [wordId]);

	return (
		<div className="flex flex-col items-center gap-1">
			<h3 className="text-2xl font-bold">{data?.word.kanji}</h3>
			<h3>{data?.word.reading}</h3>
			<ol>
				{data?.glossaries.map((glossary) => {
					return (
						<li
							key={glossary.id}
							className="list-inside list-decimal"
						>
							{glossary.meaning.charAt(0).toUpperCase() +
								glossary.meaning.substring(1)}
						</li>
					);
				})}
			</ol>
		</div>
	);
}
