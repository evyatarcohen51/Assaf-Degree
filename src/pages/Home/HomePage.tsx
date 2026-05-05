import { CurrentTrackHeader } from './CurrentTrackHeader';
import { SemesterProgressBar } from './SemesterProgressBar';
import { HomeworkTable } from './HomeworkTable';
import { RecentFilesList } from './RecentFilesList';
import { UpcomingDeadlines } from './UpcomingDeadlines';

export function HomePage() {
  return (
    <div className="flex flex-col gap-6">
      <CurrentTrackHeader />
      <SemesterProgressBar />

      <section className="card">
        <h2 className="text-xl mb-3">שיעורי בית</h2>
        <HomeworkTable />
      </section>

      <section className="card">
        <h2 className="text-xl mb-3">קבצים אחרונים שנפתחו</h2>
        <RecentFilesList />
      </section>

      <section className="card">
        <h2 className="text-xl mb-3">מועדים קרובים</h2>
        <UpcomingDeadlines />
      </section>
    </div>
  );
}
