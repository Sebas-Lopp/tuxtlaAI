import { SEVERITY_META, TYPE_META } from '../constants';

export default function Charts({ stats }) {
    const s = stats || {};
    const bySeverity = s.by_severity || { ALTA: 0, MEDIA: 0, BAJA: 0 };
    const byType = s.by_type || [];

    const alta = Number(bySeverity.ALTA || 0);
    const media = Number(bySeverity.MEDIA || 0);
    const baja = Number(bySeverity.BAJA || 0);
    const totalSev = alta + media + baja || 1;

    const altaPct = (alta / totalSev) * 100;
    const mediaPct = (media / totalSev) * 100;

    const donut = `conic-gradient(
        ${SEVERITY_META.ALTA.color} 0% ${altaPct}%,
        ${SEVERITY_META.MEDIA.color} ${altaPct}% ${altaPct + mediaPct}%,
        ${SEVERITY_META.BAJA.color} ${altaPct + mediaPct}% 100%
    )`;

    const maxType = Math.max(...byType.map((x) => Number(x.total)), 1);

    return (
        <div className="charts-grid">
            <div className="card">
                <h3>Distribución por severidad</h3>
                <div className="donut-wrap">
                    <div className="donut" style={{ background: donut }}>
                        <div className="donut-hole">
                            <strong>{totalSev}</strong>
                            <span>reportes</span>
                        </div>
                    </div>
                    <ul className="legend">
                        {Object.keys(SEVERITY_META).map((k) => (
                            <li key={k}>
                                <span className="legend-dot" style={{ background: SEVERITY_META[k].color }} />
                                {SEVERITY_META[k].label}: {bySeverity[k] || 0}
                            </li>
                        ))}
                    </ul>
                </div>
            </div>

            <div className="card">
                <h3>Reportes por tipo</h3>
                {byType.length === 0 && <p className="empty">Aún no hay reportes registrados.</p>}
                <div className="bar-list">
                    {byType.map((t) => {
                        const meta = TYPE_META[t.type] || { label: t.type, icon: '📌' };
                        const val = Number(t.total);
                        return (
                            <div key={t.type} className="bar-row">
                                <div className="bar-label">{meta.icon} {meta.label}</div>
                                <div className="bar-track">
                                    <div className="bar-fill" style={{ width: `${(val / maxType) * 100}%` }} />
                                </div>
                                <div className="bar-value">{val}</div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
