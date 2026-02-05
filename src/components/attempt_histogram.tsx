import { AttemptBins } from "@/lib/models/attempts";
import { Dispatch, SetStateAction, useEffect, useState } from "react";

async function fetchData(
	setData: Dispatch<SetStateAction<AttemptBins[]>>,
	wordId: number,
) {
	try {
		const res = await fetch(
			"http://localhost:3000/api/word/" + wordId + "/attempt_data",
		);

		if (res.status !== 200) {
			return;
		}

		const json = await res.json();
		setData(json);
	} catch (e) {
		return;
	}
}

export default function AttemptHistogram({ wordId }: { wordId: number }) {
	const [data, setData] = useState<AttemptBins[]>([
		{ bin: 1, count: 0 },
		{ bin: 2, count: 0 },
		{ bin: 3, count: 0 },
		{ bin: 4, count: 0 },
		{ bin: 5, count: 0 },
		{ bin: 6, count: 0 },
		{ bin: 7, count: 0 },
		{ bin: 8, count: 0 },
	]);

	useEffect(() => {
		fetchData(setData, wordId);
	}, [wordId]);

	let highestCount = 0;
	data.forEach((bin) => (highestCount = Math.max(bin.count, highestCount)));

	return (
		<div className="grid h-20 w-3/5 grid-cols-8 gap-0">
			{data.map((bin: AttemptBins, i) => {
				return (
					<div key={wordId + "_" + i} className="flex flex-col">
						<div className="flex h-full flex-col justify-end border-b-2 px-0.5">
							<div
								className="w-full bg-(--accent) transition-all duration-1000"
								style={{
									height:
										(100.0 * bin.count) /
											Math.max(1, highestCount) +
										"%",
								}}
								title={bin.count + "回"}
							></div>
						</div>
						<span className="text-center">{bin.bin}</span>
					</div>
				);
			})}
		</div>
	);
}
