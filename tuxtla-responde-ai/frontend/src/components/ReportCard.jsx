import { useState } from 'react';
import { SEVERITY_META, STATUS_META, TYPE_META, timeAgo, formatDate } from '../constants';
import { resolveUpload } from '../api';
import Comments from './Comments';

function initials(name) {
    if (!name) return '?';
    return name.trim().split(/\s+/).slice(0, 2).map((p) => p[0]).join('').toUpperCase();
}

export default function ReportCard({ incident, isLoggedIn, onRequireAuth, onOpenLocation }) {
    const [showComments, setShowComments] = useState(false);

    const sev = SEVERITY_META[incident.severity] || SEVERITY_META.MEDIA;
    const status = STATUS_META[incident.status] || { label: incident.status || 'Pendiente', color: '#64748b' };
    const type = TYPE_META[incident.type] || { label: incident.type || 'Incidente', icon: '📌' };

    return (
        <article className="report-card">
            <div className="report-media">
                {incident.photo_url ? (
                    <img className="report-image" src={resolveUpload(incident.photo_url)} alt={incident.title} loading="lazy" />
                ) : (
                    <div className="report-img-placeholder">{type.icon}</div>
                )}
                <span className="report-cat">{type.label}</span>
            </div>

            <div className="report-card-body">
                <h3 className="report-title">{incident.title || type.label}</h3>
                <p className="report-desc">{incident.description}</p>

                <div className="report-meta-row">
                    <div className="report-author">
                        <div className="avatar avatar-sm">{initials(incident.citizen_name)}</div>
                        <div className="report-author-info">
                            <strong>{incident.citizen_name || 'Ciudadano anónimo'}</strong>
                            <span>{formatDate(incident.created_at)}</span>
                        </div>
                    </div>
                    <div className="report-tags">
                        <span className="badge" style={{ background: sev.color }}>{sev.icon} {sev.label}</span>
                        <span className="badge" style={{ background: status.color }}>{status.label}</span>
                    </div>
                </div>
            </div>

            <div className="report-card-actions">
                <button className="action-btn" onClick={() => setShowComments(!showComments)}>
                    💬 Comentarios
                </button>
                <button className="action-btn action-loc" onClick={() => onOpenLocation(incident)}>
                    📍 Ver ubicación
                </button>
            </div>

            {showComments && (
                <Comments incidentId={incident.id} isLoggedIn={isLoggedIn} onRequireAuth={onRequireAuth} />
            )}
        </article>
    );
}
