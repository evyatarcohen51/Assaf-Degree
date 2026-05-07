// Color palette for subjects/courses.
// Picked in Settings → SubjectsSection, displayed as the top stripe on a slot
// in Schedule → WeeklyGrid.

// Order matches the topic-color picker in AddTopicDialog for visual consistency.
export const SUBJECT_COLORS = ['yellow', 'orange', 'red', 'purple', 'blue', 'green'] as const;
export type SubjectColor = (typeof SUBJECT_COLORS)[number];

export const SUBJECT_COLOR_BG: Record<SubjectColor, string> = {
  yellow: 'bg-yellow',
  orange: 'bg-orange',
  red: 'bg-red',
  purple: 'bg-purple',
  blue: 'bg-blue',
  green: 'bg-green',
};

export function isSubjectColor(value: string | null | undefined): value is SubjectColor {
  return typeof value === 'string' && (SUBJECT_COLORS as readonly string[]).includes(value);
}
