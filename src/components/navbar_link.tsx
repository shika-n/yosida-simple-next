import { ReactNode } from "react";

export default function NavLink({
	to,
	children,
}: {
	to: string;
	children: ReactNode;
}) {
	return (
		<a
			href={to}
			className="h-full px-4 py-3 transition-all hover:bg-(--primary-2) active:bg-(--primary-4)"
		>
			{children}
		</a>
	);
}
