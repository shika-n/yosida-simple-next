"use client";
import { use } from "react";
import CharTile from "./char_tile";
import { WordData } from "@/app/get_random_word/route";

export default function TileBoard({
	dataPromise,
}: {
	dataPromise: Promise<any>;
}) {
	const data: WordData = use(dataPromise);

	const tiles = [0, 1, 2, 3, 4];
	tiles.push(...[0, 1, 2, 3, 4]);
	tiles.push(...[0, 1, 2, 3, 4]);
	tiles.push(...[0, 1, 2, 3, 4]);
	tiles.push(...[0, 1, 2, 3, 4]);

	return (
		<div className="flex flex-col gap-4 p-4 max-w-3xl m-auto rounded-lg bg-(--primary-4)">
			<div className="m-auto grid grid-cols-5 gap-2 w-fit">
				{data.word.reading.split("").map((value, i) => {
					return <CharTile key={i}>{value}</CharTile>;
				})}
				{data.word.reading.split("").map((value, i) => {
					return <CharTile key={i}>{value}</CharTile>;
				})}
				{data.word.reading.split("").map((value, i) => {
					return <CharTile key={i}>{value}</CharTile>;
				})}
				{data.word.reading.split("").map((value, i) => {
					return <CharTile key={i}>{value}</CharTile>;
				})}
				{data.word.reading.split("").map((value, i) => {
					return <CharTile key={i}>{value}</CharTile>;
				})}
				{data.word.reading.split("").map((value, i) => {
					return <CharTile key={i}>{value}</CharTile>;
				})}
				{data.word.reading.split("").map((value, i) => {
					return <CharTile key={i}>{value}</CharTile>;
				})}
			</div>
			<input
				type="text"
				className="px-4 py-1 text-center text-2xl border-2 border-(--primary-5) rounded-md bg-black/20"
			/>
			<button>Hint! (0/{data.glossaries.length})</button>
			Glossary:
			<ul>
				{data.glossaries.map((glossary) => {
					return <li key={glossary.id}>{glossary.meaning}</li>;
				})}
			</ul>
		</div>
	);
}

export function TileBoardFallback() {
	const tiles = [0, 1, 2, 3, 4];
	tiles.push(...[0, 1, 2, 3, 4]);
	tiles.push(...[0, 1, 2, 3, 4]);
	tiles.push(...[0, 1, 2, 3, 4]);
	tiles.push(...[0, 1, 2, 3, 4]);

	return (
		<div className="p-4 max-w-3xl m-auto rounded-lg bg-(--primary-4)">
			<div className="m-auto grid grid-cols-5 gap-2 w-fit">
				{tiles.map((_, i) => {
					return <CharTile key={i}></CharTile>;
				})}
			</div>
		</div>
	);
}
