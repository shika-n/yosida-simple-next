"use client";

import { DialogContext } from "@/lib/providers/dialog_provider";
import { useContext } from "react";

export default function DialogModal() {
	const dialogContext = useContext(DialogContext)!;

	return (
		<div
			className={
				"top-0 left-0 z-10 flex h-full w-full items-center justify-center bg-black/10 p-4 backdrop-blur-sm " +
				(dialogContext.state.visible ? "fixed" : "hidden")
			}
			onClick={() => dialogContext.state.close()}
		>
			<div
				className="m-auto flex w-120 flex-col gap-2 rounded-xl border-2 border-(--primary-5) bg-(--primary-4) p-4 shadow-md"
				onClick={(e) => e.stopPropagation()}
			>
				{dialogContext.state.content}
			</div>
		</div>
	);
}
