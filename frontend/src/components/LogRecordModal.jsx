import { useState } from 'react';
import { X, Paperclip } from 'lucide-react';
import { BEHAVIOR_OPTIONS } from '../lib/status';

const emptyForm = {
  flockId: '',
  feedKg: '',
  waterL: '',
  mortality: '',
  eggCount: '',
  weightGainG: '',
  temperature: '',
  humidity: '',
  behavior: 'normal',
  notes: '',
};

function Field({ label, children }) {
  return (
    <label className="flex flex-col gap-1.5 text-sm">
      <span className="text-ink-soft">{label}</span>
      {children}
    </label>
  );
}

const inputClass =
  'rounded-lg border border-border bg-card px-3 py-2 text-sm text-ink outline-none focus:border-brand-500';

export default function LogRecordModal({ flocks, onClose, onSubmit }) {
  const [form, setForm] = useState(emptyForm);
  const [evidence, setEvidence] = useState(null);

  const flock = flocks.find((f) => f.id === form.flockId);
  const isLayer = flock?.type === 'Layers';

  function update(key, value) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function handleFile(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setEvidence({ type: file.type.startsWith('video') ? 'video' : 'photo', name: file.name });
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (!form.flockId) return;

    onSubmit({
      flockId: form.flockId,
      feedKg: Number(form.feedKg) || 0,
      waterL: Number(form.waterL) || 0,
      mortality: Number(form.mortality) || 0,
      eggCount: isLayer ? Number(form.eggCount) || 0 : null,
      weightGainG: !isLayer ? Number(form.weightGainG) || 0 : null,
      temperature: form.temperature === '' ? null : Number(form.temperature),
      humidity: form.humidity === '' ? null : Number(form.humidity),
      behavior: form.behavior,
      notes: form.notes,
      evidence,
    });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-card p-6 shadow-xl">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-ink">Log today's record</h2>
          <button onClick={onClose} className="text-ink-muted hover:text-ink" aria-label="Close">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 flex flex-col gap-4">
          <Field label="Flock">
            <select
              required
              className={inputClass}
              value={form.flockId}
              onChange={(e) => update('flockId', e.target.value)}
            >
              <option value="" disabled>
                Select a flock
              </option>
              {flocks.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.name} — {f.type} ({f.house})
                </option>
              ))}
            </select>
          </Field>

          <div className="grid grid-cols-2 gap-4">
            <Field label="Feed consumed (kg)">
              <input
                required
                type="number"
                min="0"
                step="0.1"
                className={inputClass}
                value={form.feedKg}
                onChange={(e) => update('feedKg', e.target.value)}
              />
            </Field>
            <Field label="Water consumed (L)">
              <input
                required
                type="number"
                min="0"
                step="0.1"
                className={inputClass}
                value={form.waterL}
                onChange={(e) => update('waterL', e.target.value)}
              />
            </Field>
            <Field label="Mortality (birds)">
              <input
                required
                type="number"
                min="0"
                className={inputClass}
                value={form.mortality}
                onChange={(e) => update('mortality', e.target.value)}
              />
            </Field>
            {isLayer ? (
              <Field label="Eggs collected">
                <input
                  type="number"
                  min="0"
                  className={inputClass}
                  value={form.eggCount}
                  onChange={(e) => update('eggCount', e.target.value)}
                />
              </Field>
            ) : (
              <Field label="Avg. weight gain (g/bird)">
                <input
                  type="number"
                  min="0"
                  className={inputClass}
                  value={form.weightGainG}
                  onChange={(e) => update('weightGainG', e.target.value)}
                />
              </Field>
            )}
            <Field label="Temperature (°C)">
              <input
                type="number"
                step="0.1"
                className={inputClass}
                value={form.temperature}
                onChange={(e) => update('temperature', e.target.value)}
              />
            </Field>
            <Field label="Humidity (%)">
              <input
                type="number"
                min="0"
                max="100"
                className={inputClass}
                value={form.humidity}
                onChange={(e) => update('humidity', e.target.value)}
              />
            </Field>
          </div>

          <Field label="Behavior / observation">
            <select
              className={inputClass}
              value={form.behavior}
              onChange={(e) => update('behavior', e.target.value)}
            >
              {BEHAVIOR_OPTIONS.map((b) => (
                <option key={b.value} value={b.value}>
                  {b.label}
                </option>
              ))}
            </select>
          </Field>

          <Field label="Notes">
            <textarea
              rows={2}
              className={inputClass}
              value={form.notes}
              onChange={(e) => update('notes', e.target.value)}
              placeholder="Anything worth flagging for the record"
            />
          </Field>

          <Field label="Photo or video evidence (optional)">
            <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-dashed border-border px-3 py-2 text-sm text-ink-soft hover:border-brand-500">
              <Paperclip size={15} />
              {evidence ? evidence.name : 'Attach a file'}
              <input type="file" accept="image/*,video/*" className="hidden" onChange={handleFile} />
            </label>
          </Field>

          <div className="mt-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-ink-soft hover:bg-surface"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-brand-600"
            >
              Save record
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
