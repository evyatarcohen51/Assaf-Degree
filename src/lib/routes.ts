import type { Id } from '../types/domain';

export const r = {
  home: () => '/',
  schedule: (yearId: Id, semId: Id) => `/year/${yearId}/semester/${semId}/schedule`,
  subject: (yearId: Id, semId: Id, subjectId: Id) =>
    `/year/${yearId}/semester/${semId}/subject/${subjectId}`,
  topic: (yearId: Id, semId: Id, subjectId: Id, topicId: Id) =>
    `/year/${yearId}/semester/${semId}/subject/${subjectId}/topic/${topicId}`,
  subjectSchedule: (yearId: Id, semId: Id, subjectId: Id) =>
    `/year/${yearId}/semester/${semId}/subject/${subjectId}/schedule`,
  profile: () => '/profile',
  settings: () => '/settings',
  credits: () => '/credits',
};
