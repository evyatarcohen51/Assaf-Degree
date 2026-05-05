import Dexie, { type Table } from 'dexie';
import type {
  Settings,
  Profile,
  Year,
  Semester,
  Subject,
  HomeworkItem,
  ScheduleSlot,
  FileRecord,
  NoteRecord,
  RecentFile,
  Deadline,
} from '../types/domain';

export class GotSchooledDB extends Dexie {
  settings!: Table<Settings, 'app'>;
  profile!: Table<Profile, 'me'>;
  years!: Table<Year, string>;
  semesters!: Table<Semester, string>;
  subjects!: Table<Subject, string>;
  homework!: Table<HomeworkItem, string>;
  scheduleSlots!: Table<ScheduleSlot, string>;
  files!: Table<FileRecord, string>;
  notes!: Table<NoteRecord, string>;
  recentFiles!: Table<RecentFile, string>;
  deadlines!: Table<Deadline, string>;

  constructor() {
    super('GotSchooledDB');
    this.version(1).stores({
      settings: '&id',
      profile: '&id',
      years: '&id, order',
      semesters: '&id, yearId, startDate, endDate',
      subjects: '&id, semesterId, name',
      homework: '&id, subjectId, status, dueDate, createdAt',
      scheduleSlots: '&id, semesterId, subjectId, [semesterId+weekday]',
      files: '&id, subjectId, addedAt, name',
      notes: '&subjectId',
      recentFiles: '&fileId, openedAt',
      deadlines: '&id, subjectId, date',
    });

    this.on('populate', async () => {
      await this.settings.add({
        id: 'app',
        institutionName: '',
        currentYearId: null,
        currentSemesterId: null,
        bootstrapped: false,
      });
      await this.profile.add({
        id: 'me',
        name: '',
        email: '',
        birthDate: '',
      });
    });
  }
}

export const db = new GotSchooledDB();
