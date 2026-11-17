import { useCallback, useEffect, useState } from 'react';
import { getIncidents, getStats, resolveUpload } from './api';
import { useAuth } from './AuthContext.jsx';
import { TUXTLA_CENTER, SEVERITY_META, TYPE_META, formatDate } from './constants';
import TopBar from './components/TopBar';
import AuthScreen from './components/AuthScreen';
import NewReport from './components/NewReport';
import AdminPanel from './components/AdminPanel';
import Chatbot from './components/Chatbot';
import MapCanvas from './components/MapCanvas';
import ReportCard from './components/ReportCard';
import LocationModal from './components/LocationModal';

function initials(name) {
    if (!name) return '?';
    return name.trim().split(/\s+/).slice(0, 2).map((p) => p[0]).join('').toUpperCase();
}
const ROLE_LABEL = { ADMIN: 'Administrador', OPERADOR: 'Operador', CIUDADANO: 'Ciudadano' };

function TrendingBar({ incident, onOpenLocation }) {
    if (!incident) return null;
    return (
        <div className="trending-bar">
            <div className="mag-container trending-inner">
                <span className="trending-label">🔥 TENDENCIA</span>
                <span className="trending-title">{incident.title}</span>
                <span className="trending-date">{formatDate(incident.created_at)}</span>
                <button className="trending-loc" onClick={() => onOpenLocation(incident)}>📍 Ver en mapa</button>
            </div>
        </div>
    );
}

function Hero({ incidents, onOpenLocation }) {
    if (!incidents.length) return null;
    return (
        <div className="mag-container hero-grid">
            {incidents.map((inc, idx) => {
                const type = TYPE_META[inc.type] || { label: inc.type, icon: '📌' };
                const sev = SEVERITY_META[inc.severity] || SEVERITY_META.MEDIA;
                return (
                    <article key={inc.id} className={`hero-card ${idx === 0 ? 'hero-main' : ''}`} onClick={() => onOpenLocation(inc)}>
                        {inc.photo_url ? (
                            <img src={resolveUpload(inc.photo_url)} alt={inc.title} className="hero-img" loading="lazy" />
                        ) : (
                            <div className="hero-img hero-img-placeholder">{type.icon}</div>
                        )}
                        <div className="hero-overlay" />
                        <div className="hero-content">
                            <span className="hero-cat">{type.label}</span>
                            <h3 className="hero-title">{inc.title}</h3>
                            <div className="hero-meta">{formatDate(inc.created_at)} · {sev.label}</div>
                        </div>
                    </article>
                );
            })}
        </div>
    );
}

function StatsBox({ stats }) {
    const s = stats || {};
    const cards = [
        ['Reportes', s.total_reports ?? 0, 'teal'],
        ['Pendientes', s.pending_reports ?? 0, 'amber'],
        ['En proceso', s.in_progress_reports ?? 0, 'blue'],
        ['Resueltos', s.resolved_reports ?? 0, 'green'],
    ];
    return (
        <section className="sidebar-card stats-box">
            <h4 className="sidebar-title">📊 Estadísticas</h4>
            <div className="stat-cards">
                {cards.map(([label, val, cls]) => (
                    <div key={label} className={`stat-card stat-${cls}`}>
                        <span className="stat-card-num">{val}</span>
                        <span className="stat-card-label">{label}</span>
                    </div>
                ))}
            </div>
            <div className="stat-progress"><div className="stat-progress-bar" style={{ width: `${s.resolved_rate ?? 0}%` }} /></div>
            <div className="stat-progress-label">{s.resolved_rate ?? 0}% de resolución</div>
        </section>
    );
}

function CategoriesBox({ incidents }) {
    const counts = {};
    incidents.forEach((i) => { counts[i.type] = (counts[i.type] || 0) + 1; });
    const entries = Object.entries(counts);
    return (
        <section className="sidebar-card">
            <h4 className="sidebar-title">🗂️ Categorías</h4>
            <ul className="cat-list">
                {entries.length === 0 && <li className="muted small">Sin reportes</li>}
                {entries.map(([t, n]) => {
                    const meta = TYPE_META[t] || { label: t, icon: '📌' };
                    return <li key={t} className="cat-item"><span>{meta.icon} {meta.label}</span><span className="cat-count">{n}</span></li>;
                })}
            </ul>
        </section>
    );
}

function AuthBox({ isLoggedIn, session, onLogin, onRegister, onLogout, onReport }) {
    if (isLoggedIn) {
        return (
            <section className="sidebar-card user-box">
                <div className="avatar avatar-lg">{initials(session.user.name)}</div>
                <h4>{session.user.name}</h4>
                <p className="muted small">{ROLE_LABEL[session.user.role] || session.user.role}</p>
                <button className="btn btn-primary btn-block" onClick={onReport}>📝 Reportar ahora</button>
                <button className="btn btn-ghost-dark btn-block" onClick={onLogout}>Cerrar sesión</button>
            </section>
        );
    }
    return (
        <section className="sidebar-card auth-box">
            <h4 className="sidebar-title">Login o Regístrate</h4>
            <p className="muted small">Únete para reportar y comentar en tu ciudad.</p>
            <button className="btn btn-primary btn-block" onClick={onLogin}>Iniciar sesión</button>
            <button className="btn btn-outline btn-block" onClick={onRegister}>Crear cuenta</button>
        </section>
    );
}

function AiBox({ onOpen }) {
    return (
        <section className="sidebar-card ai-box">
            <div className="ai-box-icon">🤖</div>
            <h4 className="sidebar-title">Resumen IA</h4>
            <p className="muted small">Pregúntale al asistente qué está pasando en la ciudad.</p>
            <button className="btn btn-dark btn-block" onClick={onOpen}>Abrir asistente</button>
        </section>
    );
}

