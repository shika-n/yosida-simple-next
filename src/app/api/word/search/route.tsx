import { getWordsLike } from "@/lib/models/words";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
	const searchString = request.nextUrl.searchParams.get("q") ?? "";

	return NextResponse.json({ result: getWordsLike(searchString) });
}
