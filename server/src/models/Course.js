import mongoose from 'mongoose';

const courseSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    departmentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Department', required: true },
    year: { type: Number, required: true, min: 1, max: 4 },
    description: { type: String, default: '' },
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);

courseSchema.index({ departmentId: 1, year: 1 });

export default mongoose.model('Course', courseSchema);
