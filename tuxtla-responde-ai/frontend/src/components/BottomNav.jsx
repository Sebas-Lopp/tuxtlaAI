export default function BottomNav({ view, setView, isAdmin }) {
    const items = [
        { id: 'feed', icon: '🏠', label: 'Inicio' },
        { id: 'report', icon: '📝', label: 'Reportar' },
        { id: 'map', icon: '🗺️', label: 'Mapa' },
        ...(isAdmin ? [{ id: 'admin', icon: '🛡️', label: 'Moderar' }] : []),
    ];

    return (
        <nav className="bottom-nav">
            {items.map((it) => (
                <button
                    key={it.id}
                    className={`nav-item ${view === it.id ? 'active' : ''}`}
                    onClick={() => setView(it.id)}
                >
                    <span className="nav-icon">{it.icon}</span>
                    <span className="nav-label">{it.label}</span>
                </button>
            ))}
        </nav>
    );
}
