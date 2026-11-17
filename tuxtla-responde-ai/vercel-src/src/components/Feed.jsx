import ReportCard from './ReportCard';

export default function Feed({ incidents, isLoggedIn, onRequireAuth }) {
    if (!incidents.length) {
        return (
            <div className="empty-feed">
                <div className="empty-feed-icon">🏙️</div>
                <h3>Aún no hay reportes públicos</h3>
                <p>¡Sé el primero en reportar una afectación en tu ciudad!</p>
            </div>
        );
    }

    return (
        <div className="feed">
            {incidents.map((inc) => (
                <ReportCard key={inc.id} incident={inc} isLoggedIn={isLoggedIn} onRequireAuth={onRequireAuth} />
            ))}
        </div>
    );
}
