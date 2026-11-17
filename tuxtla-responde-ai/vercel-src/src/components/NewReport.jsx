import { useRef, useState } from 'react';
import MapCanvas from './MapCanvas';
import { TUXTLA_CENTER, INCIDENT_TYPES, TYPE_META, SEVERITY_META } from '../constants';
import { createIncident, uploadMedia, analyzeEvidence, updateSeverity, attachIncidentPhoto } from '../api';

function fileToDataUrl(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = () => reject(new Error('No se pudo leer la imagen'));
        reader.readAsDataURL(file);
    });
}

export default function NewReport({ onReported }) {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [type, setType] = useState('BACHE');
    const [location, setLocation] = useState({ lat: TUXTLA_CENTER.lat, lng: TUXTLA_CENTER.lng });
    const [file, setFile] = useState(null);
    const [preview, setPreview] = useState(null);
    const [submitting, setSubmitting] = useState(false);
    const [step, setStep] = useState('');
    const [result, setResult] = useState(null);
    const [error, setError] = useState(null);
    const fileInputRef = useRef(null);

    const handleFile = (e) => {
        const f = e.target.files[0];
        if (!f) return;
        setFile(f);
        setPreview(URL.createObjectURL(f));
        setResult(null);
    };

    const useGeolocation = () => {
        if (!navigator.geolocation) { setError('Tu navegador no soporta geolocalización.'); return; }
        navigator.geolocation.getCurrentPosition(
            (pos) => setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
            () => setError('No se pudo obtener tu ubicación. Haz clic en el mapa.'),
            { enableHighAccuracy: true, timeout: 8000 }
        );
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setResult(null);

        if (!title.trim() || !description.trim()) { setError('Completa el título y la descripción.'); return; }
        if (!file) { setError('Adjunta una fotografía de evidencia.'); return; }

        try {
            setSubmitting(true);
            setStep('Enviando reporte…');
            const incident = await createIncident({ type, title, description, latitude: location.lat, longitude: location.lng });

            setStep('Subiendo fotografía…');
            const media = await uploadMedia(file, incident.id);
            try { await attachIncidentPhoto(incident.id, media.fileUrl); } catch { /* no crítico */ }

            setStep('Analizando con IA…');
            const dataUrl = await fileToDataUrl(file);
            const analysis = await analyzeEvidence(incident.id, dataUrl);
            try { await updateSeverity(incident.id, analysis.severity); } catch { /* no crítico */ }

            setResult({ incidentId: incident.id, severity: analysis.severity, confidence: analysis.confidence, photoUrl: media.fileUrl });

            setTitle(''); setDescription(''); setType('BACHE');
            setFile(null); setPreview(null);
            if (fileInputRef.current) fileInputRef.current.value = '';
            setLocation({ lat: TUXTLA_CENTER.lat, lng: TUXTLA_CENTER.lng });

            if (onReported) onReported();
        } catch (err) {
            setError(err.message || 'Ocurrió un error al enviar el reporte.');
        } finally {
            setSubmitting(false);
            setStep('');
        }
    };

    return (
        <div className="report-layout">
            <div className="card report-form-card">
                <h2>📝 Reportar una afectación</h2>
                <p className="muted">Tu reporte se analiza con IA y queda pendiente de aprobación.</p>

                <form onSubmit={handleSubmit}>
                    <label>Tipo de afectación</label>
                    <div className="type-pills">
                        {INCIDENT_TYPES.map((t) => (
                            <button type="button" key={t} className={`pill ${type === t ? 'pill-active' : ''}`} onClick={() => setType(t)}>
                                {TYPE_META[t].icon} {TYPE_META[t].label}
                            </button>
                        ))}
                    </div>

                    <label>Título</label>
                    <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Ej. Bache profundo en el crucero" />

                    <label>Descripción</label>
                    <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} placeholder="Describe la magnitud del problema…" />

                    <label>Ubicación</label>
                    <div className="location-row">
                        <button type="button" className="btn btn-secondary" onClick={useGeolocation}>📍 Usar mi ubicación</button>
                        <div className="coords">Lat {location.lat.toFixed(5)} · Lng {location.lng.toFixed(5)}</div>
                    </div>
                    <MapCanvas center={TUXTLA_CENTER} onClick={setLocation} pin={location} height={220} />

                    <label>Fotografía de evidencia</label>
                    <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFile} className="file-input" />
                    {preview && <img className="preview-img" src={preview} alt="Vista previa" />}

                    {error && <div className="alert alert-error">{error}</div>}
                    {result && (
                        <div className="alert alert-success">
                            <strong>✅ Reporte enviado (pendiente de aprobación)</strong>
                            <div className="result-row">
                                Severidad IA:
                                <span className="badge" style={{ background: (SEVERITY_META[result.severity] || {}).color }}>{result.severity}</span>
                                · Confianza {Math.round((result.confidence || 0) * 100)}%
                            </div>
                        </div>
                    )}

                    <button type="submit" className="btn btn-primary btn-block" disabled={submitting}>
                        {submitting ? <span className="spinner" /> : '🚀'} {submitting ? (step || 'Procesando…') : 'Enviar reporte'}
                    </button>
                </form>
            </div>
        </div>
    );
}
