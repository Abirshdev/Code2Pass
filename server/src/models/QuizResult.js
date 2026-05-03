import mongoose from 'mongoose';

const quizResultSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    courseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', default: null },
    departmentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Department', default: null },
    mode: { type: String, enum: ['course_quiz', 'exit_exam'], required: true },
    score: { type: Number, required: true },
    totalQuestions: { type: Number, required: true },
    correctCount: { type: Number, required: true },
    answers: [
      {
        questionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Question' },
        selected: { type: Number },
        correct: { type: Boolean },
      },
    ],
    completedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

quizResultSchema.index({ userId: 1, completedAt: -1 });

export default mongoose.model('QuizResult', quizResultSchema);
