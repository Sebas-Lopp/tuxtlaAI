export const TUXTLA_CENTER = { lat: 16.7516, lng: -93.1167 };

export const SEVERITY_META = {
  ALTA: { label: 'Alta', color: '#ef4444', icon: '🔴' },
  MEDIA: { label: 'Media', color: '#f59e0b', icon: '🟡' },
  BAJA: { label: 'Baja', color: '#22c55e', icon: '🟢' },
};

export const TYPE_META = {
  BACHE: { label: 'Bache', icon: '🕳️' },
  LUMINARIA: { label: 'Luminaria', icon: '💡' },
  BASURA: { label: 'Basura', icon: '🗑️' },
  FUGA_AGUA: { label: 'Fuga de agua', icon: '💧' },
  OTRO: { label: 'Otro', icon: '⚠️' },
};

export const STATUS_META = {
  PENDIENTE: { label: 'Pendiente', color: '#ef4444' },
  EN_PROCESO: { label: 'En proceso', color: '#f59e0b' },
  RESUELTO: { label: 'Resuelto', color: '#22c55e' },
};

export const INCIDENT_TYPES = Object.keys(TYPE_META);

export function formatDate(value) {
  if (!value) return '';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return String(value);
  return d.toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' });
}

export function timeAgo(value) {
  if (!value) return '';
  const d = new Date(value);
  const diff = Date.now() - d.getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'ahora';
  if (mins < 60) return `hace ${mins} min`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `hace ${hours} h`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `hace ${days} d`;
  return formatDate(value);
}
