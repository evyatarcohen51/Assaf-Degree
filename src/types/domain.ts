export type Id = string;

export interface Settings {
  id: 'app';
  institutionName: string;
  currentYearId: Id | null;
  currentSemesterId: Id | null;
  bootstrapped: boolean;
}

export interface Profile {
  id: 'me';
  name: string;
  email: string;
  birthDate: string; // ISO yyyy-mm-dd
  pictureBlob?: Blob;
  pictureMime?: string;
}

export interface Year {
  id: Id;
  label: string; // e.g. תשפ"ו
  order: number;
}

export interface Semester {
  id: Id;
  yearId: Id;
  label: string; // e.g. סמסטר א'
  startDate: string; // ISO yyyy-mm-dd
  endDate: string; // ISO yyyy-mm-dd
}

export interface Subject {
  id: Id;
  semesterId: Id;
  name: string;
  color?: string;
}

export type HomeworkStatus = 'pending' | 'in_progress' | 'done';

export interface HomeworkItem {
  id: Id;
  subjectId: Id;
  task: string;
  status: HomeworkStatus;
  dueDate?: string;
  createdAt: number;
}

export type Weekday = 0 | 1 | 2 | 3 | 4 | 5 | 6; // 0 = ראשון

export interface ScheduleSlot {
  id: Id;
  semesterId: Id;
  subjectId: Id;
  weekday: Weekday;
  startMinutes: number;
  endMinutes: number;
  room?: string;
}

export interface FileRecord {
  id: Id;
  subjectId: Id;
  name: string;
  mimeType: string;
  size: number;
  blob: Blob;
  addedAt: number;
}

export interface NoteRecord {
  subjectId: Id;
  content: string;
  updatedAt: number;
}

export interface RecentFile {
  fileId: Id;
  openedAt: number;
}

export type DeadlineKind = 'exam' | 'assignment' | 'other';

export interface Deadline {
  id: Id;
  subjectId: Id;
  title: string;
  date: string; // ISO yyyy-mm-dd
  kind: DeadlineKind;
}
