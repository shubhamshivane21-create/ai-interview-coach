import mongoose, { Schema, Document } from "mongoose";

export interface ISession extends Document {
  resumeText: string;
  questions: string[];
  answers: string[];
  scores: {
    communication: number;
    technical: number;
    confidence: number;
    feedback?: string;
  }[];
  weakAreas: string[];
  studyPlan: string;
  /**
   * Optional — set once Google/GitHub sign-in is wired up (see
   * docs/AUTH_SETUP.md). Sessions created by guests will have this unset,
   * which is fine; the app works fully without accounts.
   */
  userId?: string;
  createdAt: Date;
}

const SessionSchema = new Schema<ISession>({
  resumeText: { type: String, required: true },
  questions: [{ type: String }],
  answers: [{ type: String }],
  scores: [
    {
      communication: { type: Number, default: 0 },
      technical: { type: Number, default: 0 },
      confidence: { type: Number, default: 0 },
      // Fix: the original schema didn't declare `feedback`, so Mongoose
      // silently stripped it on save even though evaluationAgent.ts
      // always returns it. Per-question feedback was being lost.
      feedback: { type: String, default: "" },
    },
  ],
  weakAreas: [{ type: String }],
  studyPlan: { type: String },
  userId: { type: String, index: true },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.Session ||
  mongoose.model<ISession>("Session", SessionSchema);
