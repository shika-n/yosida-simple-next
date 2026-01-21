"use client";

import { BOARD_WIDTH } from "@/components/tile_board";
import { createContext, ReactNode, useState } from "react";
import { Glossary } from "../models/glossary";

export interface ProviderPair<T> {
	state: T;
	setState: React.Dispatch<React.SetStateAction<T>>;
}

export enum TileStatus {
	Undefined = 0,
	Correct = 1,
	Misplaced = 2,
	Wrong = 3,
}

export interface Tile {
	text: string;
	status: TileStatus;
}

export interface GuessData {
	currentUuid: string;

	offset: number;
	index: number;
	typing: string;
	tiles: Tile[];

	requestSubmit: boolean;

	revealedGlossaryCount: number;
	revealedGlossaries: Glossary[];
}

export const GuessContext = createContext<ProviderPair<GuessData> | null>(null);

export default function GuessProvider({ children }: { children: ReactNode }) {
	const [state, setState] = useState<GuessData>({
		currentUuid: "",

		offset: 0,
		index: 0,
		typing: "",
		tiles: Array.from({ length: BOARD_WIDTH * 6 }, () => ({
			text: "",
			status: TileStatus.Undefined,
		})),

		requestSubmit: false,

		revealedGlossaryCount: 0,
		revealedGlossaries: [],
	});

	return (
		<GuessContext.Provider value={{ state, setState }}>
			{children}
		</GuessContext.Provider>
	);
}
