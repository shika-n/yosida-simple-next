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
	const [data, setData] = useState<AttemptBins[]>([]);

	useEffect(() => {
		fetchData(setData, wordId);
	}, [wordId]);

	let highestCount = 0;
	data.forEach((bin) => (highestCount = Math.max(bin.count, highestCount)));

	return (
		<div className="grid h-20 w-3/5 grid-cols-8 gap-1">
			{data.map((bin: AttemptBins, i) => {
				return (
					<div key={wordId + "_" + i} className="flex flex-col">
						<div className="flex h-full flex-col justify-end">
							<div
								className="w-full bg-(--accent)"
								style={{
									height:
										(100.0 * bin.count) / highestCount +
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
