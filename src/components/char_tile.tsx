import { ReactNode } from "react";

export default function CharTile({
	children,
	className,
}: {
	children?: ReactNode;
	className?: string;
}) {
	return (
		<span
			className={
				"flex size-16 items-center justify-center rounded-lg bg-(--primary-3) text-4xl font-bold select-none " +
				className
			}
		>
			{children}
		</span>
	);
}
