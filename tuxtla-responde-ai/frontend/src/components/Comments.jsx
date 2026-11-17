import { useEffect, useState } from 'react';
import { getComments, addComment } from '../api';
import { timeAgo } from '../constants';

function initials(name) {
    if (!name) return '?';
    return name.trim().split(/\s+/).slice(0, 2).map((p) => p[0]).join('').toUpperCase();
}

export default function Comments({ incidentId, isLoggedIn, onRequireAuth }) {
    const [comments, setComments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [text, setText] = useState('');
    const [posting, setPosting] = useState(false);

    const load = async () => {
        setLoading(true);
        try { setComments(await getComments(incidentId)); } catch { /* silencioso */ }
        finally { setLoading(false); }
    };

    useEffect(() => { load(); }, [incidentId]);

    const submit = async (e) => {
        e.preventDefault();
        if (!isLoggedIn) { if (onRequireAuth) onRequireAuth(); return; }
        if (!text.trim()) return;
        setPosting(true);
        try {
            await addComment(incidentId, text.trim());
            setText('');
            await load();
        } catch (err) {
            alert(err.message);
        } finally {
            setPosting(false);
        }
    };

    return (
        <div className="comments">
            {loading ? (
                <div className="muted small">Cargando comentarios…</div>
            ) : comments.length === 0 ? (
                <div className="muted small">Sé el primero en comentar.</div>
            ) : (
                <div className="comment-list">
                    {comments.map((c) => (
                        <div key={c.id} className="comment">
                            <div className="comment-avatar">{initials(c.user_name)}</div>
                            <div className="comment-body">
                                <div className="comment-head">
                                    <strong>{c.user_name}</strong>
                                    <span>{timeAgo(c.created_at)}</span>
                                </div>
                                <p>{c.content}</p>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <form className="comment-form" onSubmit={submit}>
                <input
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    placeholder={isLoggedIn ? 'Escribe un comentario…' : 'Inicia sesión para comentar'}
                />
                <button type="submit" disabled={posting}>{posting ? '…' : 'Enviar'}</button>
            </form>
        </div>
    );
}
