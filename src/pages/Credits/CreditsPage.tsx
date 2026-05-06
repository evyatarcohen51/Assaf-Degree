import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAllSubjects, useAllSemesters, useYears } from '../../hooks/useTreeData';
import { useAllGrades, computeFinalGrade } from '../../hooks/useGrades';
import { r } from '../../lib/routes';
import type { Grade, Subject } from '../../types/domain';

interface CourseRow {
  subject: Subject;
  yearLabel: string;
  yearId: string;
  semesterLabel: string;
  semesterId: string;
  grades: Grade[];
  finalGrade: number | null;
  contribution: number; // final * credits (raw, before normalization)
}

export function CreditsPage() {
  const subjects = useAllSubjects();
  const semesters = useAllSemesters();
  const years = useYears();
  const allGrades = useAllGrades();

  const [yearFilter, setYearFilter] = useState<string>('');
  const [semFilter, setSemFilter] = useState<string>('');

  const yearById = useMemo(() => new Map(years.map((y) => [y.id, y])), [years]);
  const semById = useMemo(() => new Map(semesters.map((s) => [s.id, s])), [semesters]);
  const gradesBySubject = useMemo(() => {
    const map = new Map<string, Grade[]>();
    for (const g of allGrades) {
      const arr = map.get(g.subject_id) ?? [];
      arr.push(g);
      map.set(g.subject_id, arr);
    }
    return map;
  }, [allGrades]);

  const rows = useMemo<CourseRow[]>(() => {
    return subjects.map((subject) => {
      const sem = semById.get(subject.semester_id);
      const yearId = sem?.year_id ?? '';
      const year = yearById.get(yearId);
      const grades = gradesBySubject.get(subject.id) ?? [];
      const finalGrade = computeFinalGrade(grades);
      return {
        subject,
        yearLabel: year?.label ?? '—',
        yearId,
        semesterLabel: sem?.label ?? '—',
        semesterId: sem?.id ?? '',
        grades,
        finalGrade,
        contribution: finalGrade !== null ? finalGrade * subject.credit_points : 0,
      };
    });
  }, [subjects, semById, yearById, gradesBySubject]);

  const filtered = useMemo(() => {
    return rows.filter((r) => {
      if (yearFilter && r.yearId !== yearFilter) return false;
      if (semFilter && r.semesterId !== semFilter) return false;
      return true;
    });
  }, [rows, yearFilter, semFilter]);

  // GPA: sum(final * credits) / sum(credits), only over courses that have a final grade
  const courseWithGrades = filtered.filter((r) => r.finalGrade !== null && r.subject.credit_points > 0);
  const totalCreditsForGpa = courseWithGrades.reduce(
    (sum, r) => sum + r.subject.credit_points,
    0,
  );
  const gpa =
    totalCreditsForGpa > 0
      ? courseWithGrades.reduce((sum, r) => sum + r.contribution, 0) / totalCreditsForGpa
      : null;

  const totalCredits = filtered.reduce((sum, r) => sum + r.subject.credit_points, 0);

  return (
    <div className="flex flex-col gap-6">
      <header className="card bg-purple text-cream">
        <h1 className="text-3xl">נקודות זכות</h1>
        <p className="text-sm opacity-80 mt-1">סיכום ציוני הקורסים, נקודות זכות ו-GPA</p>
      </header>

      <section className="card">
        <div className="flex flex-col md:flex-row gap-2 mb-3">
          <select
            className="field md:max-w-xs"
            value={yearFilter}
            onChange={(e) => {
              setYearFilter(e.target.value);
              setSemFilter('');
            }}
          >
            <option value="">— כל השנים —</option>
            {years.map((y) => (
              <option key={y.id} value={y.id}>
                {y.label}
              </option>
            ))}
          </select>
          <select
            className="field md:max-w-xs"
            value={semFilter}
            onChange={(e) => setSemFilter(e.target.value)}
          >
            <option value="">— כל הסמסטרים —</option>
            {semesters
              .filter((s) => !yearFilter || s.year_id === yearFilter)
              .map((s) => (
                <option key={s.id} value={s.id}>
                  {yearById.get(s.year_id)?.label ?? '—'} · {s.label}
                </option>
              ))}
          </select>
        </div>

        {filtered.length === 0 ? (
          <p className="text-sm text-ink/50">אין קורסים להצגה</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr>
                  <th className="border-b-2 border-ink p-2 text-start font-display uppercase">קורס</th>
                  <th className="border-b-2 border-ink p-2 text-start font-display uppercase">שנה</th>
                  <th className="border-b-2 border-ink p-2 text-start font-display uppercase">סמסטר</th>
                  <th className="border-b-2 border-ink p-2 text-start font-display uppercase">ציון סופי</th>
                  <th className="border-b-2 border-ink p-2 text-start font-display uppercase">נק' זכות</th>
                  <th className="border-b-2 border-ink p-2 text-start font-display uppercase">תרומה</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((row) => (
                  <tr key={row.subject.id} className="align-middle">
                    <td className="border-b border-ink/20 p-2 font-bold">
                      <Link
                        to={r.subject(row.yearId, row.semesterId, row.subject.id)}
                        className="underline"
                      >
                        <bdi>{row.subject.name}</bdi>
                      </Link>
                    </td>
                    <td className="border-b border-ink/20 p-2 text-sm">{row.yearLabel}</td>
                    <td className="border-b border-ink/20 p-2 text-sm">{row.semesterLabel}</td>
                    <td className="border-b border-ink/20 p-2 text-sm">
                      {row.finalGrade !== null ? row.finalGrade.toFixed(2) : '—'}
                    </td>
                    <td className="border-b border-ink/20 p-2 text-sm">
                      {row.subject.credit_points}
                    </td>
                    <td className="border-b border-ink/20 p-2 text-sm text-ink/60">
                      {row.finalGrade !== null && row.subject.credit_points > 0
                        ? row.contribution.toFixed(2)
                        : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="rounded-xl border-2 border-ink bg-yellow p-3">
            <div className="text-sm font-display uppercase tracking-wide">GPA (משוקלל)</div>
            <div className="text-3xl font-black">
              {gpa !== null ? gpa.toFixed(2) : '—'}
            </div>
          </div>
          <div className="rounded-xl border-2 border-ink bg-green text-cream p-3">
            <div className="text-sm font-display uppercase tracking-wide">סך נקודות זכות</div>
            <div className="text-3xl font-black">{totalCredits}</div>
          </div>
        </div>
      </section>
    </div>
  );
}
