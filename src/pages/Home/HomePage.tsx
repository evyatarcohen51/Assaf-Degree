import { CurrentTrackHeader } from './CurrentTrackHeader';
import { SemesterProgressBar } from './SemesterProgressBar';
import { HomeworkTable } from './HomeworkTable';
import { RecentFilesList } from './RecentFilesList';
import { UpcomingDeadlines } from './UpcomingDeadlines';
import { USE_SOFT_DESIGN } from '../../lib/design';
import { PencilIcon, FolderIcon, BellIcon } from '../../ui/icons';

export function HomePage() {
  if (USE_SOFT_DESIGN) {
    return (
      <div className="flex flex-col gap-7">
        <CurrentTrackHeader />
        <SemesterProgressBar />

        <section className="card-soft">
          <SectionTitle text="שיעורי בית" icon={<PencilIcon size={20} />} />
          <HomeworkTable />
        </section>

        <section className="card-soft">
          <SectionTitle text="קבצים אחרונים שנפתחו" icon={<FolderIcon size={20} />} />
          <RecentFilesList />
        </section>

        <section className="card-soft">
          <SectionTitle text="מועדים קרובים" icon={<BellIcon size={20} />} />
          <UpcomingDeadlines />
        </section>
      </div>
    );
  }

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

function SectionTitle({ text, icon }: { text: string; icon: React.ReactNode }) {
  return (
    <h2 className="flex items-center gap-2 text-xl font-bold text-soft-text mb-5">
      <span>{text}</span>
      <span className="text-soft-muted">{icon}</span>
    </h2>
  );
}
