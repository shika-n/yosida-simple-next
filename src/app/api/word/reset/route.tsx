import { newWord } from "@/lib/guess_data";
import { NextRequest, NextResponse } from "next/server";
import { env } from "process";

export async function POST(req: NextRequest) {
	try {
		if (env.YSN_RESET_KEY) {
			const body = await req.json();
			if (body.reset_key !== env.YSN_RESET_KEY) {
				return NextResponse.json(
					{ message: "Unauthorized" },
					{ status: 401 },
				);
			}
		}

		newWord();

		return NextResponse.json({ message: "OK" });
	} catch (e) {
		console.log(e);
		return NextResponse.json({ message: "Bad request" }, { status: 400 });
	}
}
