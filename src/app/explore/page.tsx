"use client";

import ExploreEntry from "@/components/explore_entry";
import MainContainer from "@/components/main_container";
import { Word } from "@/lib/models/words";
import { Dispatch, SetStateAction, useEffect, useState } from "react";

async function fetchData(
	setResult: Dispatch<SetStateAction<Word[]>>,
	searchValue: string,
) {
	try {
		const searchParams = new URLSearchParams([["q", searchValue]]);
		const res = await fetch(
			"http://localhost:3000/api/word/search?" + searchParams,
		);
		if (res.status !== 200) {
			setResult([]);
			return;
		}

		const json = await res.json();
		setResult(json.result);
	} catch (e) {
		setResult([]);
	}
}

export default function ExplorePage() {
	const [searchValue, setSearchValue] = useState("");
	const [result, setResult] = useState<Word[]>([]);

	useEffect(() => {
		fetchData(setResult, searchValue);
	}, [searchValue]);

	return (
		<>
			<h1 className="text-3xl font-bold">Explore</h1>

			<input
				type="text"
				className="w-full rounded-md bg-white/10 px-4 py-2"
				value={searchValue}
				onChange={(e) => setSearchValue(e.target.value)}
			/>
			<div className="flex w-full flex-col gap-1 px-4">
				<div className="grid w-full grid-cols-3 gap-4 rounded-t-md bg-white/10 px-4 py-2 text-center font-bold">
					<span className="border-r-2">Kanji</span>
					<span className="border-r-2">Reading</span>
					<span>Is Common</span>
				</div>
				{result.map((val, i) => {
					return (
						<ExploreEntry
							key={i}
							word={val}
							className={[
								"grid w-full grid-cols-2 gap-4 px-4 py-2",
								i % 2 === 0 ? "bg-white/5" : "bg-white/10",
								i === result.length - 1 ? "rounded-b-md" : "",
							].join(" ")}
						/>
					);
				})}
			</div>
		</>
	);
}
