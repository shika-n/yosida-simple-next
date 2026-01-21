"use client";

import { BOARD_WIDTH } from "@/components/tile_board";
import { createContext, ReactNode, useState } from "react";
import { Glossary } from "../models/glossary";

export interface ProviderPair<T> {
	state: T;
	setState: React.Dispatch<React.SetStateAction<T>>;
}

export interface Tile {
	text: string;
}

export interface GuessData {
	offset: number;
	index: number;
	typing: string;
	tiles: Tile[];

	revealedGlossaryCount: number;
	revealedGlossaries: Glossary[];
}

export const GuessContext = createContext<ProviderPair<GuessData> | null>(null);

export default function GuessProvider({ children }: { children: ReactNode }) {
	const [state, setState] = useState<GuessData>({
		offset: 0,
		index: 0,
		typing: "",
		tiles: Array.from({ length: BOARD_WIDTH * 6 }, () => ({
			text: "",
		})),
		revealedGlossaryCount: 0,
		revealedGlossaries: [],
	});

	return (
		<GuessContext.Provider value={{ state, setState }}>
			{children}
		</GuessContext.Provider>
	);
}
