"use client";

import { Attempt } from "@/lib/models/attempts";
import { Glossary } from "@/lib/models/glossary";
import { Word } from "@/lib/models/words";
import { Dispatch, SetStateAction, useState } from "react";

async function fetchGlossaries(
	setGlossaries: Dispatch<SetStateAction<Glossary[] | null>>,
	word: Word,
) {
	try {
		const res = await fetch("http://localhost:3000/api/word/" + word.id);
		if (res.status !== 200) {
			setGlossaries([]);
			return;
		}
		const json = await res.json();
		setGlossaries(json.glossaries);
	} catch (e) {
		setGlossaries([]);
	}
}

export default function ExploreEntry({
	word,
	className,
}: {
	word: Word;
	className: string;
}) {
	const [showDetails, setShowDetails] = useState<boolean>(false);
	const [glossaries, setGlossaries] = useState<Glossary[] | null>(null);

	const successAttempts = word.successes ?? 0;
	const totalAttempts = successAttempts + (word.fails ?? 0);
	let successRatio =
		Math.floor((successAttempts * 10000.0) / totalAttempts) / 100.0;

	if (isNaN(successRatio)) {
		successRatio = 0;
	}

	return (
		<div
			onClick={() => {
				if (!glossaries) {
					fetchGlossaries(setGlossaries, word);
				}
				setShowDetails((prev) => !prev);
			}}
			className={[
				"px-4 py-2 ring-1 ring-transparent transition-all hover:ring-(--secondary)",
				className,
			].join(" ")}
		>
			<div className="grid w-full grid-cols-4 gap-4">
				<span className="border-r-2">{word.kanji}</span>
				<span className="border-r-2">{word.reading}</span>
				<span className="border-r-2">{successRatio}%</span>
				<span>{word.is_common ? "Yes" : "No"}</span>
			</div>
			{showDetails ? (
				<div
					className="my-2 flex flex-col gap-1 rounded-sm bg-(--secondary)/15 px-4 py-2"
					onClick={(e) => e.stopPropagation()}
				>
					{glossaries?.map((glossary, i) => {
						return (
							<div
								key={i}
								className="grid"
								style={{
									gridTemplateColumns:
										"minmax(min-content, 2em) 1fr",
								}}
							>
								<span className="mr-2">{i + 1}.</span>
								<span>
									{glossary.meaning.charAt(0).toUpperCase() +
										glossary.meaning.substring(1)}
								</span>
							</div>
						);
					}) ?? "Loading..."}
				</div>
			) : (
				<></>
			)}
		</div>
	);
}
