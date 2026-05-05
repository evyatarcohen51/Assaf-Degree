import { useParams } from 'react-router-dom';
import { WeeklyGrid } from './WeeklyGrid';
import { MonthlyCalendar } from './MonthlyCalendar';

export function SchedulePage() {
  const { semId } = useParams<{ yearId: string; semId: string }>();
  if (!semId) return null;

  return (
    <div className="flex flex-col gap-6">
      <header className="card bg-yellow">
        <h1 className="text-3xl">מערכת שעות</h1>
      </header>
      <section className="card">
        <h2 className="text-xl mb-3">מערכת שבועית</h2>
        <WeeklyGrid semesterId={semId} />
      </section>
      <section className="card">
        <h2 className="text-xl mb-3">לוח שנה חודשי</h2>
        <MonthlyCalendar semesterId={semId} />
      </section>
    </div>
  );
}
