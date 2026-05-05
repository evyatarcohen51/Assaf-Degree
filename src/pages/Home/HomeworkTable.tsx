import { useState } from 'react';
import { useAllHomework, addHomework, setHomeworkStatus, deleteHomework } from '../../hooks/useHomework';
import { useAllSubjects } from '../../hooks/useTreeData';
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

export function HomeworkTable() {
  const items = useAllHomework();
  const subjects = useAllSubjects();
  const [task, setTask] = useState('');
  const [subjectId, setSubjectId] = useState('');

  const subjectName = (id: string) => subjects.find((s) => s.id === id)?.name ?? '—';

  async function handleAdd() {
    const trimmed = task.trim();
    if (!trimmed || !subjectId) return;
    await addHomework({ subjectId, task: trimmed });
    setTask('');
  }

  return (
    <div className="flex flex-col gap-3">
      {subjects.length > 0 && (
        <div className="flex flex-col md:flex-row gap-2">
          <select
            className="field md:max-w-xs"
            value={subjectId}
            onChange={(e) => setSubjectId(e.target.value)}
          >
            <option value="">— מקצוע —</option>
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
              <th className="border-b-2 border-ink p-2 text-start font-display uppercase">מקצוע</th>
              <th className="border-b-2 border-ink p-2 text-start font-display uppercase">משימה</th>
              <th className="border-b-2 border-ink p-2 text-start font-display uppercase">סטטוס</th>
              <th className="border-b-2 border-ink p-2"></th>
            </tr>
          </thead>
          <tbody>
            {items.map((it) => (
              <tr key={it.id} className="align-middle">
                <td className="border-b border-ink/20 p-2">
                  <bdi>{subjectName(it.subjectId)}</bdi>
                </td>
                <td className="border-b border-ink/20 p-2">
                  <bdi>{it.task}</bdi>
                </td>
                <td className="border-b border-ink/20 p-2">
                  <select
                    className={`rounded-full border-2 bg-cream px-3 py-1 font-display font-bold uppercase ${STATUS_GLOW[it.status]}`}
                    value={it.status}
                    onChange={(e) => setHomeworkStatus(it.id, e.target.value as HomeworkStatus)}
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
                    onClick={() => deleteHomework(it.id)}
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
