import mongoose from 'mongoose';

const departmentSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    code: { type: String, required: true, uppercase: true, trim: true },
    description: { type: String, default: '' },
  },
  { timestamps: true }
);

departmentSchema.index({ code: 1 }, { unique: true });

export default mongoose.model('Department', departmentSchema);
