export const RISK_LABELS = {
  low: 'Low risk',
  medium: 'Medium risk',
  high: 'High risk',
};

export const RISK_TONES = {
  low: 'good',
  medium: 'warning',
  high: 'critical',
};

export const RISK_ACCENT = {
  low: 'border-l-good',
  medium: 'border-l-warning',
  high: 'border-l-critical',
};

export const STATUS_LABELS = {
  healthy: 'Healthy',
  attention: 'Needs attention',
};

export const STATUS_TONES = {
  healthy: 'good',
  attention: 'critical',
};

export const PRIORITY_LABELS = {
  high: 'High priority',
  medium: 'Medium priority',
  low: 'Low priority',
};

export const PRIORITY_TONES = {
  high: 'critical',
  medium: 'warning',
  low: 'neutral',
};

export const BEHAVIOR_OPTIONS = [
  { value: 'normal', label: 'Normal activity' },
  { value: 'lethargic', label: 'Lethargic / reduced activity' },
  { value: 'reduced_appetite', label: 'Reduced appetite / off feed' },
  { value: 'huddling', label: 'Huddling / ruffled feathers' },
  { value: 'respiratory', label: 'Coughing, sneezing, or labored breathing' },
  { value: 'diarrhea', label: 'Diarrhea / abnormal droppings' },
  { value: 'lameness', label: 'Lameness / leg weakness' },
  { value: 'pecking', label: 'Aggressive pecking / cannibalism' },
  { value: 'panting', label: 'Panting / heat stress' },
  { value: 'swelling', label: 'Swollen head, eyes, or nasal discharge' },
  { value: 'egg_drop', label: 'Sudden drop in egg production' },
  { value: 'other', label: 'Other (see notes)' },
];

export const BEHAVIOR_LABELS = Object.fromEntries(BEHAVIOR_OPTIONS.map((b) => [b.value, b.label]));

export const VERIFY_LABELS = {
  pending: 'Needs verification',
  confirmed: 'Confirmed',
  dismissed: 'Dismissed',
};

export const VERIFY_TONES = {
  pending: 'warning',
  confirmed: 'critical',
  dismissed: 'neutral',
};
