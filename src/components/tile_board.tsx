"use client";

import { use, useContext, useEffect } from "react";
import CharTile from "./char_tile";
import { Word } from "@/lib/models/words";
import { Glossary } from "@/lib/models/glossary";
import {
	GuessContext,
	GuessData,
	ProviderPair,
} from "@/lib/contexts/guess_context";
import { kanaMap } from "@/lib/kana_map";

function keyHandler(e: KeyboardEvent, guessContext: ProviderPair<GuessData>) {
	if (["Backspace", " ", "Enter"].includes(e.key)) {
		e.preventDefault();
	}
	if (e.key === "Backspace") {
		guessContext?.setState((prev) => {
			if (prev.typing.length === 0) {
				return {
					...prev,
					index: Math.max(0, prev.index - 1),
					tiles: prev.tiles.map((val, i) =>
						i === prev.index - 1 ? { text: "" } : val,
					),
				};
			} else {
				const currentTyping = prev.typing;
				const newTyping = currentTyping.substring(
					0,
					currentTyping.length - 1,
				);
				console.log(currentTyping, newTyping);
				return {
					...prev,
					tiles: prev.tiles.map((val, i) =>
						i === prev.index ? { text: newTyping } : val,
					),
					typing: newTyping,
				};
			}
		});
		return;
	} else if (e.key === "Enter") {
	} else {
		guessContext?.setState((prev) => {
			let currentTyping = prev.typing + e.key;
			if (!isConversible(currentTyping)) {
				currentTyping = "";
			}
			return {
				...prev,
				tiles: prev.tiles.map((val, i) =>
					i === prev.index ? { text: currentTyping } : val,
				),
				typing: currentTyping,
			};
		});
	}
}

function isConversible(str: string) {
	return (
		kanaMap.keys().some((key) => key.startsWith(str)) ||
		(str.length === 2 && str[0] === str[1])
	);
}

function getKanaConversion(typed: string): string | null {
	return kanaMap.get(typed) ?? null;
}

function handleKanaConversion(guessContext: ProviderPair<GuessData>) {
	const currentTyping = guessContext!.state.typing;
	const kana = getKanaConversion(currentTyping);
	if (kana) {
		guessContext?.setState((prev) => ({
			...prev,
			typing: "",
			tiles: prev.tiles.map((val, i) =>
				i === prev.index ? { text: kana } : val,
			),
			index: Math.min(prev.tiles.length - 1, prev.index + 1),
		}));
	} else {
		const isPossible = isConversible(currentTyping);
		if (
			currentTyping.length === 2 &&
			currentTyping[0] === currentTyping[1]
		) {
			guessContext?.setState((prev) => ({
				...prev,
				tiles: prev.tiles.map((val, i) =>
					i === prev.index ? { text: "っ" } : val,
				),
				index: Math.min(prev.tiles.length - 1, prev.index + 1),
				typing: currentTyping[0],
			}));
		} else if (!isPossible) {
			console.log(
				"Conversion not possible for",
				guessContext?.state.typing,
			);
			guessContext?.setState((prev) => ({
				...prev,
				typing: "",
			}));
		}
	}
}

export default function TileBoard({
	dataPromise,
}: {
	dataPromise: Promise<any>;
}) {
	const data: { word: Word; glossaries: Glossary[] } = use(dataPromise);

	if (!data) {
		return <>No word</>;
	}

	const guessContext = useContext(GuessContext);

	useEffect(() => {
		document.addEventListener("keydown", (e) =>
			keyHandler(e, guessContext!),
		);
	}, []);

	useEffect(
		() => handleKanaConversion(guessContext!),
		[guessContext?.state.typing],
	);

	return (
		<div className="m-auto flex max-w-3xl flex-col gap-4 rounded-lg bg-(--primary-4) p-4">
			<div className="m-auto grid w-fit grid-cols-5 gap-2">
				{guessContext?.state.tiles.map((value, i) => {
					return (
						<CharTile
							key={i}
							className={
								i === guessContext.state.index
									? "border-2 border-(--secondary)"
									: ""
							}
						>
							{value.text}
						</CharTile>
					);
				})}
			</div>
			<input
				type="text"
				className="rounded-md border-2 border-(--primary-5) bg-black/20 px-4 py-1 text-center text-2xl"
			/>
			<button>Hint! (0/{data.glossaries.length})</button>
			Glossary:
			<ul>
				{data.glossaries.map((glossary) => {
					return <li key={glossary.id}>{glossary.meaning}</li>;
				})}
			</ul>
		</div>
	);
}

export function TileBoardFallback() {
	const tiles = [0, 1, 2, 3, 4];
	tiles.push(...[0, 1, 2, 3, 4]);
	tiles.push(...[0, 1, 2, 3, 4]);
	tiles.push(...[0, 1, 2, 3, 4]);
	tiles.push(...[0, 1, 2, 3, 4]);

	return (
		<div className="m-auto max-w-3xl rounded-lg bg-(--primary-4) p-4">
			<div className="m-auto grid w-fit grid-cols-5 gap-2">
				{tiles.map((_, i) => {
					return <CharTile key={i}></CharTile>;
				})}
			</div>
		</div>
	);
}
