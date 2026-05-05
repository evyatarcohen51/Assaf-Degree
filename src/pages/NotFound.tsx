import { Link } from 'react-router-dom';
import { r } from '../lib/routes';

export function NotFoundPage() {
  return (
    <div className="card text-center">
      <h1 className="text-3xl">404</h1>
      <p className="mt-2">הדף לא נמצא</p>
      <Link to={r.home()} className="btn mt-4 inline-flex">
        חזרה לדף הבית
      </Link>
    </div>
  );
}
