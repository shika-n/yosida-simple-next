"use client";

import Button from "@/components/clickables/button";
import ExploreEntry from "@/components/explore_entry";
import { Attempt } from "@/lib/models/attempts";
import { Word } from "@/lib/models/words";
import { Dispatch, SetStateAction, useEffect, useState } from "react";

async function fetchData(
	searchValue: string,
	index: number,
	setResult: Dispatch<SetStateAction<Word[]>>,
	setCurrentIndex: Dispatch<SetStateAction<number>>,
	setIsFetching: Dispatch<SetStateAction<boolean>>,
) {
	if (searchValue.trim().length === 0 || index === -1) {
		return;
	}
	setIsFetching(true);
	try {
		const searchParams = new URLSearchParams([
			["q", searchValue],
			["index", index.toString()],
		]);
		const res = await fetch(
			"http://localhost:3000/api/word/search?" + searchParams,
		);
		if (res.status !== 200) {
			setResult((prev) => prev);
			setCurrentIndex(-1);
			setIsFetching(false);
			return;
		}

		const json: Word[] = await res.json();
		setResult((prev) => {
			if (index === 0) {
				return json;
			}
			return [...prev, ...json];
		});
		setCurrentIndex((prev) => {
			if (json.length !== 0) {
				return prev + 1;
			} else {
				return -1;
			}
		});
		setIsFetching(false);
	} catch (e) {
		setResult((prev) => prev);
		setCurrentIndex(-1);
		setIsFetching(false);
	}
}

export default function ExplorePage() {
	const [searchValue, setSearchValue] = useState("");
	const [currentIndex, setCurrentIndex] = useState(0);
	const [isFetching, setIsFetching] = useState(false);
	const [result, setResult] = useState<Word[]>([]);

	useEffect(() => {
		const timeoutId = setTimeout(() => {
			setCurrentIndex(0);
			fetchData(
				searchValue,
				0,
				setResult,
				setCurrentIndex,
				setIsFetching,
			);
		}, 500);
		return () => clearTimeout(timeoutId);
	}, [searchValue]);

	return (
		<>
			<h1 className="text-3xl font-bold">Explore</h1>

			<input
				type="text"
				className="w-full rounded-md bg-white/10 px-4 py-2"
				value={searchValue}
				onChange={(e) => setSearchValue(e.target.value)}
				placeholder="Search・検索・けんさく"
			/>
			<div className="flex w-full flex-col gap-1 px-4">
				<div className="grid w-full grid-cols-4 gap-4 rounded-t-md bg-white/10 px-4 py-2 text-center font-bold">
					<span className="border-r-2">Kanji</span>
					<span className="border-r-2">Reading</span>
					<span className="border-r-2">Ratio</span>
					<span>Is Common</span>
				</div>
				{result.map((word, i) => {
					return (
						<ExploreEntry
							key={word.id + "_" + i}
							word={word}
							className={[
								i % 2 === 0 ? "bg-white/5" : "bg-white/10",
								i === result.length - 1 ? "rounded-b-md" : "",
							].join(" ")}
						/>
					);
				})}
				{currentIndex !== -1 && result.length !== 0 ? (
					<Button
						onClick={() =>
							fetchData(
								searchValue,
								currentIndex,
								setResult,
								setCurrentIndex,
								setIsFetching,
							)
						}
						disabled={isFetching}
						className="mt-2 self-center"
					>
						もっと見る・Load More
					</Button>
				) : (
					<></>
				)}
			</div>
		</>
	);
}
