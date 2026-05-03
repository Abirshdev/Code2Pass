import Certificate from '../models/Certificate.js';
import Course from '../models/Course.js';
import Department from '../models/Department.js';
import { nextCertificateSerial } from './certificateId.js';

const PASS_THRESHOLD = 70;

export async function issueCertificateIfEligible({
  userId,
  courseId,
  departmentId,
  scorePercent,
  reason,
}) {
  if (reason === 'quiz_pass' || reason === 'exit_exam_pass') {
    if (scorePercent < PASS_THRESHOLD) return null;
  }

  const dept = await Department.findById(departmentId).lean();
  if (!dept) return null;

  let courseName = 'Exit Examination';
  let certCourseId = courseId;

  if (courseId) {
    const course = await Course.findById(courseId).lean();
    if (course) courseName = course.title;
  } else {
    certCourseId = null;
    courseName = 'Department Exit Exam';
  }

  let existing;
  if (reason === 'exit_exam_pass') {
    existing = await Certificate.findOne({
      userId,
      departmentId,
      reason,
      courseId: null,
    }).lean();
  } else {
    existing = await Certificate.findOne({
      userId,
      courseId: certCourseId,
      reason,
    }).lean();
  }
  if (existing) return existing;

  const certificateId = await nextCertificateSerial(dept.code);

  const cert = await Certificate.create({
    userId,
    courseId: certCourseId,
    departmentId,
    departmentName: dept.name,
    courseName,
    certificateId,
    score: Math.round(scorePercent * 10) / 10,
    reason,
    issueDate: new Date(),
  });

  return cert.toObject();
}
