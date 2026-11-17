import { SEVERITY_META, STATUS_META, TYPE_META } from '../constants';

function formatDate(value) {
    if (!value) return '';
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return String(value);
    return d.toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' });
}

export default function IncidentList({ incidents }) {
    const list = incidents.slice(0, 8);

    if (list.length === 0) {
        return <p className="empty">Aún no hay incidentes. ¡Reporta el primero! 🚀</p>;
    }

    return (
        <div className="incident-list">
            {list.map((inc) => {
                const sev = SEVERITY_META[inc.severity] || SEVERITY_META.MEDIA;
                const status = STATUS_META[inc.status] || { label: inc.status || 'Pendiente', color: '#64748b' };
                const type = TYPE_META[inc.type] || { label: inc.type || 'Incidente', icon: '📌' };

                return (
                    <div key={inc.id} className="incident-item">
                        {inc.photo_url ? (
                            <img className="incident-thumb" src={inc.photo_url} alt="" />
                        ) : (
                            <div className="incident-thumb placeholder">{type.icon}</div>
                        )}
                        <div className="incident-body">
                            <div className="incident-title">{type.icon} {inc.title || type.label}</div>
                            <div className="incident-meta">
                                <span className="badge" style={{ background: sev.color }}>{sev.label}</span>
                                <span className="badge" style={{ background: status.color }}>{status.label}</span>
                                <span className="incident-date">{formatDate(inc.created_at)}</span>
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
