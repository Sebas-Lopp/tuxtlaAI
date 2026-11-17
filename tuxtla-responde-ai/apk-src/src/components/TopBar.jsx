export default function TopBar({ view, onNav, onLogin, onLogout, isLoggedIn, isAdmin }) {
    return (
        <header className="mag-header">
            <div className="mag-container mag-header-inner">
                <button className="mag-brand" onClick={() => onNav('home')}>
                    <span className="mag-brand-mark">TR</span>
                    <span className="mag-brand-text">TuxtlaResponde <em>AI</em></span>
                </button>

                <nav className="mag-nav">
                    <button className={view === 'home' ? 'active' : ''} onClick={() => onNav('home')}>Inicio</button>
                    <button className={view === 'report' ? 'active' : ''} onClick={() => onNav('report')}>Reportar</button>
                    <button className={view === 'map' ? 'active' : ''} onClick={() => onNav('map')}>Mapa</button>
                    {isAdmin && <button className={view === 'admin' ? 'active' : ''} onClick={() => onNav('admin')}>Moderar</button>}
                </nav>

                <div className="mag-header-actions">
                    {isLoggedIn ? (
                        <button className="mag-ghost" onClick={onLogout}>Salir</button>
                    ) : (
                        <button className="mag-login" onClick={onLogin}>Login</button>
                    )}
                </div>
            </div>
        </header>
    );
}
