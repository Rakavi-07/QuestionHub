import { Navigate } from 'react-router-dom';
import { isAuthenticated, getUser } from '@/utils/auth';

/**
 * Lightweight client-side guard. Real authorization is enforced by the
 * backend's JWT middleware — this only prevents obviously-unauthenticated
 * users from momentarily seeing a protected page before their next request
 * fails, and keeps students/admins out of each other's routes.
 */
export default function ProtectedRoute({ role, children }) {
  if (!isAuthenticated()) {
    const loginPath = role === 'Admin' ? '/admin/login' : '/student/login';
    return <Navigate to={loginPath} replace />;
  }

  const user = getUser();
  if (role && user?.role !== role) {
    const loginPath = role === 'Admin' ? '/admin/login' : '/student/login';
    return <Navigate to={loginPath} replace />;
  }

  return children;
}
