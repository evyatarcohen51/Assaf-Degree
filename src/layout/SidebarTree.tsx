import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useYears, useSemestersByYear, useSubjectsBySemester } from '../hooks/useTreeData';
import { r } from '../lib/routes';
import { getCurrentSemester } from '../lib/progress';
import type { Year, Semester } from '../types/domain';

// Toggle: true = new tree design (year stripe + colored descendants by year),
// false = classic (solid bg-purple year, solid bg-green semester, etc.).
// Switching this constant flips the entire tree design in-place.
const USE_NEW_TREE_DESIGN = true;

// Years cycle through these colors by index (year 0 = blue, year 1 = green, ...).
const YEAR_COLORS = ['blue', 'green', 'yellow', 'red', 'orange'] as const;
type YearColor = typeof YEAR_COLORS[number];

// Light pastel stripe for the year button (sits over bg-smoke).
const STRIPE_LIGHT: Record<YearColor, string> = {
  blue: 'bg-blue-light',
  green: 'bg-green-light',
  yellow: 'bg-yellow-light',
  red: 'bg-red-light',
  orange: 'bg-orange-light',
};
// Full-saturation stripe for descendants (semester / schedule / courses).
const STRIPE_DARK: Record<YearColor, string> = {
  blue: 'bg-blue',
  green: 'bg-green',
  yellow: 'bg-yellow',
  red: 'bg-red',
  orange: 'bg-orange',
};
// Subject-specific stripe — uses the subject's own color, falls back to year color.
const STRIPE_SUBJECT: Record<string, string> = {
  yellow: 'bg-yellow',
  orange: 'bg-orange',
  red: 'bg-red',
  purple: 'bg-purple',
  blue: 'bg-blue',
  green: 'bg-green',
};

function colorForYearIndex(i: number): YearColor {
  return YEAR_COLORS[i % YEAR_COLORS.length];
}

function yearButtonClass(extras: string): string {
  if (USE_NEW_TREE_DESIGN) {
    return `${extras} relative overflow-hidden rounded-lg border-2 border-ink bg-smoke ps-4 pe-2 py-1 font-display font-bold uppercase text-ink`.trim();
  }
  return `${extras} rounded-lg border-2 border-ink bg-purple px-2 py-1 font-display font-bold uppercase text-cream`.trim();
}

function yearChevronClass(): string {
  if (USE_NEW_TREE_DESIGN) {
    return 'rounded-lg border-2 border-ink bg-smoke px-2 py-1 font-display font-bold text-ink';
  }
  return 'rounded-lg border-2 border-ink bg-purple px-2 py-1 font-display font-bold text-cream';
}

export function SidebarTree() {
  const years = useYears();

  return (
    <div className="my-2 rounded-2xl border-2 border-ink bg-cream p-2">
      <div className="mb-1 px-2 font-display text-sm font-bold uppercase tracking-wide text-ink/70">
        שנת לימודים
      </div>
      {years.length === 0 ? (
        <p className="px-2 text-sm text-ink/50">אין שנים — הוסף בהגדרות</p>
      ) : (
        <ul className="flex flex-col gap-1">
          {years.map((y, i) => (
            <YearNode key={y.id} year={y} colorName={colorForYearIndex(i)} />
          ))}
        </ul>
      )}
    </div>
  );
}

function YearNode({ year, colorName }: { year: Year; colorName: YearColor }) {
  const [open, setOpen] = useState(true);
  const semesters = useSemestersByYear(year.id);
  const navigate = useNavigate();

  function handleNavigate() {
    setOpen(true);
    const target = getCurrentSemester(semesters) ?? semesters[0];
    if (target) navigate(r.schedule(year.id, target.id));
  }

  return (
    <li>
      <div className="flex items-stretch gap-1">
        <button
          type="button"
          onClick={handleNavigate}
          className={yearButtonClass('flex-1 text-start')}
        >
          {USE_NEW_TREE_DESIGN && (
            <span aria-hidden="true" className={`absolute inset-y-0 start-0 w-2 ${STRIPE_LIGHT[colorName]}`} />
          )}
          {year.label || 'ללא שם'}
        </button>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setOpen((v) => !v);
          }}
          className={yearChevronClass()}
          aria-label={open ? 'סגור' : 'פתח'}
        >
          {open ? '▾' : '▸'}
        </button>
      </div>
      {open && (
        <ul className="ms-3 mt-1 flex flex-col gap-1 border-s-2 border-ink/30 ps-2">
          {semesters.map((s) => (
            <SemesterNode key={s.id} year={year} semester={s} colorName={colorName} />
          ))}
        </ul>
      )}
    </li>
  );
}

