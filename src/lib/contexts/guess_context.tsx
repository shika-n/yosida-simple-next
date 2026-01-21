"use client";

import { createContext, ReactNode, useEffect, useState } from "react";
import { text } from "stream/consumers";

export interface ProviderPair<T> {
	state: T;
	setState: React.Dispatch<React.SetStateAction<T>>;
}

export interface Tile {
	text: string;
}

export interface GuessData {
	index: number;
	typing: string;
	tiles: Tile[];
}

export const GuessContext = createContext<ProviderPair<GuessData> | null>(null);

export default function GuessProvider({ children }: { children: ReactNode }) {
	const [state, setState] = useState<GuessData>({
		index: 0,
		typing: "",
		tiles: Array.from({ length: 5 * 6 }, (v, i) => ({ text: "" })),
	});

	return (
		<GuessContext.Provider value={{ state, setState }}>
			{children}
		</GuessContext.Provider>
	);
}
