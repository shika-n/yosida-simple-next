import { Attempt } from "@/lib/models/attempts";
import { Glossary } from "@/lib/models/glossary";
import { Word } from "@/lib/models/words";
import { Dispatch, SetStateAction, useEffect, useState } from "react";

async function fetchWordData(
	setData: Dispatch<
		SetStateAction<{
			word: Word;
			glossaries: Glossary[];
		} | null>
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

	const successAttempts = data?.word.successes ?? 0;
	const totalAttempts = successAttempts + (data?.word.fails ?? 0);
	let successRatio =
		Math.floor((successAttempts * 10000.0) / totalAttempts) / 100.0;

	if (isNaN(successRatio)) {
		successRatio = 0;
	}

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
			<div className="grid grid-cols-3 gap-x-4 rounded-sm border bg-(--primary-3) px-2 py-1 text-center">
				<span>勝利数</span>
				<span>総合数</span>
				<span>勝利率</span>
				<span>{successAttempts}</span>
				<span>{totalAttempts}</span>
				<span>{successRatio}%</span>
			</div>
		</div>
	);
}