function SemesterNode({
  year,
  semester,
  colorName,
}: {
  year: Year;
  semester: Semester;
  colorName: YearColor;
}) {
  const [open, setOpen] = useState(true);
  const subjects = useSubjectsBySemester(semester.id);
  const navigate = useNavigate();

  function handleNavigate() {
    setOpen(true);
    navigate(r.schedule(year.id, semester.id));
  }

  return (
    <li>
      <div className="flex items-stretch gap-1">
        <button
          type="button"
          onClick={handleNavigate}
          className={
            USE_NEW_TREE_DESIGN
              ? 'flex-1 relative overflow-hidden rounded-lg border-2 border-ink bg-smoke ps-4 pe-2 py-1 text-start font-display font-bold uppercase text-ink'
              : 'flex-1 rounded-lg border-2 border-ink bg-green px-2 py-1 text-start font-display font-bold uppercase text-cream'
          }
        >
          {USE_NEW_TREE_DESIGN && (
            <span aria-hidden="true" className={`absolute inset-y-0 start-0 w-2 ${STRIPE_DARK[colorName]}`} />
          )}
          {semester.label || 'סמסטר'}
        </button>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setOpen((v) => !v);
          }}
          className={
            USE_NEW_TREE_DESIGN
              ? 'rounded-lg border-2 border-ink bg-smoke px-2 py-1 font-display font-bold text-ink'
              : 'rounded-lg border-2 border-ink bg-green px-2 py-1 font-display font-bold text-cream'
          }
          aria-label={open ? 'סגור' : 'פתח'}
        >
          {open ? '▾' : '▸'}
        </button>
      </div>
      {open && (
        <ul className="ms-3 mt-1 flex flex-col gap-1 border-s-2 border-ink/30 ps-2">
          <li>
            <NavLink
              to={r.schedule(year.id, semester.id)}
              className={({ isActive }) =>
                USE_NEW_TREE_DESIGN
                  ? `block relative overflow-hidden rounded-md border-2 border-ink bg-smoke ps-4 pe-2 py-1 font-display text-sm font-bold uppercase text-ink ${isActive ? 'shadow-sticker' : ''}`
                  : `block rounded-md border-2 border-ink bg-yellow px-2 py-1 font-display text-sm font-bold uppercase ${isActive ? 'shadow-sticker' : ''}`
              }
            >
              {USE_NEW_TREE_DESIGN && (
                <span aria-hidden="true" className={`absolute inset-y-0 start-0 w-2 ${STRIPE_DARK[colorName]}`} />
              )}
              מערכת שעות
            </NavLink>
          </li>
          {subjects.map((sub) => {
            const subStripe = sub.color ? (STRIPE_SUBJECT[sub.color] ?? STRIPE_DARK[colorName]) : STRIPE_DARK[colorName];
            return (
              <li key={sub.id}>
                <NavLink
                  to={r.subject(year.id, semester.id, sub.id)}
                  className={({ isActive }) =>
                    USE_NEW_TREE_DESIGN
                      ? `block relative overflow-hidden rounded-md border-2 border-ink bg-smoke ps-4 pe-2 py-1 font-display text-sm font-bold text-ink ${isActive ? 'shadow-sticker' : ''}`
                      : `block rounded-md border-2 border-ink bg-cream px-2 py-1 font-display text-sm font-bold ${isActive ? 'shadow-sticker' : ''}`
                  }
                >
                  {USE_NEW_TREE_DESIGN && (
                    <span aria-hidden="true" className={`absolute inset-y-0 start-0 w-2 ${subStripe}`} />
                  )}
                  <bdi>{sub.name}</bdi>
                </NavLink>
              </li>
            );
          })}
          {subjects.length === 0 && (
            <li className="px-2 text-xs text-ink/50">אין קורסים</li>
          )}
        </ul>
      )}
    </li>
  );
}
