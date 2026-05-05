import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db';
import type { HomeworkItem, HomeworkStatus } from '../types/domain';
import { newId } from '../lib/ids';

export function useAllHomework() {
  return useLiveQuery(() => db.homework.orderBy('createdAt').reverse().toArray(), []) ?? [];
}

export async function addHomework(input: { subjectId: string; task: string; dueDate?: string }) {
  const item: HomeworkItem = {
    id: newId(),
    subjectId: input.subjectId,
    task: input.task,
    status: 'pending',
    dueDate: input.dueDate,
    createdAt: Date.now(),
  };
  await db.homework.add(item);
  return item;
}

export async function setHomeworkStatus(id: string, status: HomeworkStatus) {
  await db.homework.update(id, { status });
}

export async function deleteHomework(id: string) {
  await db.homework.delete(id);
}
