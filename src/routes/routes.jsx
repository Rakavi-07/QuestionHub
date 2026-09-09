import LandingPage from '@/pages/LandingPage';
import StudentLogin from '@/pages/StudentLogin';
import AdminLogin from '@/pages/AdminLogin';
import StudentRegister from '@/pages/StudentRegister';
import StudentDashboard from '@/pages/StudentDashboard';
import AdminDashboard from '@/pages/AdminDashboard';
import AdminStudents from '@/pages/AdminStudents';
import AdminQuestionPapers from '@/pages/AdminQuestionPapers';
import NotFound from '@/pages/NotFound';
import ProtectedRoute from '@/routes/ProtectedRoute';

const routes = [
  { path: '/', element: <LandingPage /> },
  { path: '/student/login', element: <StudentLogin /> },
  { path: '/admin/login', element: <AdminLogin /> },
  { path: '/register', element: <StudentRegister /> },
  {
    path: '/dashboard/student',
    element: (
      <ProtectedRoute role="Student">
        <StudentDashboard />
      </ProtectedRoute>
    ),
  },
  // ── Admin routes (Phase 3) ─────────────────────────────────────
  {
    path: '/admin',
    element: (
      <ProtectedRoute role="Admin">
        <AdminDashboard />
      </ProtectedRoute>
    ),
  },
  {
    path: '/admin/students',
    element: (
      <ProtectedRoute role="Admin">
        <AdminStudents />
      </ProtectedRoute>
    ),
  },
  {
    path: '/admin/question-papers',
    element: (
      <ProtectedRoute role="Admin">
        <AdminQuestionPapers />
      </ProtectedRoute>
    ),
  },
  // Keep old /dashboard/admin route as an alias to not break existing links
  {
    path: '/dashboard/admin',
    element: (
      <ProtectedRoute role="Admin">
        <AdminDashboard />
      </ProtectedRoute>
    ),
  },
  { path: '*', element: <NotFound /> },
];

export default routes;
