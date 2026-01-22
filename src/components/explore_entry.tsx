import { Word } from "@/lib/models/words";

export default function ExploreEntry({
	word,
	className,
}: {
	word: Word;
	className: string;
}) {
	return (
		<div
			className={[
				"grid w-full grid-cols-3 gap-4 px-4 py-2",
				className,
			].join(" ")}
		>
			<span className="border-r-2">{word.kanji}</span>
			<span className="border-r-2">{word.reading}</span>
			<span>{word.is_common ? "Yes" : "No"}</span>
		</div>
	);
}
