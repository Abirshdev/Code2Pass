import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="text-center py-20 space-y-4">
      <h1 className="text-2xl font-bold">404</h1>
      <p className="text-slate-600 dark:text-slate-400">Page not found.</p>
      <Link to="/" className="text-brand-600">
        Home
      </Link>
    </div>
  );
}
