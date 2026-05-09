import { NavLink } from 'react-router-dom';
import { SidebarTree } from './SidebarTree';
import { r } from '../lib/routes';
import { signOut, useAuth } from '../lib/auth';
import { useDarkMode } from '../lib/useDarkMode';
import { USE_SOFT_DESIGN } from '../lib/design';
import { MoonIcon, SunIcon, LogoutIcon } from '../ui/icons';

// Toggle: true = straight nav buttons (new), false = sticker rotation (classic).
const USE_STRAIGHT_NAV_ITEMS = true;
const navRotate = (cls: string): string | undefined =>
  USE_STRAIGHT_NAV_ITEMS ? undefined : cls;

export function Sidebar({ onNavigate }: { onNavigate?: () => void }) {
  const { user } = useAuth();
  const [dark, setDark] = useDarkMode();

  if (USE_SOFT_DESIGN) {
    return (
      <nav className="flex h-full flex-col gap-2 overflow-y-auto pb-4" onClick={onNavigate}>
        <div className="hidden lg:block mb-4">
          <NavLink to={r.home()} className="block rounded-soft bg-soft-mustard text-soft-text px-4 py-3 shadow-soft-pill transition hover:shadow-soft-pill-hover">
            <h1 className="font-display text-2xl font-black tracking-tight text-soft-text">Got Schooled</h1>
            <p className="text-xs text-soft-text/75 mt-0.5">ניהול לימודים אישי</p>
          </NavLink>
        </div>

        <SoftNavItem to={r.home()} label="דף הבית" />

        <SidebarTree />

        <div className="mt-2 flex flex-col gap-2">
          <SoftNavItem to={r.credits()} label="נקודות זכות" />
          <SoftNavItem to={r.profile()} label="פרופיל" />
          <SoftNavItem to={r.settings()} label="הגדרות" />
        </div>

        <div className="mt-3">
          <button
            type="button"
            className="w-full inline-flex items-center justify-center gap-2 rounded-soft-pill bg-soft-input text-soft-text px-4 py-2 text-sm font-medium shadow-soft-pill transition hover:brightness-95"
            onClick={() => setDark(!dark)}
          >
            {dark ? <SunIcon size={16} /> : <MoonIcon size={16} />}
            <span>{dark ? 'מצב בהיר' : 'מצב כהה'}</span>
          </button>
        </div>

        {user && (
          <div className="mt-auto pt-4 border-t border-soft-border">
            <p className="text-xs text-soft-muted truncate" dir="ltr">{user.email}</p>
            <button
              type="button"
              className="mt-2 w-full inline-flex items-center justify-center gap-2 rounded-soft-pill bg-soft-mustard text-soft-text px-4 py-2 text-sm font-medium shadow-soft-pill transition hover:brightness-105 hover:shadow-soft-pill-hover"
              onClick={() => signOut()}
            >
              <LogoutIcon size={16} />
              <span>התנתק</span>
            </button>
          </div>
        )}
      </nav>
    );
  }

  // Original sticker design
  return (
    <nav className="flex h-full flex-col gap-1 overflow-y-auto pb-6" onClick={onNavigate}>
      <div className="hidden lg:block mb-4">
        <NavLink to={r.home()} className="block">
          <h1 className="font-display text-2xl font-black tracking-tight">Got Schooled</h1>
          <p className="text-xs text-ink/60">ניהול לימודים אישי</p>
        </NavLink>
      </div>

      <NavItem to={r.home()} label="דף הבית" colorClass="bg-yellow" rotate={navRotate('rotate-sticker')} />

      <SidebarTree />

      <div className="mt-2 flex flex-col gap-2">
        <NavItem to={r.credits()} label="נקודות זכות" colorClass="bg-yellow" rotate={navRotate('-rotate-sticker')} />
        <NavItem to={r.profile()} label="פרופיל" colorClass="bg-yellow" rotate={navRotate('rotate-sticker')} />
        <NavItem to={r.settings()} label="הגדרות" colorClass="bg-yellow" rotate={navRotate('-rotate-sticker')} />
      </div>

      <div className="mt-4">
        <button
          type="button"
          className="btn-secondary w-full text-sm"
          onClick={() => setDark(!dark)}
        >
          {dark ? '☀ מצב בהיר' : '🌙 מצב כהה'}
        </button>
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

function SoftNavItem({ to, label }: { to: string; label: string }) {
  return (
    <NavLink
      to={to}
      end={to === '/'}
      className={({ isActive }) =>
        `block rounded-soft-pill px-4 py-2.5 font-medium bg-soft-input text-soft-text shadow-soft-pill transition hover:shadow-soft-pill-hover hover:brightness-95 ${
          isActive ? 'shadow-soft-pill-hover' : ''
        }`
      }
    >
      {label}
    </NavLink>
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
        `block rounded-lg ${rotate ?? ''} ${
          isActive ? 'shadow-sticker-lg' : 'shadow-sticker'
        } border-2 border-ink ${colorClass} px-4 py-2 font-display font-bold uppercase text-ink`
      }
    >
      {label}
    </NavLink>
  );
}
