import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute({ children, admin }) {
  const { user, loading } = useAuth();
  const loc = useLocation();

  if (loading) {
    return (
      <div className="flex justify-center py-20 text-slate-500 dark:text-slate-400">
        Loading…
      </div>
    );
  }
  if (!user) {
    return <Navigate to="/login" state={{ from: loc }} replace />;
  }
  if (admin && user.role !== 'admin') {
    return <Navigate to="/" replace />;
  }
  return children;
}
