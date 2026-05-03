import 'dotenv/config';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import Department from '../models/Department.js';
import Course from '../models/Course.js';
import Lesson from '../models/Lesson.js';
import Question from '../models/Question.js';
import User from '../models/User.js';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/bdu-exitprep';

const departmentsData = [
  { name: 'Computer Science', code: 'CS', description: 'Core CS theory and systems.' },
  { name: 'Information Technology', code: 'IT', description: 'IT infrastructure and applications.' },
  { name: 'Software Engineering', code: 'SE', description: 'Software design and engineering practice.' },
  { name: 'Information Systems', code: 'IS', description: 'Business systems and analytics.' },
  { name: 'Cyber Security', code: 'CYBER', description: 'Security principles and defense.' },
  { name: 'IT (Education)', code: 'ITE', description: 'Computing for education contexts.' },
];

function sampleQuestions(courseTitle) {
  const base = [
    {
      questionText: `In ${courseTitle}, which choice best describes a primary learning objective?`,
      options: [
        'Understanding core concepts and applying them',
        'Ignoring practical exercises',
        'Avoiding assessments',
        'Skipping foundational topics',
      ],
      correctAnswer: 0,
      explanation: 'Courses emphasize understanding and application of core ideas.',
    },
    {
      questionText: `Which practice supports mastery in ${courseTitle}?`,
      options: [
        'Regular practice and review',
        'Only reading once',
        'Avoiding feedback',
        'Memorizing without context',
      ],
      correctAnswer: 0,
      explanation: 'Spaced practice and review improve retention and skill.',
    },
    {
      questionText: `A common pitfall when studying ${courseTitle} is:`,
      options: [
        'Rushing without understanding prerequisites',
        'Asking questions when stuck',
        'Working through examples',
        'Connecting ideas across lessons',
      ],
      correctAnswer: 0,
      explanation: 'Solid prerequisites reduce confusion later in the course.',
    },
  ];
  return base;
}

async function seed() {
  await mongoose.connect(MONGODB_URI);
  console.log('Connected. Clearing collections...');
  await Promise.all([
    User.deleteMany({}),
    Department.deleteMany({}),
    Course.deleteMany({}),
    Lesson.deleteMany({}),
    Question.deleteMany({}),
  ]);

  const adminHash = await bcrypt.hash('admin123', 10);
  const studentHash = await bcrypt.hash('student123', 10);
  await User.create([
    { name: 'Platform Admin', email: 'admin@exitprep.local', password: adminHash, role: 'admin' },
    { name: 'Demo Student', email: 'student@exitprep.local', password: studentHash, role: 'student' },
  ]);
  console.log('Users: admin@exitprep.local / admin123, student@exitprep.local / student123');

  const deptDocs = await Department.insertMany(departmentsData);
  const byCode = Object.fromEntries(deptDocs.map((d) => [d.code, d]));

  const courseTemplates = [
    { title: 'Introduction to Programming', year: 1 },
    { title: 'Data Structures', year: 2 },
    { title: 'Database Systems', year: 2 },
    { title: 'Operating Systems', year: 3 },
    { title: 'Computer Networks', year: 3 },
    { title: 'Software Engineering', year: 4 },
  ];

  const coursesToInsert = [];
  for (const d of deptDocs) {
    courseTemplates.forEach((ct, idx) => {
      coursesToInsert.push({
        title: ct.title,
        departmentId: d._id,
        year: ct.year,
        description: `${ct.title} — ${d.name}`,
        order: idx,
      });
    });
  }
  const courses = await Course.insertMany(coursesToInsert);

  const csDept = byCode.CS;
  const csCourses = courses.filter((c) => c.departmentId.equals(csDept._id));

  const lessons = [];
  for (const c of csCourses.slice(0, 2)) {
    lessons.push(
      {
        title: `${c.title}: Overview`,
        content:
          '## Overview\n\nThis lesson introduces key terms and outcomes.\n\n```python\nprint("Hello, BDU ExitPrep")\n```',
        videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        codeExamples: ['print("Practice daily")'],
        courseId: c._id,
        order: 0,
      },
      {
        title: `${c.title}: Deep dive`,
        content: '## Deep dive\n\nWork through the practice questions after this lesson.',
        videoUrl: '',
        codeExamples: [],
        courseId: c._id,
        order: 1,
      }
    );
  }
  await Lesson.insertMany(lessons);

  const questions = [];
  for (const c of courses) {
    sampleQuestions(c.title).forEach((q) => {
      questions.push({ ...q, courseId: c._id });
    });
  }
  await Question.insertMany(questions);

  console.log(`Seeded ${deptDocs.length} departments, ${courses.length} courses, lessons, questions.`);
  await mongoose.disconnect();
}

seed().catch((e) => {
  console.error(e);
  process.exit(1);
});
