import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { useYears, useSemestersByYear, useSubjectsBySemester } from '../hooks/useTreeData';
import { r } from '../lib/routes';
import type { Year, Semester } from '../types/domain';

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
          {years.map((y) => (
            <YearNode key={y.id} year={y} />
          ))}
        </ul>
      )}
    </div>
  );
}

function YearNode({ year }: { year: Year }) {
  const [open, setOpen] = useState(true);
  const semesters = useSemestersByYear(year.id);
  return (
    <li>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between rounded-lg border-2 border-ink bg-purple px-2 py-1 font-display font-bold uppercase text-cream"
      >
        <span>{year.label || 'ללא שם'}</span>
        <span aria-hidden>{open ? '▾' : '▸'}</span>
      </button>
      {open && (
        <ul className="ms-3 mt-1 flex flex-col gap-1 border-s-2 border-ink/30 ps-2">
          {semesters.map((s) => (
            <SemesterNode key={s.id} year={year} semester={s} />
          ))}
        </ul>
      )}
    </li>
  );
}

function SemesterNode({ year, semester }: { year: Year; semester: Semester }) {
  const [open, setOpen] = useState(true);
  const subjects = useSubjectsBySemester(semester.id);
  return (
    <li>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between rounded-lg border-2 border-ink bg-green px-2 py-1 font-display font-bold uppercase text-cream"
      >
        <span>{semester.label || 'סמסטר'}</span>
        <span aria-hidden>{open ? '▾' : '▸'}</span>
      </button>
      {open && (
        <ul className="ms-3 mt-1 flex flex-col gap-1 border-s-2 border-ink/30 ps-2">
          <li>
            <NavLink
              to={r.schedule(year.id, semester.id)}
              className={({ isActive }) =>
                `block rounded-md border-2 border-ink bg-yellow px-2 py-1 font-display text-sm font-bold uppercase ${
                  isActive ? 'shadow-sticker' : ''
                }`
              }
            >
              מערכת שעות
            </NavLink>
          </li>
          {subjects.map((sub) => (
            <li key={sub.id}>
              <NavLink
                to={r.subject(year.id, semester.id, sub.id)}
                className={({ isActive }) =>
                  `block rounded-md border-2 border-ink bg-cream px-2 py-1 font-display text-sm font-bold ${
                    isActive ? 'shadow-sticker' : ''
                  }`
                }
              >
                <bdi>{sub.name}</bdi>
              </NavLink>
            </li>
          ))}
          {subjects.length === 0 && (
            <li className="px-2 text-xs text-ink/50">אין מקצועות</li>
          )}
        </ul>
      )}
    </li>
  );
}
