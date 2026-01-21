"use client";

import { use, useContext, useEffect } from "react";
import CharTile from "./char_tile";
import { Word } from "@/lib/models/words";
import { Glossary } from "@/lib/models/glossary";
import { GuessContext, GuessData, ProviderPair } from "@/lib/contexts/guess_context";
import { kanaMap } from "@/lib/kana_map";

function keyHandler(e: KeyboardEvent, guessContext: ProviderPair<GuessData>) {
	if (["Backspace", " ", "Enter"].includes(e.key)) {
		e.preventDefault();
	}
	if (e.key === "Backspace") {
		guessContext?.setState((prev) => {
			return {
				...prev,
				index: prev.index - 1
			}
		});
		return
	} else if (e.key === "Enter") {

	} else {
		guessContext?.setState((prev) => {
			return {
				...prev,
				index: prev.index + 1,
				typing: prev.typing + e.key,
			}
		});
	}
}

function getKanaConversion(typed: string): string | null {
	return kanaMap.get(typed) ?? null;
}

export default function TileBoard({
	dataPromise,
}: {
	dataPromise: Promise<any>;
}) {
	const data: { word: Word, glossaries: Glossary[] } = use(dataPromise);

	if (!data) {
		return <>No word</>
	}

	const guessContext = useContext(GuessContext);

	useEffect(() => {
		document.addEventListener("keydown", (e) => keyHandler(e, guessContext!))
	}, [])

	useEffect(() => {
		const kana = getKanaConversion(guessContext!.state.typing);
		if (kana) {
			console.log(kana)
			guessContext?.setState((prev) => ({
				...prev,
				typing: "",
			}))
		} else {
			const isPossible = kanaMap.keys().some((key) => key.startsWith(guessContext!.state.typing))
			if (!isPossible) {
				console.log("Conversion not possible for", guessContext?.state.typing)
				guessContext?.setState((prev) => ({
					...prev,
					typing: "",
				}))
			}
		}
	}, [guessContext?.state.typing])

	const tiles = [0, 1, 2, 3, 4];
	tiles.push(...[0, 1, 2, 3, 4]);
	tiles.push(...[0, 1, 2, 3, 4]);
	tiles.push(...[0, 1, 2, 3, 4]);
	tiles.push(...[0, 1, 2, 3, 4]);

	return (
		<div className="flex flex-col gap-4 p-4 max-w-3xl m-auto rounded-lg bg-(--primary-4)" >
			<div className="m-auto grid grid-cols-5 gap-2 w-fit">
				{data.word.reading.split("").map((value, i) => {
					return <CharTile key={i}>{value}</CharTile>;
				})}
				{data.word.reading.split("").map((value, i) => {
					return <CharTile key={i}>{value}</CharTile>;
				})}
				{data.word.reading.split("").map((value, i) => {
					return <CharTile key={i}>{value}</CharTile>;
				})}
				{data.word.reading.split("").map((value, i) => {
					return <CharTile key={i}>{value}</CharTile>;
				})}
				{data.word.reading.split("").map((value, i) => {
					return <CharTile key={i}>{value}</CharTile>;
				})}
				{data.word.reading.split("").map((value, i) => {
					return <CharTile key={i}>{value}</CharTile>;
				})}
			</div>
			<input
				type="text"
				className="px-4 py-1 text-center text-2xl border-2 border-(--primary-5) rounded-md bg-black/20"
			/>
			<button>Hint! (0/{data.glossaries.length})</button>
			Glossary:
			<ul>
				{data.glossaries.map((glossary) => {
					return <li key={glossary.id}>{glossary.meaning}</li>;
				})}
			</ul>
		</div >
	);
}

export function TileBoardFallback() {
	const tiles = [0, 1, 2, 3, 4];
	tiles.push(...[0, 1, 2, 3, 4]);
	tiles.push(...[0, 1, 2, 3, 4]);
	tiles.push(...[0, 1, 2, 3, 4]);
	tiles.push(...[0, 1, 2, 3, 4]);

	return (
		<div className="p-4 max-w-3xl m-auto rounded-lg bg-(--primary-4)">
			<div className="m-auto grid grid-cols-5 gap-2 w-fit">
				{tiles.map((_, i) => {
					return <CharTile key={i}></CharTile>;
				})}
			</div>
		</div>
	);
}
