import { useState } from 'react';
import { X, Paperclip, Lock } from 'lucide-react';
import { BEHAVIOR_OPTIONS } from '../lib/status';
import { uploadEvidence } from '../lib/cloudinary';
import { useFarmData } from '../context/farmDataStore';

// Before noon, default to logging what's being given this morning; after,
// default to the evening check-in on what was actually eaten/taken.
const defaultPeriod = new Date().getHours() < 12 ? 'morning' : 'evening';

const emptyForm = {
  period: defaultPeriod,
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
  const { currentPlan, dailyRecords } = useFarmData();
  const [form, setForm] = useState(emptyForm);
  const [evidence, setEvidence] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(null);
  const [uploadError, setUploadError] = useState('');

  const flock = flocks.find((f) => f.id === form.flockId);
  const isLayer = flock?.type === 'Layers';
  const uploading = uploadProgress !== null;
  const isMorning = form.period === 'morning';

  const today = new Date().toISOString().slice(0, 10);
  const morningRecord = dailyRecords.find(
    (r) => r.flockId === form.flockId && r.date === today && r.period === 'morning'
  );

  function update(key, value) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleFile(e) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadError('');
    setEvidence(null);
    setUploadProgress(0);
    try {
      const uploaded = await uploadEvidence(file, setUploadProgress);
      setEvidence(uploaded);
    } catch (err) {
      setUploadError(err.message);
    } finally {
      setUploadProgress(null);
    }
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (!form.flockId) return;

    if (isMorning) {
      onSubmit({
        period: 'morning',
        flockId: form.flockId,
        feedKg: Number(form.feedKg) || 0,
        waterL: Number(form.waterL) || 0,
      });
      return;
    }

    onSubmit({
      period: 'evening',
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
          <h2 className="text-lg font-semibold text-ink">
            {isMorning ? "Log this morning's check-in" : "Log this evening's check-in"}
          </h2>
          <button onClick={onClose} className="text-ink-muted hover:text-ink" aria-label="Close">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 flex flex-col gap-4">
          <Field label="Which check-in is this?">
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => update('period', 'morning')}
                className={`rounded-lg border px-3 py-2 text-sm font-medium ${
                  isMorning ? 'border-brand-500 bg-mint-100 text-brand-600' : 'border-border text-ink-soft hover:bg-surface'
                }`}
              >
                Morning — feed &amp; water given
              </button>
              <button
                type="button"
                onClick={() => update('period', 'evening')}
                className={`rounded-lg border px-3 py-2 text-sm font-medium ${
                  !isMorning ? 'border-brand-500 bg-mint-100 text-brand-600' : 'border-border text-ink-soft hover:bg-surface'
                }`}
              >
                Evening — what actually happened
              </button>
            </div>
          </Field>

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

          {!isMorning && morningRecord && (
            <p className="rounded-lg bg-surface px-3 py-2 text-xs text-ink-soft">
              This morning: {morningRecord.feedKg}kg feed and {morningRecord.waterL}L water given.
            </p>
          )}

          <div className="grid grid-cols-2 gap-4">
            <Field label={isMorning ? 'Feed given (kg)' : 'Feed eaten (kg)'}>
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
            <Field label={isMorning ? 'Water given (L)' : 'Water taken (L)'}>
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
            {!isMorning && (
              <>
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
              </>
            )}
          </div>

          {!isMorning && (
            <>
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
                {currentPlan.capabilities.evidenceUpload ? (
                  <>
                    <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-dashed border-border px-3 py-2 text-sm text-ink-soft hover:border-brand-500">
                      <Paperclip size={15} />
                      {uploading ? `Uploading… ${uploadProgress}%` : evidence ? evidence.name : 'Attach a file'}
                      <input
                        type="file"
                        accept="image/*,video/*"
                        className="hidden"
                        onChange={handleFile}
                        disabled={uploading}
                      />
                    </label>
                    {uploadError && <span className="text-xs text-critical-ink">{uploadError}</span>}
                  </>
                ) : (
                  <div className="flex items-center gap-2 rounded-lg border border-dashed border-border px-3 py-2 text-sm text-ink-muted">
                    <Lock size={14} />
                    Evidence uploads need the Pro plan
                  </div>
                )}
              </Field>
            </>
          )}

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
              disabled={uploading}
              className="rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-brand-600 disabled:opacity-60"
            >
              {isMorning ? 'Save morning check-in' : 'Save evening check-in'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
