import { MouseEventHandler, ReactNode } from "react";

export default function Button({
	children,
	onClick,
}: {
	children: ReactNode;
	onClick?: MouseEventHandler;
}) {
	return (
		<button
			className="w-fit cursor-pointer rounded-md border-2 border-transparent bg-(--primary-3) px-4 py-2 transition-all hover:border-(--secondary) active:bg-(--primary-4)"
			onClick={onClick}
		>
			{children}
		</button>
	);
}
