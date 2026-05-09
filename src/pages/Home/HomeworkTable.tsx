import { useState } from 'react';
import { useAuth } from '../../lib/auth';
import {
  useAllHomework,
  addHomework,
  setHomeworkStatus,
  deleteHomework,
} from '../../hooks/useHomework';
import { useAllSubjects } from '../../hooks/useTreeData';
import { USE_SOFT_DESIGN } from '../../lib/design';
import { TrashIcon } from '../../ui/icons';
import type { HomeworkStatus } from '../../types/domain';

const STATUS_LABEL: Record<HomeworkStatus, string> = {
  pending: 'ממתין לביצוע',
  in_progress: 'בתהליך',
  done: 'בוצע',
};

const STATUS_GLOW: Record<HomeworkStatus, string> = {
  pending: 'glow-red',
  in_progress: 'glow-yellow',
  done: 'glow-green',
};

const STATUS_PILL_SOFT: Record<HomeworkStatus, string> = {
  pending: 'pill-soft-rose',
  in_progress: 'pill-soft-mustard',
  done: 'pill-soft-green',
};

export function HomeworkTable() {
  const { user } = useAuth();
  const items = useAllHomework();
  const subjects = useAllSubjects();
  const [task, setTask] = useState('');
  const [subjectId, setSubjectId] = useState('');

  const subjectName = (id: string) => subjects.find((s) => s.id === id)?.name ?? '—';

  async function handleAdd() {
    if (!user) return;
    const trimmed = task.trim();
    if (!trimmed || !subjectId) return;
    await addHomework({ user_id: user.id, subjectId, task: trimmed });
    setTask('');
  }

  if (USE_SOFT_DESIGN) {
    return (
      <div className="flex flex-col gap-4">
        {subjects.length > 0 && (
          <div className="flex flex-col md:flex-row gap-2">
            <select
              className="field-soft md:max-w-xs"
              value={subjectId}
              onChange={(e) => setSubjectId(e.target.value)}
            >
              <option value="">— קורס —</option>
              {subjects.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
            <input
              className="field-soft flex-1"
              value={task}
              onChange={(e) => setTask(e.target.value)}
              placeholder="משימה חדשה (Enter)"
              dir="auto"
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleAdd();
              }}
            />
            <button type="button" className="btn-soft-primary" onClick={handleAdd}>
              הוסף
            </button>
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr>
                <th className="border-b border-soft-border py-3 ps-3 text-start text-soft-muted text-sm font-medium">קורס</th>
                <th className="border-b border-soft-border py-3 text-start text-soft-muted text-sm font-medium">משימה</th>
                <th className="border-b border-soft-border py-3 text-center text-soft-muted text-sm font-medium">סטטוס</th>
                <th className="border-b border-soft-border py-3 pe-3"></th>
              </tr>
            </thead>
            <tbody>
              {items.map((it) => (
                <tr key={it.id} className="align-middle">
                  <td className="border-b border-soft-border py-3 ps-3 text-soft-text">
                    <bdi>{subjectName(it.subject_id)}</bdi>
                  </td>
                  <td className="border-b border-soft-border py-3 text-soft-text">
                    <bdi>{it.task}</bdi>
                  </td>
                  <td className="border-b border-soft-border py-3 text-center">
                    <select
                      className={`${STATUS_PILL_SOFT[it.status]} cursor-pointer outline-none border-0 appearance-none`}
                      value={it.status}
                      onChange={(e) => {
                        if (user) setHomeworkStatus(user.id, it.id, e.target.value as HomeworkStatus);
                      }}
                    >
                      {(['pending', 'in_progress', 'done'] as const).map((s) => (
                        <option key={s} value={s}>
                          {STATUS_LABEL[s]}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="border-b border-soft-border py-3 pe-3 text-end">
                    <button
                      type="button"
                      onClick={() => {
                        if (user) deleteHomework(user.id, it.id);
                      }}
                      className="icon-btn-soft-danger"
                      aria-label="מחק שיעור בית"
                    >
                      <TrashIcon size={16} />
                    </button>
                  </td>
                </tr>
              ))}
              {items.length === 0 && (
                <tr>
                  <td colSpan={4} className="py-6 text-center text-soft-muted">
                    אין שיעורי בית עדיין
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  // Original sticker design
  return (
    <div className="flex flex-col gap-3">
      {subjects.length > 0 && (
        <div className="flex flex-col md:flex-row gap-2">
          <select
            className="field md:max-w-xs"
            value={subjectId}
            onChange={(e) => setSubjectId(e.target.value)}
          >
            <option value="">— קורס —</option>
            {subjects.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
          <input
            className="field flex-1"
            value={task}
            onChange={(e) => setTask(e.target.value)}
            placeholder="משימה חדשה (Enter)"
            dir="auto"
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleAdd();
            }}
          />
          <button type="button" className="btn" onClick={handleAdd}>
            הוסף
          </button>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="text-start">
              <th className="border-b-2 border-ink p-2 text-start font-display uppercase">קורס</th>
              <th className="border-b-2 border-ink p-2 text-start font-display uppercase">משימה</th>
              <th className="border-b-2 border-ink p-2 text-start font-display uppercase">סטטוס</th>
              <th className="border-b-2 border-ink p-2"></th>
            </tr>
          </thead>
          <tbody>
            {items.map((it) => (
              <tr key={it.id} className="align-middle">
                <td className="border-b border-ink/20 p-2">
                  <bdi>{subjectName(it.subject_id)}</bdi>
                </td>
                <td className="border-b border-ink/20 p-2">
                  <bdi>{it.task}</bdi>
                </td>
                <td className="border-b border-ink/20 p-2">
                  <select
                    className={`rounded-full border-2 bg-cream px-3 py-1 font-display font-bold uppercase ${STATUS_GLOW[it.status]}`}
                    value={it.status}
                    onChange={(e) => {
                      if (user) setHomeworkStatus(user.id, it.id, e.target.value as HomeworkStatus);
                    }}
                  >
                    {(['pending', 'in_progress', 'done'] as const).map((s) => (
                      <option key={s} value={s}>
                        {STATUS_LABEL[s]}
                      </option>
                    ))}
                  </select>
                </td>
                <td className="border-b border-ink/20 p-2 text-end">
                  <button
                    type="button"
                    onClick={() => {
                      if (user) deleteHomework(user.id, it.id);
                    }}
                    className="btn-secondary !px-3 !py-1 text-sm"
                  >
                    מחק
                  </button>
                </td>
              </tr>
            ))}
            {items.length === 0 && (
              <tr>
                <td colSpan={4} className="p-4 text-center text-ink/50">
                  אין שיעורי בית עדיין
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
