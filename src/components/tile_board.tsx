"use client";

import { useContext, useEffect } from "react";
import CharTile from "./char_tile";
import {
	GuessContext,
	GuessData,
	TileStatus,
} from "@/lib/providers/guess_provider";
import { kanaMap } from "@/lib/kana_map";
import Button from "./clickables/button";
import { ProviderPair } from "@/lib/providers/provider";
import { DialogContext } from "@/lib/providers/dialog_provider";

export const BOARD_WIDTH = 5;
export const BOARD_HEIGHT = 6;
const LOCAL_STORAGE_KEY = "ysn_guess_state";
const LOCAL_STORAGE_KEY_CASUAL = "ysn_casual_guess_state";

function isConversible(str: string) {
	return (
		kanaMap.keys().some((key) => key.startsWith(str)) ||
		(str.length === 2 && str[0] === str[1])
	);
}

function getKanaConversion(typed: string): string[] | null {
	return kanaMap.get(typed)?.split("") ?? null;
}

function saveStateToLocalStorage(state: GuessData, isCasual: boolean) {
	localStorage.setItem(
		isCasual ? LOCAL_STORAGE_KEY_CASUAL : LOCAL_STORAGE_KEY,
		JSON.stringify(state),
	);
}

function reset(
	guessContext: ProviderPair<GuessData>,
	isCasual: boolean,
	uuid: string = "",
) {
	guessContext.setState((prev) => {
		const newState = {
			...prev,
			currentUuid: uuid,
			tiles: Array.from({ length: BOARD_WIDTH * BOARD_HEIGHT }, () => ({
				text: "",
				status: TileStatus.Undefined,
			})),
			index: 0,
			offset: 0,
			revealedGlossaries: [],
		};
		saveStateToLocalStorage(newState, isCasual);
		return newState;
	});
}

async function checkUuid(guessContext: ProviderPair<GuessData>, uuid: string) {
	const res = await fetch("http://localhost:3000/api/word/current_uuid");

	if (res.status !== 200) {
		reset(guessContext, false, "");
		return false;
	}

	const json: { uuid: string } = await res.json();
	const shouldReset = uuid !== json.uuid;
	if (shouldReset) {
		reset(guessContext, false, json.uuid);
	}
	return !shouldReset;
}

