export default function StatsCards({ stats }) {
    const s = stats || {};
    const cards = [
        { label: 'Reportes totales', value: s.total_reports ?? 0, icon: '📊', accent: 'teal' },
        { label: 'Pendientes', value: s.pending_reports ?? 0, icon: '⏳', accent: 'red' },
        { label: 'En proceso', value: s.in_progress_reports ?? 0, icon: '🛠️', accent: 'amber' },
        { label: 'Resueltos', value: s.resolved_reports ?? 0, icon: '✅', accent: 'green' },
        { label: 'Tasa de resolución', value: `${s.resolved_rate ?? 0}%`, icon: '🎯', accent: 'blue' },
    ];

    return (
        <div className="stats-grid">
            {cards.map((c) => (
                <div key={c.label} className={`stat-card stat-${c.accent}`}>
                    <div className="stat-icon">{c.icon}</div>
                    <div>
                        <div className="stat-value">{c.value}</div>
                        <div className="stat-label">{c.label}</div>
                    </div>
                </div>
            ))}
        </div>
    );
}
