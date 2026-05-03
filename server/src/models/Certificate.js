import mongoose from 'mongoose';

const certificateSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    courseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', default: null },
    departmentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Department', required: true },
    departmentName: { type: String, required: true },
    courseName: { type: String, required: true },
    certificateId: { type: String, required: true, unique: true },
    score: { type: Number, required: true },
    reason: { type: String, enum: ['course_complete', 'quiz_pass', 'exit_exam_pass'], required: true },
    issueDate: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

certificateSchema.index({ userId: 1 });
certificateSchema.index({ certificateId: 1 });

export default mongoose.model('Certificate', certificateSchema);
