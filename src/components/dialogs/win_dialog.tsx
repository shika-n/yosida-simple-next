import { useContext } from "react";
import Button from "../clickables/button";
import { DialogContext } from "@/lib/providers/dialog_provider";
import WordReveal from "./word_reveal";

export default function WinDialog({ wordId }: { wordId: number }) {
	const dialogContext = useContext(DialogContext)!;

	return (
		<div className="flex w-80 flex-col items-center gap-4">
			<h2 className="text-3xl font-bold">勝利！</h2>
			<WordReveal wordId={wordId} />
			<Button onClick={dialogContext.state.close}>確認</Button>
		</div>
	);
}
