import { useContext } from "react";
import Button from "../clickables/button";
import { DialogContext } from "@/lib/providers/dialog_provider";
import WordReveal from "../word_reveal";
import AttemptHistogram from "../attempt_histogram";

export default function LoseDialog({ wordId }: { wordId: number }) {
	const dialogContext = useContext(DialogContext)!;
	return (
		<div className="flex w-full flex-col items-center gap-4">
			<h2 className="text-3xl font-bold">また次回！</h2>
			<WordReveal wordId={wordId} />
			<AttemptHistogram wordId={wordId} />
			<Button onClick={dialogContext.state.close}>確認</Button>
		</div>
	);
}
