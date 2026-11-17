import { useEffect } from 'react';
import MapCanvas from './MapCanvas';
import { TYPE_META, SEVERITY_META, formatDate } from '../constants';

export default function LocationModal({ incident, onClose }) {
    useEffect(() => {
        if (!incident) return;
        const onKey = (e) => { if (e.key === 'Escape') onClose(); };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [incident, onClose]);

    if (!incident) return null;

    const lat = Number(incident.latitude);
    const lng = Number(incident.longitude);
    const type = TYPE_META[incident.type] || { label: incident.type || 'Incidente', icon: '📌' };
    const sev = SEVERITY_META[incident.severity] || SEVERITY_META.MEDIA;
    const gmaps = `https://www.google.com/maps?q=${lat},${lng}`;

    return (
        <div className="loc-overlay" onClick={onClose}>
            <div className="loc-modal" onClick={(e) => e.stopPropagation()}>
                <div className="loc-head">
                    <div>
                        <span className="loc-cat">{type.icon} {type.label} · {formatDate(incident.created_at)}</span>
                        <h3>{incident.title || type.label}</h3>
                        <span className="loc-coords">📍 {lat.toFixed(5)}, {lng.toFixed(5)}</span>
                    </div>
                    <button className="loc-close" onClick={onClose} aria-label="Cerrar">✕</button>
                </div>

                <div className="loc-map">
                    <MapCanvas
                        key={incident.id}
                        center={{ lat, lng }}
                        markers={[incident]}
                        pin={{ lat, lng }}
                        height={420}
                        zoom={16}
                    />
                </div>

                <div className="loc-foot">
                    <span className="badge" style={{ background: sev.color }}>{sev.label}</span>
                    <a className="btn btn-dark" href={gmaps} target="_blank" rel="noreferrer">Abrir en Google Maps ↗</a>
                </div>
            </div>
        </div>
    );
}
