import { useParams } from 'react-router-dom';
import { WeeklyGrid } from './WeeklyGrid';
import { MonthlyCalendar } from './MonthlyCalendar';
import { USE_SOFT_DESIGN } from '../../lib/design';
import { CalendarIcon } from '../../ui/icons';

export function SchedulePage() {
  const { semId } = useParams<{ yearId: string; semId: string }>();
  if (!semId) return null;

  if (USE_SOFT_DESIGN) {
    return (
      <div className="flex flex-col gap-7">
        <header className="card-soft-hero flex flex-col items-center text-center">
          <h1 className="text-3xl md:text-4xl font-display font-black text-soft-text">מערכת שעות</h1>
        </header>
        <section className="card-soft">
          <h2 className="flex items-center gap-2 text-xl font-bold text-soft-text mb-5">
            <span>מערכת שבועית</span>
            <span className="text-soft-muted"><CalendarIcon size={20} /></span>
          </h2>
          <WeeklyGrid semesterId={semId} />
        </section>
        <section className="card-soft">
          <h2 className="flex items-center gap-2 text-xl font-bold text-soft-text mb-5">
            <span>לוח שנה חודשי</span>
            <span className="text-soft-muted"><CalendarIcon size={20} /></span>
          </h2>
          <MonthlyCalendar semesterId={semId} />
        </section>
      </div>
    );
  }

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
