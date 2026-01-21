import { ReactNode } from "react";

export default function MainContainer({ children }: { children: ReactNode }) {
	return (
		<div className="m-auto flex max-w-3xl flex-col items-center gap-4 rounded-lg bg-(--primary-4) p-4">
			{children}
		</div>
	);
}
