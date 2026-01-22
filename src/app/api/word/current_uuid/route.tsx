import { getCurrentUuid } from "@/lib/guess_data";
import { NextResponse } from "next/server";

export async function GET() {
	return NextResponse.json({ uuid: getCurrentUuid() });
}
