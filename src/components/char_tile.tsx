import { Tile, TileStatus } from "@/lib/contexts/guess_context";

export default function CharTile({
	tile,
	className,
}: {
	tile?: Tile;
	className?: string;
}) {
	let color = "bg-(--primary-3)";

	if (tile?.status === TileStatus.Wrong) {
		color = "bg-black/20";
	} else if (tile?.status === TileStatus.Misplaced) {
		color = "bg-amber-600/50";
	} else if (tile?.status === TileStatus.Correct) {
		color = "bg-lime-600/50";
	}

	return (
		<span
			className={[
				"flex size-16 items-center justify-center rounded-lg text-4xl font-bold select-none",
				className,
				color,
			].join(" ")}
		>
			{tile?.text}
		</span>
	);
}
