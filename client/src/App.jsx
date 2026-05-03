import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import Home from './pages/Home';
import Departments from './pages/Departments';
import DepartmentCourses from './pages/DepartmentCourses';
import CourseDetail from './pages/CourseDetail';
import LessonPage from './pages/LessonPage';
import QuizPage from './pages/QuizPage';
import QuizResultPage from './pages/QuizResultPage';
import ExitExamPage from './pages/ExitExamPage';
import Dashboard from './pages/Dashboard';
import Certificates from './pages/Certificates';
import Login from './pages/Login';
import Register from './pages/Register';
import Admin from './pages/Admin';
import VerifyLanding from './pages/VerifyLanding';
import Verify from './pages/Verify';
import NotFound from './pages/NotFound';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Layout />}>
              <Route index element={<Home />} />
              <Route path="departments" element={<Departments />} />
              <Route path="departments/:id/courses" element={<DepartmentCourses />} />
              <Route path="courses/:id" element={<CourseDetail />} />
              <Route path="courses/:courseId/quiz" element={<QuizPage />} />
              <Route path="lessons/:id" element={<LessonPage />} />
              <Route path="quiz/result/:resultId" element={<QuizResultPage />} />
              <Route path="exit-exam/:departmentId" element={<ExitExamPage />} />
              <Route path="login" element={<Login />} />
              <Route path="register" element={<Register />} />
              <Route path="verify" element={<VerifyLanding />} />
              <Route path="verify/:certificateId" element={<Verify />} />
              <Route
                path="dashboard"
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="certificates"
                element={
                  <ProtectedRoute>
                    <Certificates />
                  </ProtectedRoute>
                }
              />
              <Route
                path="admin"
                element={
                  <ProtectedRoute admin>
                    <Admin />
                  </ProtectedRoute>
                }
              />
              <Route path="*" element={<NotFound />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}
