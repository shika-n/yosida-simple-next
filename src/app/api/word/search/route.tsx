import { getWordsLike } from "@/lib/models/words";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
	const searchString = request.nextUrl.searchParams.get("q") ?? "";
	const offset = Number(request.nextUrl.searchParams.get("index")) ?? 0;

	const words = getWordsLike(searchString, offset) ?? [];

	return NextResponse.json(words);
}
