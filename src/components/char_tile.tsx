import { ReactNode } from "react";

export default function CharTile({ children }: { children?: ReactNode }) {
	return (
		<span className="size-16 bg-(--primary-3) rounded-lg flex justify-center items-center text-4xl font-bold select-none">
			{children}
		</span>
	);
}
