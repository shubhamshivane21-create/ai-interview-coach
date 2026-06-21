import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Session from "@/models/Session";

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const sessionId = req.nextUrl.searchParams.get("sessionId");

    if (!sessionId) {
      return NextResponse.json({ error: "sessionId query param is required" }, { status: 400 });
    }

    const session = await Session.findById(sessionId).catch(() => null);

    // Fix: the original returned `{ success: true, session: null }` for a
    // missing/invalid ID, so the frontend had no clean way to distinguish
    // "still loading" from "this session doesn't exist." Now we return a
    // proper 404 so the UI can show a real error state.
    if (!session) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, session });
  } catch (error) {
    console.error("Results API Error:", error);
    return NextResponse.json({ error: "Failed to fetch results" }, { status: 500 });
  }
}
