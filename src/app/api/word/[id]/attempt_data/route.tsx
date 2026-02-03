import { AttemptBins, getAttemptsData } from "@/lib/models/attempts";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
	req: NextRequest,
	{ params }: { params: Promise<{ id: number }> },
) {
	const { id } = await params;

	const res: AttemptBins[] = getAttemptsData(id);

	if (!res) {
		return NextResponse.json(
			{ message: "Attempt data not found" },
			{ status: 404 },
		);
	}

	return NextResponse.json(res);
}
