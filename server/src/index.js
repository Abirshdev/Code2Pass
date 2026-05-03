import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import authRoutes from './routes/auth.js';
import departmentRoutes from './routes/departments.js';
import courseRoutes from './routes/courses.js';
import lessonRoutes from './routes/lessons.js';
import questionRoutes from './routes/questions.js';
import quizRoutes from './routes/quiz.js';
import certificateRoutes from './routes/certificates.js';
import userRoutes from './routes/users.js';
import progressRoutes from './routes/progress.js';

const app = express();
const PORT = process.env.PORT || 5000;
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';

app.use(
  cors({
    origin: CLIENT_URL,
    credentials: true,
  })
);
app.use(express.json({ limit: '2mb' }));

app.use('/api/auth', authRoutes);
app.use('/api/departments', departmentRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/lessons', lessonRoutes);
app.use('/api/questions', questionRoutes);
app.use('/api/quiz', quizRoutes);
app.use('/api/certificates', certificateRoutes);
app.use('/api/users', userRoutes);
app.use('/api/progress', progressRoutes);

app.get('/api/health', (_, res) => res.json({ ok: true }));

mongoose
  .connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/bdu-exitprep')
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server listening on ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });
