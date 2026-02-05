import { getCurrentWord } from "@/lib/guess_data";
import { AttemptBins, getAttemptsData } from "@/lib/models/attempts";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
	req: NextRequest,
	{ params }: { params: Promise<{ id: number }> },
) {
	const { id } = await params;

	let targetId = Number(id) ?? 0;
	if (targetId === 0) {
		targetId = getCurrentWord()?.id ?? 0;
	}

	let res: AttemptBins[] = getAttemptsData(targetId);


	if (!res) {
		return NextResponse.json(
			{ message: "Attempt data not found" },
			{ status: 404 },
		);
	}

	return NextResponse.json(res);
}
