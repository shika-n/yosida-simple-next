"use client";

import { use, useContext, useEffect, useState } from "react";
import CharTile from "./char_tile";
import {
	GuessContext,
	GuessData,
	ProviderPair,
	Tile,
	TileStatus,
} from "@/lib/contexts/guess_context";
import { kanaMap } from "@/lib/kana_map";
import Button from "./clickables/button";
import test from "node:test";

export const BOARD_WIDTH = 5;
export const BOARD_HEIGHT = 6;
const LOCAL_STORAGE_KEY = "ysn_guess_state";
const LOCAL_STORAGE_KEY_RANDOM = "ysn_random_guess_state";

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
	isRandom: boolean,
) {
	const res = await fetch("http://localhost:3000/api/guess", {
		method: "POST",
		body: JSON.stringify({
			guess: word,
			word_id: isRandom ? guessContext.state.guessRandomId : 0,
		}),
	});
	if (res.status !== 200) {
		return;
	}

	const json = await res.json();

	const guessResult = json.result;

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

		localStorage.setItem(
			isRandom ? LOCAL_STORAGE_KEY_RANDOM : LOCAL_STORAGE_KEY,
			JSON.stringify(newState),
		);

		return newState;
	});
}

async function fetchRandomWordId(): Promise<number> {
	const params = new URLSearchParams([
		["common", "1"],
		["idOnly", "1"],
	]);
	const res = await fetch("http://localhost:3000/api/word/random?" + params);

	if (res.status !== 200) {
		return 0;
	}

	const json = await res.json();
	return json.word?.id ?? 0;
}

async function newRandomWord(guessContext: ProviderPair<GuessData>) {
	const id = await fetchRandomWordId();
	guessContext?.setState((prev) => {
		const newState: GuessData = {
			...prev,
			guessRandomId: id,
		};
		localStorage.setItem(
			LOCAL_STORAGE_KEY_RANDOM,
			JSON.stringify(newState),
		);
		return newState;
	});
}

export default function TileBoard({
	isRandom = false,
}: {
	isRandom?: boolean;
}) {
	const guessContext = useContext(GuessContext);

	useEffect(() => {
		document.addEventListener("keydown", (e) =>
			keyHandler(e, guessContext!),
		);

		const jsonValue = localStorage.getItem(
			isRandom ? LOCAL_STORAGE_KEY_RANDOM : LOCAL_STORAGE_KEY,
		);
		let storedState: GuessData | null = null;
		if (jsonValue) {
			storedState = JSON.parse(jsonValue);
			guessContext?.setState(() => ({
				...storedState!,
			}));
		}

		if (isRandom && (!storedState || storedState.guessRandomId === 0)) {
			newRandomWord(guessContext!);
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
			handleSubmission(guessContext, word, isRandom);
		}
	}, [guessContext?.state.requestSubmit]);

	if (isRandom && guessContext?.state.guessRandomId === 0) {
		return <TileBoardFallback />;
	}

	return (
		<>
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
			<Button
				onClick={() => {
					guessContext?.setState((prev) => ({
						...prev,
						guessRandomId: 0,
						tiles: Array.from(
							{ length: BOARD_WIDTH * BOARD_HEIGHT },
							() => ({
								text: "",
								status: TileStatus.Undefined,
							}),
						),
						index: 0,
						offset: 0,
					}));
					newRandomWord(guessContext!);
				}}
			>
				Reset
			</Button>
			<Button>
				Request Meaning ({guessContext?.state.revealedGlossaryCount}/?)
			</Button>
			Glossary:
			<ul>
				{guessContext?.state.revealedGlossaries.map((glossary) => {
					return <li key={glossary.id}>{glossary.meaning}</li>;
				})}
			</ul>
		</>
	);
}

export function TileBoardFallback() {
	const tiles = Array.from({ length: BOARD_WIDTH * BOARD_HEIGHT }, () => 0);

	return (
		<>
			<div
				className="m-auto grid w-fit gap-2"
				style={{
					gridTemplateColumns: "repeat(" + BOARD_WIDTH + ", 1fr)",
				}}
			>
				{tiles.map((_, i) => {
					return (
						<span
							key={i}
							className="flex size-16 animate-pulse items-center justify-center rounded-lg bg-(--primary-3) text-4xl font-bold select-none"
						></span>
					);
				})}
			</div>
			<button className="w-fit animate-pulse rounded-md border-2 border-transparent bg-(--primary-3) px-4 py-2">
				Request Meaning (?/?)
			</button>
			Glossary:
			<span></span>
		</>
	);
}
