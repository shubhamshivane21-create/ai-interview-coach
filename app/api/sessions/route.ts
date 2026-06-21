import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Session from "@/models/Session";

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const sessions = await Session.find({})
      .sort({ createdAt: -1 })
      .limit(20)
      .select("_id createdAt resumeText scores questions");
    return NextResponse.json({ sessions });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}