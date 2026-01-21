import TileBoard, { TileBoardFallback } from "@/components/tile_board";
import { Suspense } from "react";

async function fetchData() {
	try {
		const res = await fetch("http://localhost:3000/word/random");
		if (res.status !== 200) {
			return null;
		}
		const json = await res.json();
		return json;
	} catch (e) {
		return null
	}
}

export default function Home() {
	const dataPromise = fetchData().catch((reason) => reason);

	return (
		<>
			<Suspense fallback={<TileBoardFallback />}>
				<TileBoard dataPromise={dataPromise} />
			</Suspense>
		</>
	);
}
