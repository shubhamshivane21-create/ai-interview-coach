import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";
import connectDB from "@/lib/mongodb";
import Session from "@/models/Session";

export async function GET(_req: NextRequest) {
  try {
    await connectDB();
    const auth   = await getServerSession(authOptions).catch(() => null);
    const userId = (auth?.user as { id?: string } | undefined)?.id;

    if (!userId) {
      return NextResponse.json({ error: "Sign in to view history." }, { status: 401 });
    }

    const sessions = await Session.find({ userId })
      .sort({ createdAt: -1 })
      .limit(20)
      .select("_id createdAt resumeText scores questions weakAreas studyPlan");

    return NextResponse.json({ sessions });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}