import TileBoard, { TileBoardFallback } from "@/components/tile_board";
import { Suspense } from "react";

async function fetchData() {
	const res = await fetch("http://localhost:3000/get_random_word");
	if (res.status !== 200) {
		Promise.reject(res.body);
	}
	const json = await res.json();
	return json;
}

export default function Home() {
	const dataPromise = fetchData();

	return (
		<>
			<Suspense fallback={<TileBoardFallback />}>
				<TileBoard dataPromise={dataPromise} />
			</Suspense>
		</>
	);
}
