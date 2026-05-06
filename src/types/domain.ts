export type Id = string;

export interface Settings {
  user_id: string;
  institution_name: string;
  current_year_id: string | null;
  current_semester_id: string | null;
  bootstrapped: boolean;
  must_change_password: boolean;
  updated_at: string;
}

export interface Profile {
  user_id: string;
  name: string;
  email: string;
  birth_date: string | null;
  picture_path: string | null;
  picture_mime: string | null;
  updated_at: string;
}

export interface Year {
  id: Id;
  user_id: string;
  label: string;
  order: number;
}

export interface Semester {
  id: Id;
  user_id: string;
  year_id: Id;
  label: string;
  start_date: string | null;
  end_date: string | null;
}

export interface Subject {
  id: Id;
  user_id: string;
  semester_id: Id;
  name: string;
  color: string | null;
}

export type HomeworkStatus = 'pending' | 'in_progress' | 'done';

export interface HomeworkItem {
  id: Id;
  user_id: string;
  subject_id: Id;
  task: string;
  status: HomeworkStatus;
  due_date: string | null;
  created_at: string;
}

export type Weekday = 0 | 1 | 2 | 3 | 4 | 5 | 6;

export interface ScheduleSlot {
  id: Id;
  user_id: string;
  semester_id: Id;
  subject_id: Id;
  weekday: Weekday;
  start_minutes: number;
  end_minutes: number;
  room: string | null;
}

export interface FileRecord {
  id: Id;
  user_id: string;
  subject_id: Id;
  name: string;
  mime_type: string;
  size: number;
  storage_path: string;
  added_at: string;
}

export interface NoteRecord {
  user_id: string;
  subject_id: Id;
  content: string;
  updated_at: string;
}

export interface RecentFile {
  user_id: string;
  file_id: Id;
  opened_at: string;
}

export type DeadlineKind = 'exam' | 'assignment' | 'other';

export interface Deadline {
  id: Id;
  user_id: string;
  subject_id: Id;
  title: string;
  date: string;
  kind: DeadlineKind;
}
