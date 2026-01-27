"use client";

import { ProviderPair } from "./provider";
import { createContext, ReactNode, useState } from "react";

export interface DialogData {
	visible: boolean;
	content: ReactNode;

	open: (content: ReactNode) => void;
	close: () => void;
}

export const DialogContext = createContext<ProviderPair<DialogData> | null>(
	null,
);

export default function DialogProvider({ children }: { children: ReactNode }) {
	const [state, setState] = useState<DialogData>({
		visible: false,
		content: <></>,

		open: (content: ReactNode) =>
			setState((prev) => ({
				...prev,
				content,
				visible: true,
			})),
		close: () => setState((prev) => ({ ...prev, visible: false })),
	});

	return (
		<DialogContext.Provider value={{ state, setState }}>
			{children}
		</DialogContext.Provider>
	);
}
