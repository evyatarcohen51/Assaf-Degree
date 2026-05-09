import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useYears, useSemestersByYear, useSubjectsBySemester } from '../hooks/useTreeData';
import { r } from '../lib/routes';
import { getCurrentSemester } from '../lib/progress';
import { USE_SOFT_DESIGN } from '../lib/design';
import { ChevronDownIcon } from '../ui/icons';
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

  if (USE_SOFT_DESIGN) {
    return (
      <div className="my-2 rounded-soft bg-soft-card shadow-soft p-3">
        <div className="mb-2 px-2 text-xs font-medium text-soft-muted">
          שנת לימודים
        </div>
        {years.length === 0 ? (
          <p className="px-2 text-sm text-soft-muted">אין שנים — הוסף בהגדרות</p>
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

  if (USE_SOFT_DESIGN) {
    return (
      <li>
        <div className="flex items-stretch gap-1">
          <button
            type="button"
            onClick={handleNavigate}
            className="flex-1 relative overflow-hidden rounded-lg bg-soft-card ps-4 pe-3 py-1.5 text-start text-sm font-medium text-soft-text shadow-soft-pill transition hover:bg-soft-input/40 hover:shadow-soft-pill-hover"
          >
            <span aria-hidden="true" className={`absolute inset-y-0 start-0 w-1.5 ${STRIPE_LIGHT[colorName]}`} />
            {year.label || 'ללא שם'}
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setOpen((v) => !v);
            }}
            className="rounded-lg bg-soft-card px-2 text-soft-muted shadow-soft-pill transition hover:bg-soft-input/40 hover:shadow-soft-pill-hover"
            aria-label={open ? 'סגור' : 'פתח'}
          >
            <ChevronDownIcon size={16} className={open ? '' : '-rotate-90'} />
          </button>
        </div>
        {open && (
          <ul className="ms-2 mt-1 flex flex-col gap-1 border-s border-soft-border ps-2">
            {semesters.map((s) => (
              <SemesterNode key={s.id} year={year} semester={s} colorName={colorName} />
            ))}
          </ul>
        )}
      </li>
    );
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

  if (USE_SOFT_DESIGN) {
    return (
      <li>
        <div className="flex items-stretch gap-1">
          <button
            type="button"
            onClick={handleNavigate}
            className="flex-1 relative overflow-hidden rounded-lg bg-soft-card ps-4 pe-3 py-1.5 text-start text-sm font-medium text-soft-text shadow-soft-pill transition hover:bg-soft-input/40 hover:shadow-soft-pill-hover"
          >
            <span aria-hidden="true" className={`absolute inset-y-0 start-0 w-1.5 ${STRIPE_DARK[colorName]}`} />
            {semester.label || 'סמסטר'}
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setOpen((v) => !v);
            }}
            className="rounded-lg bg-soft-card px-2 text-soft-muted shadow-soft-pill transition hover:bg-soft-input/40 hover:shadow-soft-pill-hover"
            aria-label={open ? 'סגור' : 'פתח'}
          >
            <ChevronDownIcon size={16} className={open ? '' : '-rotate-90'} />
          </button>
        </div>
        {open && (
          <ul className="ms-2 mt-1 flex flex-col gap-1 border-s border-soft-border ps-2">
            <li>
              <NavLink
                to={r.schedule(year.id, semester.id)}
                className={({ isActive }) =>
                  `block relative overflow-hidden rounded-md ps-4 pe-3 py-1.5 text-start text-xs font-medium transition ${
                    isActive
                      ? 'bg-soft-mustard text-soft-text shadow-soft-pill'
                      : 'bg-soft-input/40 text-soft-text hover:bg-soft-input'
                  }`
                }
              >
                <span aria-hidden="true" className={`absolute inset-y-0 start-0 w-1.5 ${STRIPE_DARK[colorName]}`} />
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
                      `block relative overflow-hidden rounded-md ps-4 pe-3 py-1.5 text-start text-xs font-medium shadow-soft-pill transition hover:shadow-soft-pill-hover ${
                        isActive
                          ? 'bg-soft-mustard text-soft-text'
                          : 'bg-soft-card text-soft-text hover:bg-soft-input/40'
                      }`
                    }
                  >
                    <span aria-hidden="true" className={`absolute inset-y-0 start-0 w-1.5 ${subStripe}`} />
                    <bdi>{sub.name}</bdi>
                  </NavLink>
                </li>
              );
            })}
            {subjects.length === 0 && (
              <li className="px-2 py-1 text-xs text-soft-muted">אין קורסים</li>
            )}
          </ul>
        )}
      </li>
    );
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
