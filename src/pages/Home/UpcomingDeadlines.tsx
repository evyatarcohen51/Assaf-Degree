import { useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../lib/auth';
import { useUpcomingDeadlines } from '../../hooks/useDeadlines';
import { useAllSubjects } from '../../hooks/useTreeData';
import { newId } from '../../lib/ids';
import { formatDateHe } from '../../lib/progress';
import { USE_SOFT_DESIGN } from '../../lib/design';
import { PencilIcon, TrashIcon, CalendarIcon, BellIcon } from '../../ui/icons';
import type { Deadline, DeadlineKind } from '../../types/domain';

const KIND_LABEL: Record<DeadlineKind, string> = {
  exam: 'מבחן',
  assignment: 'מטלה',
  other: 'אחר',
};

type RecurringPreset = '' | '1' | '7' | '30';
const RECURRING_LABEL: Record<RecurringPreset, string> = {
  '': 'לא חוזר',
  '1': 'כל יום',
  '7': 'כל שבוע',
  '30': 'כל חודש',
};

const OTHER_SUBJECT = '__other__';

function daysUntil(dateStr: string): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const deadline = new Date(dateStr + 'T00:00:00');
  return Math.round((deadline.getTime() - today.getTime()) / 864e5);
}

function dateBadgeClass(days: number): string {
  if (days < 0)
    return 'rounded-full border-2 border-ink/30 bg-ink/10 px-3 py-1 font-display font-bold text-ink/40';
  if (days <= 1)
    return 'rounded-full border-2 border-red bg-red px-3 py-1 font-display font-bold text-cream shadow-glow-red';
  if (days <= 7)
    return 'rounded-full border-2 border-orange bg-orange px-3 py-1 font-display font-bold text-cream shadow-glow-orange';
  return 'rounded-full border-2 border-green bg-green px-3 py-1 font-display font-bold text-cream shadow-glow-green';
}

function dateBadgeClassSoft(days: number): string {
  if (days < 0) return 'pill-soft-muted';
  if (days <= 1) return 'pill-soft-rose';
  if (days <= 7) return 'pill-soft-mustard';
  return 'pill-soft-green';
}

