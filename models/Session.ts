import mongoose, { Schema, Document } from 'mongoose';

export interface ISession extends Document {
  resumeText: string;
  questions: string[];
  answers: string[];
  scores: {
    communication: number;
    technical: number;
    confidence: number;
  }[];
  weakAreas: string[];
  studyPlan: string;
  createdAt: Date;
}

const SessionSchema = new Schema<ISession>({
  resumeText: { type: String, required: true },
  questions: [{ type: String }],
  answers: [{ type: String }],
  scores: [{
    communication: { type: Number, default: 0 },
    technical: { type: Number, default: 0 },
    confidence: { type: Number, default: 0 },
  }],
  weakAreas: [{ type: String }],
  studyPlan: { type: String },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.Session || 
  mongoose.model<ISession>('Session', SessionSchema);