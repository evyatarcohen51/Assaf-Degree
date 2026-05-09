import { Link } from 'react-router-dom';
import { r } from '../lib/routes';
import { USE_SOFT_DESIGN } from '../lib/design';

export function NotFoundPage() {
  if (USE_SOFT_DESIGN) {
    return (
      <div className="card-soft text-center flex flex-col items-center gap-4">
        <h1 className="text-5xl font-display font-black text-soft-text">404</h1>
        <p className="text-soft-muted">הדף לא נמצא</p>
        <Link to={r.home()} className="btn-soft-primary">
          חזרה לדף הבית
        </Link>
      </div>
    );
  }

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
