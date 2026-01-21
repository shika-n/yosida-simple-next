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

export const BOARD_WIDTH = 5;

function isConversible(str: string) {
	return (
		kanaMap.keys().some((key) => key.startsWith(str)) ||
		(str.length === 2 && str[0] === str[1])
	);
}

function getKanaConversion(typed: string): string[] | null {
	return kanaMap.get(typed)?.split("") ?? null;
}

function keyHandler(e: KeyboardEvent, guessContext: ProviderPair<GuessData>) {
	if (["Backspace", " ", "Enter"].includes(e.key)) {
		e.preventDefault();
	}
	if (e.key === "Backspace") {
		guessContext?.setState((prev) => {
			if (prev.typing.length === 0) {
				let targetIndex = prev.index;

				if (
					prev.typing.length === 0 &&
					prev.tiles[prev.index].text.length === 0
				) {
					targetIndex = Math.max(prev.offset, prev.index - 1);
				}

				return {
					...prev,
					index: targetIndex,
					tiles: prev.tiles.map((val, i) =>
						i === targetIndex ? { text: "" } : val,
					),
				};
			} else {
				// Delete a char in current tile
				const currentTyping = prev.typing;
				const newTyping = currentTyping.substring(
					0,
					currentTyping.length - 1,
				);
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
		// Since we can't get state from a native event handler
		// we use setState to get the previous state and return it unmodified
		// Help me.
		guessContext.setState((prev) => {
			if (prev.typing.length > 0) {
				return prev;
			}

			let nonEmptyTileCount = 0;
			const word = prev.tiles
				.map((val, i) => {
					if (i >= prev.offset && i < prev.offset + BOARD_WIDTH) {
						if (val.text.length > 0) {
							nonEmptyTileCount++;
							return val.text;
						}
					}
					return "";
				})
				.join("");

			if (nonEmptyTileCount === BOARD_WIDTH) {
				console.log("Should submit", word);
			}

			return prev;
		});
	} else {
		guessContext?.setState((prev) => {
			// Add char, empty tile if invalid
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

function handleKanaConversion(guessContext: ProviderPair<GuessData>) {
	const currentTyping = guessContext!.state.typing;
	const kana = getKanaConversion(currentTyping);
	if (kana && kana.length > 0) {
		// Convert to kana and advance index
		guessContext?.setState((prev) => ({
			...prev,
			typing: "",
			tiles: prev.tiles.map((val, i) => {
				if (i === prev.index) {
					return { text: kana[0] };
				} else if (
					kana.length > 1 &&
					i === prev.index + 1 &&
					prev.index + 1 < prev.offset + BOARD_WIDTH
				) {
					return { text: kana[1] };
				}

				return val;
			}),
			index: Math.min(
				prev.offset + BOARD_WIDTH - 1,
				prev.index + kana.length,
			),
		}));
	} else {
		const isPossible = isConversible(currentTyping);
		if (
			currentTyping.length === 2 &&
			currentTyping[0] === currentTyping[1]
		) {
			// Handle small tsu with double consonant
			guessContext?.setState((prev) => ({
				...prev,
				tiles: prev.tiles.map((val, i) =>
					i === prev.index ? { text: "っ" } : val,
				),
				index: Math.min(prev.offset + BOARD_WIDTH - 1, prev.index + 1),
				typing: currentTyping[0],
			}));
		} else if (!isPossible) {
			// Delete if not possible to convert
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
		<div className="m-auto flex max-w-3xl flex-col items-center gap-4 rounded-lg bg-(--primary-4) p-4">
			<div
				className="m-auto grid w-fit gap-2"
				style={{
					gridTemplateColumns: "repeat(" + BOARD_WIDTH + ", 1fr)",
				}}
			>
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
			<button className="w-fit rounded-md border-2 border-transparent bg-(--primary-3) px-4 py-2 transition-all hover:border-(--secondary) active:bg-(--primary-4)">
				Request Meaning ({guessContext?.state.revealedGlossaryCount}/
				{data.glossaries.length})
			</button>
			Glossary:
			<ul>
				{guessContext?.state.revealedGlossaries.map((glossary) => {
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