function MostViewed({ incidents, onOpenLocation }) {
    const top = incidents.slice(0, 4);
    return (
        <section className="sidebar-card">
            <h4 className="sidebar-title">🔥 Lo más reciente</h4>
            {top.length === 0 && <p className="muted small">Sin reportes aún.</p>}
            {top.map((inc, i) => (
                <button key={inc.id} className="mini-item" onClick={() => onOpenLocation(inc)}>
                    <span className="mini-num">{String(i + 1).padStart(2, '0')}</span>
                    <span className="mini-text">{inc.title}</span>
                </button>
            ))}
        </section>
    );
}

function MapSection({ incidents, big }) {
    return (
        <div className="mag-container map-section">
            <div className="section-head">
                <h2 className="section-title">🗺️ Mapa de reportes</h2>
                <span className="section-sub">{incidents.length} reportes</span>
            </div>
            <MapCanvas center={TUXTLA_CENTER} markers={incidents} height={big ? 520 : 380} />
        </div>
    );
}

export default function App() {
    const { session, logout } = useAuth();
    const [view, setView] = useState('home');
    const [incidents, setIncidents] = useState([]);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showAuth, setShowAuth] = useState(false);
    const [authMode, setAuthMode] = useState('login');
    const [locIncident, setLocIncident] = useState(null);
    const [chatOpen, setChatOpen] = useState(false);

    const isLoggedIn = !!session;
    const isAdmin = isLoggedIn && session.user && session.user.role === 'ADMIN';

    const loadData = useCallback(async () => {
        setLoading(true);
        // Carga tolerante a fallos: si el microservicio de reportes cae,
        // las métricas y el resto de la app siguen funcionando.
        const [incR, stR] = await Promise.allSettled([getIncidents(false), getStats()]);
        if (incR.status === 'fulfilled') setIncidents(incR.value);
        else console.error('No se pudieron cargar los reportes:', incR.reason);
        if (stR.status === 'fulfilled') setStats(stR.value);
        else console.error('No se pudieron cargar las métricas:', stR.reason);
        setLoading(false);
    }, []);

    useEffect(() => { loadData(); }, [loadData]);

    const requireAuth = (mode = 'login') => { setAuthMode(mode); setShowAuth(true); };
    const handleNav = (v) => {
        if ((v === 'report' || v === 'admin') && !isLoggedIn) { requireAuth(); return; }
        setView(v);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const featured = incidents.slice(0, 3);
    const rest = incidents.slice(3);

    return (
        <div className="mag">
            <TopBar
                view={view}
                onNav={handleNav}
                onLogin={() => requireAuth('login')}
                onLogout={logout}
                isLoggedIn={isLoggedIn}
                isAdmin={isAdmin}
            />

            {view === 'home' && (
                <>
                    <TrendingBar incident={incidents[0]} onOpenLocation={setLocIncident} />
                    <Hero incidents={featured} onOpenLocation={setLocIncident} />

                    <div className="mag-container mag-grid">
                        <aside className="mag-side mag-side-left">
                            <StatsBox stats={stats} />
                            <CategoriesBox incidents={incidents} />
                        </aside>

                        <main className="mag-main">
                            <div className="section-head">
                                <h2 className="section-title">Más reportes recientes</h2>
                                <span className="section-sub">{incidents.length} reportes</span>
                            </div>
                            {loading ? (
                                <div className="loading">Cargando reportes…</div>
                            ) : rest.length ? (
                                <div className="feed-grid">
                                    {rest.map((i) => (
                                        <ReportCard
                                            key={i.id}
                                            incident={i}
                                            isLoggedIn={isLoggedIn}
                                            onRequireAuth={requireAuth}
                                            onOpenLocation={setLocIncident}
                                        />
                                    ))}
                                </div>
                            ) : (
                                <div className="empty-feed">Aún no hay más reportes. ¡Sé el primero en reportar!</div>
                            )}
                        </main>

                        <aside className="mag-side mag-side-right">
                            <AuthBox
                                isLoggedIn={isLoggedIn}
                                session={session}
                                onLogin={() => requireAuth('login')}
                                onRegister={() => requireAuth('register')}
                                onLogout={logout}
                                onReport={() => handleNav('report')}
                            />
                            <AiBox onOpen={() => setChatOpen(true)} />
                            <MostViewed incidents={incidents} onOpenLocation={setLocIncident} />
                        </aside>
                    </div>

                    <MapSection incidents={incidents} />
                </>
            )}

            {view === 'report' && isLoggedIn && (
                <div className="mag-container page-pad"><NewReport onReported={loadData} /></div>
            )}

            {view === 'map' && (
                <div className="mag-container page-pad"><MapSection incidents={incidents} big /></div>
            )}

            {view === 'admin' && isAdmin && (
                <div className="mag-container page-pad"><AdminPanel onModerated={loadData} /></div>
            )}

            {showAuth && (
                <AuthScreen initialMode={authMode} onDone={() => setShowAuth(false)} onClose={() => setShowAuth(false)} />
            )}

            <LocationModal incident={locIncident} onClose={() => setLocIncident(null)} />
            <Chatbot open={chatOpen} setOpen={setChatOpen} />

            <footer className="mag-footer">
                <div className="mag-container">
                    TuxtlaResponde AI · Periodismo urbano con inteligencia artificial · © {new Date().getFullYear()}
                </div>
            </footer>
        </div>
    );
}
