import { MouseEventHandler, ReactNode } from "react";

export default function Button({
	children,
	onClick,
	disabled,
	className,
}: {
	children: ReactNode;
	onClick?: MouseEventHandler;
	disabled?: boolean;
	className?: string;
}) {
	return (
		<button
			className={[
				"w-fit cursor-pointer rounded-md border-2 border-transparent bg-(--primary-3) px-4 py-2 transition-all hover:border-(--accent) active:bg-(--primary-4)",
				className,
			].join(" ")}
			onClick={onClick}
			disabled={disabled}
		>
			{/* TODO: Make disabled text a prop */}
			{disabled ? "読み込み中" : children}
		</button>
	);
}
