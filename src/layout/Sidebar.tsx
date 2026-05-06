import { NavLink } from 'react-router-dom';
import { SidebarTree } from './SidebarTree';
import { r } from '../lib/routes';
import { signOut, useAuth } from '../lib/auth';

export function Sidebar({ onNavigate }: { onNavigate?: () => void }) {
  const { user } = useAuth();

  return (
    <nav className="flex h-full flex-col gap-1 overflow-y-auto pb-6" onClick={onNavigate}>
      <div className="hidden md:block mb-4">
        <h1 className="font-display text-2xl font-black tracking-tight">Got Schooled</h1>
        <p className="text-xs text-ink/60">ניהול לימודים אישי</p>
      </div>

      <NavItem to={r.home()} label="דף הבית" colorClass="bg-yellow" rotate="rotate-sticker" />

      <SidebarTree />

      <div className="mt-2 flex flex-col gap-1">
        <NavItem to={r.profile()} label="פרופיל" colorClass="bg-orange" rotate="-rotate-sticker" />
        <NavItem to={r.settings()} label="הגדרות" colorClass="bg-blue" rotate="rotate-sticker" />
      </div>

      {user && (
        <div className="mt-auto pt-4 border-t-2 border-ink/20">
          <p className="text-xs text-ink/60 truncate" dir="ltr">{user.email}</p>
          <button
            type="button"
            className="btn-secondary mt-2 w-full text-sm"
            onClick={() => signOut()}
          >
            התנתק
          </button>
        </div>
      )}
    </nav>
  );
}

function NavItem({
  to,
  label,
  colorClass,
  rotate,
}: {
  to: string;
  label: string;
  colorClass: string;
  rotate?: string;
}) {
  return (
    <NavLink
      to={to}
      end={to === '/'}
      className={({ isActive }) =>
        `block ${rotate ?? ''} ${
          isActive ? 'shadow-sticker-lg' : 'shadow-sticker'
        } border-2 border-ink ${colorClass} px-4 py-2 font-display font-bold uppercase text-ink`
      }
    >
      {label}
    </NavLink>
  );
}
