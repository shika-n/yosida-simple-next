"use client";

import { use, useContext, useEffect } from "react";
import CharTile from "./char_tile";
import { Word } from "@/lib/models/words";
import { Glossary } from "@/lib/models/glossary";
import {
	GuessContext,
	GuessData,
	ProviderPair,
	TileStatus,
} from "@/lib/contexts/guess_context";
import { kanaMap } from "@/lib/kana_map";
import { text } from "stream/consumers";
import MainContainer from "./main_container";
import Button from "./clickables/button";

export const BOARD_WIDTH = 5;
const LOCAL_STORAGE_KEY = "guess_state";

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
						i === targetIndex ? { ...val, text: "" } : val,
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
						i === prev.index ? { ...val, text: newTyping } : val,
					),
					typing: newTyping,
				};
			}
		});
		return;
	} else if (e.key === "Enter") {
		// Since we can't get context state from a native event handler
		// we use setState to signal when we press enter to request submission
		// and handle it with useEffect
		guessContext.setState((prev) => {
			return {
				...prev,
				requestSubmit: true,
			};
		});
	} else if (e.key.length === 1) {
		guessContext?.setState((prev) => {
			// Add char, empty tile if invalid
			let currentTyping = prev.typing + e.key;
			if (!isConversible(currentTyping)) {
				currentTyping = "";
			}
			return {
				...prev,
				tiles: prev.tiles.map((val, i) =>
					i === prev.index ? { ...val, text: currentTyping } : val,
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
					return { ...val, text: kana[0] };
				} else if (
					kana.length > 1 &&
					i === prev.index + 1 &&
					prev.index + 1 < prev.offset + BOARD_WIDTH
				) {
					return { ...val, text: kana[1] };
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
					i === prev.index ? { ...val, text: "っ" } : val,
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

async function handleSubmission(
	guessContext: ProviderPair<GuessData>,
	word: string,
) {
	const res = await fetch("http://localhost:3000/api/guess", {
		method: "POST",
		body: JSON.stringify({
			word,
		}),
	});
	if (res.status !== 200) {
		return;
	}

	const json = await res.json();

	const guessResult = json.message;

	guessContext.setState((prev) => {
		const newState = {
			...prev,
			tiles: prev.tiles.map((val, i) => {
				if (i >= prev.offset && i < prev.offset + BOARD_WIDTH) {
					const relativeIndex = i - prev.offset;
					return {
						...val,
						status: Number(guessResult[relativeIndex]),
					};
				}
				return val;
			}),
			offset: prev.offset + BOARD_WIDTH,
			index: prev.offset + BOARD_WIDTH,
		};

		localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(newState));

		return newState;
	});
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

		const jsonValue = localStorage.getItem(LOCAL_STORAGE_KEY);
		if (jsonValue) {
			const storedState = JSON.parse(jsonValue);
			guessContext?.setState(() => ({
				...storedState,
			}));
		}
	}, []);

	useEffect(
		() => handleKanaConversion(guessContext!),
		[guessContext?.state.typing],
	);

	useEffect(() => {
		const state = guessContext?.state;
		if (!state || !state.requestSubmit) {
			return;
		}

		guessContext.setState((prev) => ({
			...prev,
			requestSubmit: false,
		}));

		if (
			state.typing.length > 0 ||
			state.index < state.offset + BOARD_WIDTH - 1
		) {
			return;
		}

		let nonEmptyTileCount = 0;
		const word = state.tiles
			.map((val, i) => {
				if (i >= state.offset && i < state.offset + BOARD_WIDTH) {
					if (val.text.length > 0) {
						nonEmptyTileCount++;
						return val.text;
					}
				}
				return "";
			})
			.join("");

		if (nonEmptyTileCount === BOARD_WIDTH) {
			handleSubmission(guessContext, word);
		}
	}, [guessContext?.state.requestSubmit]);

	return (
		<MainContainer>
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
							tile={value}
							className={
								i === guessContext.state.index
									? "border-2 border-(--secondary)"
									: ""
							}
						/>
					);
				})}
			</div>
			<Button>
				Request Meaning ({guessContext?.state.revealedGlossaryCount}/
				{data.glossaries.length})
			</Button>
			Glossary:
			<ul>
				{guessContext?.state.revealedGlossaries.map((glossary) => {
					return <li key={glossary.id}>{glossary.meaning}</li>;
				})}
			</ul>
		</MainContainer>
	);
}

export function TileBoardFallback() {
	const tiles = Array.from({ length: BOARD_WIDTH * 6 }, () => 0);

	return (
		<div className="m-auto flex max-w-3xl flex-col items-center gap-4 rounded-lg bg-(--primary-4) p-4">
			<div
				className="m-auto grid w-fit gap-2"
				style={{
					gridTemplateColumns: "repeat(" + BOARD_WIDTH + ", 1fr)",
				}}
			>
				{tiles.map((_, i) => {
					return (
						<span className="flex size-16 animate-pulse items-center justify-center rounded-lg bg-(--primary-3) text-4xl font-bold select-none"></span>
					);
				})}
			</div>
			<button className="w-fit animate-pulse rounded-md border-2 border-transparent bg-(--primary-3) px-4 py-2">
				Request Meaning (?/?)
			</button>
			Glossary:
			<span></span>
		</div>
	);
}
