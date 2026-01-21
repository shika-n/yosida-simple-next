"use client"

import { createContext, ReactNode, useEffect, useState } from "react";

export interface ProviderPair<T> {
	state: T,
	setState: React.Dispatch<React.SetStateAction<T>>
}

export interface GuessData {
	index: number
	typing: string
}

export const GuessContext = createContext<ProviderPair<GuessData> | null>(null);


export default function GuessProvider({ children }: { children: ReactNode }) {
	const [state, setState] = useState<GuessData>({
		index: 0,
		typing: "",
	});

	return <GuessContext.Provider value={{ state, setState }}>
		{children}
	</GuessContext.Provider>
}
