import { useEffect, useState } from 'react';
import { getPending, moderate } from '../api';
import { SEVERITY_META, TYPE_META, timeAgo } from '../constants';
import { resolveUpload } from '../api';

export default function AdminPanel({ onModerated }) {
    const [pending, setPending] = useState([]);
    const [loading, setLoading] = useState(true);
    const [busy, setBusy] = useState(null);

    const load = async () => {
        setLoading(true);
        try { setPending(await getPending()); } catch (e) { console.error(e); }
        finally { setLoading(false); }
    };

    useEffect(() => { load(); }, []);

    const act = async (id, moderation) => {
        setBusy(id);
        try {
            await moderate(id, moderation);
            await load();
            if (onModerated) onModerated();
        } catch (e) {
            alert(e.message);
        } finally {
            setBusy(null);
        }
    };

    return (
        <div className="admin-panel">
            <div className="admin-head">
                <h2>🛡️ Moderación de reportes</h2>
                <span className="muted">{pending.length} pendiente(s)</span>
            </div>

            {loading ? (
                <div className="loading">Cargando…</div>
            ) : pending.length === 0 ? (
                <div className="empty-feed">
                    <div className="empty-feed-icon">✅</div>
                    <h3>No hay reportes pendientes</h3>
                    <p>Todos los reportes han sido revisados.</p>
                </div>
            ) : (
                <div className="feed">
                    {pending.map((inc) => {
                        const sev = SEVERITY_META[inc.severity] || SEVERITY_META.MEDIA;
                        const type = TYPE_META[inc.type] || { label: inc.type, icon: '📌' };
                        return (
                            <article key={inc.id} className="report-card admin-card">
                                <div className="report-card-head">
                                    <div className="report-author">
                                        <div className="avatar">{(inc.citizen_name || 'A')[0].toUpperCase()}</div>
                                        <div className="report-author-info">
                                            <strong>{inc.citizen_name || 'Anónimo'}</strong>
                                            <span>{timeAgo(inc.created_at)}</span>
                                        </div>
                                    </div>
                                    <span className="badge" style={{ background: sev.color }}>{sev.icon} {sev.label}</span>
                                </div>

                                {inc.photo_url && <img className="report-image" src={resolveUpload(inc.photo_url)} alt="" />}

                                <div className="report-card-body">
                                    <h3 className="report-title">{type.icon} {inc.title}</h3>
                                    <p className="report-desc">{inc.description}</p>
                                </div>

                                <div className="admin-actions">
                                    <button className="btn btn-approve" onClick={() => act(inc.id, 'APROBADO')} disabled={busy === inc.id}>
                                        ✅ Aprobar
                                    </button>
                                    <button className="btn btn-reject" onClick={() => act(inc.id, 'RECHAZADO')} disabled={busy === inc.id}>
                                        ❌ Rechazar
                                    </button>
                                </div>
                            </article>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