function keyHandler(e: KeyboardEvent, guessContext: ProviderPair<GuessData>) {
	if (["Backspace", " ", "Enter"].includes(e.key)) {
		e.preventDefault();
	}
	if (e.key === "Backspace") {
		guessContext.setState((prev) => {
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
		guessContext.setState((prev) => {
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
	const currentTyping = guessContext.state.typing;
	const kana = getKanaConversion(currentTyping);
	if (kana && kana.length > 0) {
		// Convert to kana and advance index
		guessContext.setState((prev) => ({
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
			guessContext.setState((prev) => ({
				...prev,
				tiles: prev.tiles.map((val, i) =>
					i === prev.index ? { ...val, text: "っ" } : val,
				),
				index: Math.min(prev.offset + BOARD_WIDTH - 1, prev.index + 1),
				typing: currentTyping[0],
			}));
		} else if (!isPossible) {
			// Delete if not possible to convert
			guessContext.setState((prev) => ({
				...prev,
				typing: "",
			}));
		}
	}
}

async function handleSubmission(
	guessContext: ProviderPair<GuessData>,
	word: string,
	isCasual: boolean,
) {
	if (!isCasual) {
		// TODO: Move to controller
		const isInSync = await checkUuid(
			guessContext,
			guessContext.state.currentUuid,
		);
		if (!isInSync) {
			alert("Mismatched word, resetting");
			return;
		}
	}
	const res = await fetch("http://localhost:3000/api/guess", {
		method: "POST",
		body: JSON.stringify({
			guess: word,
			word_id: isCasual ? guessContext.state.guessRandomId : 0,
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

		saveStateToLocalStorage(newState, isCasual);

		if (
			guessResult ===
			Array.from({ length: BOARD_WIDTH }, () => "1").join("")
		) {
			alert("WIN");
		} else if (newState.index >= BOARD_WIDTH * BOARD_HEIGHT) {
			alert("Lose state");
		}

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
	guessContext.setState((prev) => {
		const newState: GuessData = {
			...prev,
			guessRandomId: id,
		};
		saveStateToLocalStorage(newState, true);
		return newState;
	});
}

async function fetchGlossaries(
	guessContext: ProviderPair<GuessData>,
	isCasual: boolean,
) {
	const params = new URLSearchParams([
		["index", guessContext.state.revealedGlossaries.length.toString()],
	]);
	const res = await fetch(
		"http://localhost:3000/api/word/" +
			guessContext.state.guessRandomId +
			"/glossary?" +
			params,
	);
	if (res.status !== 200) {
		return;
	}

	const json = await res.json();
	if (!json.glossary) {
		return;
	}
	guessContext.setState((prev) => {
		const newState = {
			...prev,
			revealedGlossaries: [...prev.revealedGlossaries, json.glossary],
		};
		saveStateToLocalStorage(newState, isCasual);
		return newState;
	});
}

export default function TileBoard({
	isCasual = false,
}: {
	isCasual?: boolean;
}) {
	const guessContext = useContext(GuessContext)!;
	const dialogContext = useContext(DialogContext)!;

	useEffect(() => {
		document.addEventListener("keydown", (e) =>
			keyHandler(e, guessContext),
		);

		const jsonValue = localStorage.getItem(
			isCasual ? LOCAL_STORAGE_KEY_CASUAL : LOCAL_STORAGE_KEY,
		);
		let storedState: GuessData | null = null;
		if (jsonValue) {
			storedState = JSON.parse(jsonValue);
			guessContext.setState(() => ({
				...storedState!,
			}));
		}

		if (!isCasual) {
			(async () => {
				const isInSync = await checkUuid(
					guessContext,
					storedState?.currentUuid ?? "",
				);
				if (!isInSync) {
					alert("Mismatched word!");
				}
			})();
		} else if (!storedState || storedState.guessRandomId === 0) {
			newRandomWord(guessContext);
		}
	}, []);

	useEffect(
		() => handleKanaConversion(guessContext),
		[guessContext.state.typing],
	);

	useEffect(() => {
		const state = guessContext.state;
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
			handleSubmission(guessContext, word, isCasual);
		}
	}, [guessContext.state.requestSubmit]);

	if (isCasual && guessContext.state.guessRandomId === 0) {
		return <TileBoardFallback />;
	}

	return (
		<div className="grid w-full grid-cols-2 justify-center gap-4">
			<div
				className="grid size-fit gap-2 justify-self-end"
				style={{
					gridTemplateColumns: "repeat(" + BOARD_WIDTH + ", 1fr)",
				}}
			>
				{guessContext.state.tiles.map((value, i) => {
					return (
						<CharTile
							key={i}
							tile={value}
							className={
								i === guessContext.state.index
									? "border-2 border-(--accent)"
									: ""
							}
						/>
					);
				})}
			</div>
			<div className="flex flex-col items-start gap-4 justify-self-start">
				{isCasual ? (
					<Button
						onClick={() => {
							if (!isCasual) {
								return;
							}
							reset(guessContext, true);
							newRandomWord(guessContext);
						}}
					>
						Reset
					</Button>
				) : (
					<></>
				)}
				<Button onClick={() => fetchGlossaries(guessContext, isCasual)}>
					Give Me Hint
				</Button>
				<ol>
					Glossary:
					{guessContext.state.revealedGlossaries.map((glossary) => {
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
		</div>
	);
}

export function TileBoardFallback() {
	const tiles = Array.from({ length: BOARD_WIDTH * BOARD_HEIGHT }, () => 0);

	return (
		<div className="grid grid-cols-2 gap-4">
			<div
				className="m-auto grid w-fit gap-2 justify-self-end"
				style={{
					gridTemplateColumns: "repeat(" + BOARD_WIDTH + ", 1fr)",
				}}
			>
				{tiles.map((_, i) => {
					return (
						<span
							key={i}
							className="flex size-12 animate-pulse items-center justify-center rounded-lg bg-(--primary-3) text-3xl font-bold select-none"
						></span>
					);
				})}
			</div>
			<div className="flex flex-col items-start gap-4 justify-self-start">
				<button className="w-fit animate-pulse rounded-md border-2 border-transparent bg-(--primary-3) px-4 py-2">
					Reset
				</button>
				<button className="w-fit animate-pulse rounded-md border-2 border-transparent bg-(--primary-3) px-4 py-2">
					Give Me Hint
				</button>
				<ol>Glossary:</ol>
			</div>
		</div>
	);
}
