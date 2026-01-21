import TileBoard, { TileBoardFallback } from "@/components/tile_board";
import GuessProvider, { GuessContext } from "@/lib/contexts/guess_context";
import { Suspense, useContext } from "react";

async function fetchData() {
	try {
		const res = await fetch("http://localhost:3000/api/word/random");
		if (res.status !== 200) {
			return null;
		}
		const json = await res.json();
		return json;
	} catch (e) {
		return null;
	}
}

export default function Home() {
	const dataPromise = fetchData();

	return (
		<GuessProvider>
			<Suspense fallback={<TileBoardFallback />}>
				<TileBoard dataPromise={dataPromise} />
			</Suspense>
		</GuessProvider>
	);
}
