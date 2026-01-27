import TileBoard from "@/components/tile_board";

export default function Random() {
	return (
		<>
			<h1 className="text-3xl font-bold">Casual</h1>
			<TileBoard isCasual={true} />
		</>
	);
}
