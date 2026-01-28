"use client";

import { usePathname } from "next/navigation";
import { ReactNode } from "react";

export default function NavLink({
	to,
	children,
}: {
	to: string;
	children: ReactNode;
}) {
	const pathname = usePathname();
	console.log(pathname, to, pathname === to);
	return (
		<a
			href={to}
			className={
				"h-full px-6 py-3 text-lg font-bold hover:bg-(--primary-2) active:bg-(--primary-4) " +
				(pathname === to
					? "shadow-[inset_0px_-4px_0px_var(--secondary)]"
					: "")
			}
		>
			{children}
		</a>
	);
}
