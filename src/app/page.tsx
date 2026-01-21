import TileBoard from "@/components/tile_board";
import GuessProvider from "@/lib/contexts/guess_context";

export default function Home() {
	return (
		<GuessProvider>
			<TileBoard />
		</GuessProvider>
	);
}
