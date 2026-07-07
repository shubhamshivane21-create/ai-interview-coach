import mongoose, { Schema, Document } from "mongoose";

export interface ISession extends Document {
  resumeText:  string;
  questions:   string[];
  answers:     string[];
  scores: {
    technical:     number;
    communication: number;
    confidence:    number;
    feedback?:     string;
  }[];
  weakAreas:   string[];
  studyPlan:   Record<string, unknown> | string | null;
  company?:    string;
  difficulty?: string;
  userId?:     string;
  createdAt:   Date;
}

const ScoreSchema = new Schema(
  {
    technical:     { type: Number, min: 0, max: 10, default: 0 },
    communication: { type: Number, min: 0, max: 10, default: 0 },
    confidence:    { type: Number, min: 0, max: 10, default: 0 },
    feedback:      { type: String, default: "" },
  },
  { _id: false }
);

const SessionSchema = new Schema<ISession>(
  {
    resumeText:  { type: String, required: true },
    questions:   { type: [String], default: [] },
    answers:     { type: [String], default: [] },
    scores:      { type: [ScoreSchema], default: [] },
    weakAreas:   { type: [String], default: [] },
    studyPlan:   { type: Schema.Types.Mixed, default: null },
    company:     { type: String, default: "general" },
    difficulty:  { type: String, default: "medium" },
    userId:      { type: String, index: true },
    createdAt:   { type: Date, default: Date.now },
  }
);

SessionSchema.index({ userId: 1, createdAt: -1 });

export default mongoose.models.Session ||
  mongoose.model<ISession>("Session", SessionSchema);