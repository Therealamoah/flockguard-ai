import { useState } from 'react';
import { X } from 'lucide-react';
import FormField, { inputClass } from './FormField';

const emptyForm = {
  name: '',
  type: 'broilers',
  house: '',
  birds: '',
  hatchDate: '',
};

export default function AddFlockModal({ onClose, onSubmit }) {
  const [form, setForm] = useState(emptyForm);
  const [submitting, setSubmitting] = useState(false);

  function update(key, value) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitting(true);
    try {
      await onSubmit({
        name: form.name,
        type: form.type,
        house: form.house,
        birds: Number(form.birds),
        hatchDate: form.hatchDate,
      });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-2xl bg-card p-6 shadow-xl">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-ink">Add a flock</h2>
          <button onClick={onClose} className="text-ink-muted hover:text-ink" aria-label="Close">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 flex flex-col gap-4">
          <FormField label="Flock name">
            <input
              required
              className={inputClass}
              value={form.name}
              onChange={(e) => update('name', e.target.value)}
              placeholder="Flock G"
            />
          </FormField>

          <FormField label="Type">
            <select className={inputClass} value={form.type} onChange={(e) => update('type', e.target.value)}>
              <option value="broilers">Broilers</option>
              <option value="layers">Layers</option>
            </select>
          </FormField>

          <div className="grid grid-cols-2 gap-4">
            <FormField label="House">
              <input
                required
                className={inputClass}
                value={form.house}
                onChange={(e) => update('house', e.target.value)}
                placeholder="House 7"
              />
            </FormField>
            <FormField label="Number of birds">
              <input
                required
                type="number"
                min="1"
                className={inputClass}
                value={form.birds}
                onChange={(e) => update('birds', e.target.value)}
              />
            </FormField>
          </div>

          <FormField label="Hatch date">
            <input
              required
              type="date"
              className={inputClass}
              value={form.hatchDate}
              onChange={(e) => update('hatchDate', e.target.value)}
              max={new Date().toISOString().slice(0, 10)}
            />
          </FormField>

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
              disabled={submitting}
              className="rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-brand-600 disabled:opacity-60"
            >
              {submitting ? 'Adding…' : 'Add flock'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
