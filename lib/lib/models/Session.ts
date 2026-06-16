import mongoose from "mongoose";

const SessionSchema = new mongoose.Schema(
  {
    questions: {
      type: [String],
      default: [],
    },
    answers: {
      type: [String],
      default: [],
    },
    scores: {
      communication: { type: Number, default: 0 },
      technical: { type: Number, default: 0 },
      confidence: { type: Number, default: 0 },
    },
    weakAreas: {
      type: [String],
      default: [],
    },
  },
  { timestamps: true }
);

// prevent model overwrite error in Next.js
export default mongoose.models.Session ||
  mongoose.model("Session", SessionSchema);