function toDatetimeLocal(iso: string) {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

// ── Reminder modal (used both for new-deadline reminder and edit) ──────────────
// Modals stay on the original sticker style for Phase 1; they get redesigned in Phase 5.
interface ReminderModalProps {
  reminderAt: string;
  setReminderAt: (v: string) => void;
  recurring: RecurringPreset;
  setRecurring: (v: RecurringPreset) => void;
  onClose: () => void;
  onConfirm: () => void;
}

function ReminderModal({ reminderAt, setReminderAt, recurring, setRecurring, onClose, onConfirm }: ReminderModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/30 p-4" onClick={onClose}>
      <div
        className="w-full max-w-sm rounded-2xl border-2 border-ink bg-cream p-5 flex flex-col gap-4"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="font-bold text-lg">תזכורת במייל</h2>
        <label className="flex flex-col gap-1">
          <span className="text-sm">שלח תזכורת ב-</span>
          <input
            type="datetime-local"
            className="field"
            value={reminderAt}
            onChange={(e) => setReminderAt(e.target.value)}
          />
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-sm">חזרה</span>
          <select
            className="field"
            value={recurring}
            onChange={(e) => setRecurring(e.target.value as RecurringPreset)}
          >
            {(Object.keys(RECURRING_LABEL) as RecurringPreset[]).map((k) => (
              <option key={k} value={k}>
                {RECURRING_LABEL[k]}
              </option>
            ))}
          </select>
        </label>
        <div className="flex gap-2 justify-start">
          <button type="button" className="btn" onClick={onConfirm}>
            אישור
          </button>
          <button type="button" className="btn-secondary" onClick={onClose}>
            ביטול
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Edit deadline modal ────────────────────────────────────────────────────────
interface EditModalProps {
  deadline: Deadline;
  subjects: ReturnType<typeof useAllSubjects>;
  onClose: () => void;
  onSave: (updates: Partial<Omit<Deadline, 'id' | 'user_id'>>) => Promise<void>;
}

function EditDeadlineModal({ deadline, subjects, onClose, onSave }: EditModalProps) {
  const [title, setTitle] = useState(deadline.title);
  const [date, setDate] = useState(deadline.date);
  const [subjectId, setSubjectId] = useState(deadline.subject_id ?? OTHER_SUBJECT);
  const [kind, setKind] = useState<DeadlineKind>(deadline.kind);
  const [showReminder, setShowReminder] = useState(!!deadline.reminder_email_at);
  const [reminderAt, setReminderAt] = useState(
    deadline.reminder_email_at ? toDatetimeLocal(deadline.reminder_email_at) : '',
  );
  const [recurring, setRecurring] = useState<RecurringPreset>(
    String(deadline.reminder_recurring_days ?? '') as RecurringPreset,
  );

  async function handleSave() {
    if (!title.trim() || !date) return;
    const newReminderAt = showReminder && reminderAt ? new Date(reminderAt).toISOString() : null;
    // If the reminder time changed, reset reminder_sent_at so the cron will fire again.
    const sameTime = newReminderAt === deadline.reminder_email_at;
    await onSave({
      title: title.trim(),
      date,
      subject_id: subjectId === OTHER_SUBJECT ? null : subjectId,
      kind,
      reminder_email_at: newReminderAt,
      reminder_recurring_days: showReminder && recurring ? Number(recurring) : null,
      reminder_sent_at: showReminder && sameTime ? deadline.reminder_sent_at : null,
    });
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/30 p-4" onClick={onClose}>
      <div
        className="w-full max-w-md rounded-2xl border-2 border-ink bg-cream p-5 flex flex-col gap-4"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="font-bold text-lg">ערוך מועד</h2>

        <div className="flex flex-col gap-2">
          <input
            className="field"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="כותרת"
            dir="auto"
          />
          <div className="grid grid-cols-2 gap-2">
            <select className="field" value={subjectId} onChange={(e) => setSubjectId(e.target.value)}>
              <option value="">— קורס —</option>
              {subjects.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
              <option value={OTHER_SUBJECT}>אחר</option>
            </select>
            <select className="field" value={kind} onChange={(e) => setKind(e.target.value as DeadlineKind)}>
              <option value="exam">מבחן</option>
              <option value="assignment">מטלה</option>
              <option value="other">אחר</option>
            </select>
          </div>
          <input
            type="date"
            className="field"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
        </div>

        <div className="border-t border-ink/20 pt-3 flex flex-col gap-2">
          <button
            type="button"
            className="text-sm underline text-ink/70 text-start"
            onClick={() => setShowReminder((v) => !v)}
          >
            {showReminder ? 'הסר תזכורת במייל' : 'הוסף תזכורת במייל'}
          </button>
          {showReminder && (
            <div className="grid grid-cols-2 gap-2">
              <label className="flex flex-col gap-1">
                <span className="text-sm">שלח ב-</span>
                <input
                  type="datetime-local"
                  className="field"
                  value={reminderAt}
                  onChange={(e) => setReminderAt(e.target.value)}
                />
              </label>
              <label className="flex flex-col gap-1">
                <span className="text-sm">חזרה</span>
                <select
                  className="field"
                  value={recurring}
                  onChange={(e) => setRecurring(e.target.value as RecurringPreset)}
                >
                  {(Object.keys(RECURRING_LABEL) as RecurringPreset[]).map((k) => (
                    <option key={k} value={k}>
                      {RECURRING_LABEL[k]}
                    </option>
                  ))}
                </select>
              </label>
            </div>
          )}
        </div>

        <div className="flex gap-2 justify-start">
          <button type="button" className="btn" onClick={handleSave}>
            שמור
          </button>
          <button type="button" className="btn-secondary" onClick={onClose}>
            ביטול
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main component ─────────────────────────────────────────────────────────────
export function UpcomingDeadlines() {
  const { user } = useAuth();
  const deadlines = useUpcomingDeadlines();
  const subjects = useAllSubjects();
  const subjectName = (id: string | null) =>
    id ? (subjects.find((s) => s.id === id)?.name ?? '—') : 'אחר';

  // new deadline form
  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');
  const [subjectId, setSubjectId] = useState('');
  const [kind, setKind] = useState<DeadlineKind>('exam');

  // pending reminder for the new deadline (set via modal, applied on add)
  const [pendingReminderAt, setPendingReminderAt] = useState('');
  const [pendingRecurring, setPendingRecurring] = useState<RecurringPreset>('');
  const [showNewReminderModal, setShowNewReminderModal] = useState(false);

  // edit modal
  const [editingDeadline, setEditingDeadline] = useState<Deadline | null>(null);

  async function handleAdd() {
    if (!user) return;
    if (!title.trim() || !date || !subjectId) return;
    await supabase.from('deadlines').insert({
      id: newId(),
      user_id: user.id,
      subject_id: subjectId === OTHER_SUBJECT ? null : subjectId,
      title: title.trim(),
      date,
      kind,
      reminder_email_at: pendingReminderAt ? new Date(pendingReminderAt).toISOString() : null,
      reminder_recurring_days: pendingReminderAt && pendingRecurring ? Number(pendingRecurring) : null,
      reminder_sent_at: null,
    });
    setTitle('');
    setDate('');
    setPendingReminderAt('');
    setPendingRecurring('');
  }

  async function handleRemove(id: string) {
    if (!user) return;
    await supabase.from('deadlines').delete().eq('user_id', user.id).eq('id', id);
  }

  async function handleSaveEdit(id: string, updates: Partial<Omit<Deadline, 'id' | 'user_id'>>) {
    if (!user) return;
    await supabase.from('deadlines').update(updates).eq('user_id', user.id).eq('id', id);
  }

  const hasReminder = pendingReminderAt !== '';

  if (USE_SOFT_DESIGN) {
    return (
      <div className="flex flex-col gap-4">
        {subjects.length > 0 && (
          <div className="flex flex-col gap-2">
            <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
              <input
                className="field-soft"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="כותרת"
                dir="auto"
              />
              <select
                className="field-soft"
                value={subjectId}
                onChange={(e) => setSubjectId(e.target.value)}
              >
                <option value="">— קורס —</option>
                {subjects.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
                <option value={OTHER_SUBJECT}>אחר</option>
              </select>
              <select
                className="field-soft"
                value={kind}
                onChange={(e) => setKind(e.target.value as DeadlineKind)}
              >
                <option value="exam">מבחן</option>
                <option value="assignment">מטלה</option>
                <option value="other">אחר</option>
              </select>
              <div className="relative">
                <input
                  type="date"
                  className="field-soft pe-9"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                />
                <CalendarIcon
                  size={16}
                  className="absolute end-3 top-1/2 -translate-y-1/2 text-soft-muted pointer-events-none"
                />
              </div>
              <button type="button" className="btn-soft-primary" onClick={handleAdd}>
                הוסף
              </button>
            </div>

            <div>
              <button
                type="button"
                className="text-sm underline text-soft-muted hover:text-soft-text transition"
                onClick={() => setShowNewReminderModal(true)}
              >
                {hasReminder ? '✓ תזכורת במייל מוגדרת' : 'הוסף תזכורת במייל'}
              </button>
            </div>
          </div>
        )}

        <ul className="flex flex-col gap-2.5">
          {deadlines.map((d) => (
            <li key={d.id} className="row-soft">
              <div className="min-w-0 flex-1">
                <div className="font-medium text-soft-text">
                  <bdi>{d.title}</bdi>{' '}
                  <span className="text-xs text-soft-muted">({KIND_LABEL[d.kind]})</span>
                </div>
                <div className="text-xs text-soft-muted mt-0.5">
                  <bdi>{subjectName(d.subject_id)}</bdi>
                  {d.reminder_email_at && (
                    <span className="ms-2 inline-flex items-center gap-1">
                      <BellIcon size={12} />
                      {d.reminder_recurring_days ? `כל ${d.reminder_recurring_days} ימים` : 'תזכורת'}
                    </span>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2 ms-3">
                <div className="flex flex-col items-center gap-0.5">
                  <span className={dateBadgeClassSoft(daysUntil(d.date))}>
                    {formatDateHe(d.date)}
                  </span>
                  {daysUntil(d.date) < 0 && (
                    <span className="text-[10px] text-soft-muted font-medium">עבר</span>
                  )}
                </div>
                <button
                  type="button"
                  className="icon-btn-soft-edit"
                  onClick={() => setEditingDeadline(d)}
                  aria-label="ערוך מועד"
                >
                  <PencilIcon size={16} />
                </button>
                <button
                  type="button"
                  className="icon-btn-soft-danger"
                  onClick={() => handleRemove(d.id)}
                  aria-label="מחק מועד"
                >
                  <TrashIcon size={16} />
                </button>
              </div>
            </li>
          ))}
          {deadlines.length === 0 && (
            <li className="text-sm text-soft-muted py-3">אין מועדים קרובים</li>
          )}
        </ul>

        {showNewReminderModal && (
          <ReminderModal
            reminderAt={pendingReminderAt}
            setReminderAt={setPendingReminderAt}
            recurring={pendingRecurring}
            setRecurring={setPendingRecurring}
            onClose={() => setShowNewReminderModal(false)}
            onConfirm={() => setShowNewReminderModal(false)}
          />
        )}

        {editingDeadline && (
          <EditDeadlineModal
            deadline={editingDeadline}
            subjects={subjects}
            onClose={() => setEditingDeadline(null)}
            onSave={(updates) => handleSaveEdit(editingDeadline.id, updates)}
          />
        )}
      </div>
    );
  }

  // Original sticker design
  return (
    <div className="flex flex-col gap-3">
      {subjects.length > 0 && (
        <div className="flex flex-col gap-2">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
            <input
              className="field"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="כותרת"
              dir="auto"
            />
            <select
              className="field"
              value={subjectId}
              onChange={(e) => setSubjectId(e.target.value)}
            >
              <option value="">— קורס —</option>
              {subjects.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
              <option value={OTHER_SUBJECT}>אחר</option>
            </select>
            <select
              className="field"
              value={kind}
              onChange={(e) => setKind(e.target.value as DeadlineKind)}
            >
              <option value="exam">מבחן</option>
              <option value="assignment">מטלה</option>
              <option value="other">אחר</option>
            </select>
            <input
              type="date"
              className="field"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
            <button type="button" className="btn" onClick={handleAdd}>
              הוסף
            </button>
          </div>

          <div>
            <button
              type="button"
              className="text-sm underline text-ink/70"
              onClick={() => setShowNewReminderModal(true)}
            >
              {hasReminder ? '✓ תזכורת במייל מוגדרת' : 'הוסף תזכורת במייל'}
            </button>
          </div>
        </div>
      )}

      <ul className="flex flex-col gap-2">
        {deadlines.map((d) => (
          <li
            key={d.id}
            className="flex items-center justify-between rounded-xl border-2 border-ink bg-paper px-3 py-2"
          >
            <div>
              <div className="font-bold">
                <bdi>{d.title}</bdi>{' '}
                <span className="text-xs text-ink/60">({KIND_LABEL[d.kind]})</span>
              </div>
              <div className="text-xs text-ink/60">
                <bdi>{subjectName(d.subject_id)}</bdi>
                {d.reminder_email_at && (
                  <span className="ms-2">
                    📧{d.reminder_recurring_days ? ` כל ${d.reminder_recurring_days} ימים` : ' תזכורת'}
                  </span>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex flex-col items-center gap-0.5">
                <span className={dateBadgeClass(daysUntil(d.date))}>
                  {formatDateHe(d.date)}
                </span>
                {daysUntil(d.date) < 0 && (
                  <span className="text-[10px] text-ink/40 font-bold">עבר</span>
                )}
              </div>
              <button
                type="button"
                className="btn-secondary !px-3 !py-1 text-sm"
                onClick={() => setEditingDeadline(d)}
              >
                ערוך
              </button>
              <button
                type="button"
                className="btn-secondary !px-3 !py-1 text-sm"
                onClick={() => handleRemove(d.id)}
              >
                מחק
              </button>
            </div>
          </li>
        ))}
        {deadlines.length === 0 && (
          <li className="text-sm text-ink/50">אין מועדים קרובים</li>
        )}
      </ul>

      {showNewReminderModal && (
        <ReminderModal
          reminderAt={pendingReminderAt}
          setReminderAt={setPendingReminderAt}
          recurring={pendingRecurring}
          setRecurring={setPendingRecurring}
          onClose={() => setShowNewReminderModal(false)}
          onConfirm={() => setShowNewReminderModal(false)}
        />
      )}

      {editingDeadline && (
        <EditDeadlineModal
          deadline={editingDeadline}
          subjects={subjects}
          onClose={() => setEditingDeadline(null)}
          onSave={(updates) => handleSaveEdit(editingDeadline.id, updates)}
        />
      )}
    </div>
  );
}
