import { useState } from 'react';
import { login, register } from '../api';
import { useAuth } from '../AuthContext.jsx';

export default function AuthScreen({ onDone, onClose, initialMode = 'login' }) {
    const { setSession } = useAuth();
    const [mode, setMode] = useState(initialMode); // 'login' | 'register'
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const submit = async (e) => {
        e.preventDefault();
        setError(null);
        setLoading(true);
        try {
            if (mode === 'register') {
                await register(name, email, password);
            }
            const session = await login(email, password);
            setSession(session);
            if (onDone) onDone();
        } catch (err) {
            setError(err.message || 'Ocurrió un error.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-wrap">
            <div className="auth-card">
                {onClose && (
                    <button className="auth-close" onClick={onClose} aria-label="Cerrar">← Volver</button>
                )}
                <div className="auth-brand">🏙️ TuxtlaResponde <span>AI</span></div>
                <h2>{mode === 'login' ? 'Bienvenido de nuevo' : 'Crea tu cuenta'}</h2>
                <p className="muted">
                    {mode === 'login'
                        ? 'Inicia sesión para reportar y comentar.'
                        : 'Regístrate para reportar afectaciones en tu ciudad.'}
                </p>

                <form onSubmit={submit} className="auth-form">
                    {mode === 'register' && (
                        <>
                            <label>Nombre</label>
                            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Tu nombre completo" required />
                        </>
                    )}
                    <label>Correo</label>
                    <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="tu@correo.com" required />
                    <label>Contraseña</label>
                    <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Mínimo 6 caracteres" required minLength={6} />

                    {error && <div className="alert alert-error">{error}</div>}

                    <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
                        {loading ? <span className="spinner" /> : mode === 'login' ? '🔐 Iniciar sesión' : '🚀 Crear cuenta'}
                    </button>
                </form>

                <button className="link-switch" onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setError(null); }}>
                    {mode === 'login' ? '¿No tienes cuenta? Regístrate' : '¿Ya tienes cuenta? Inicia sesión'}
                </button>
            </div>
        </div>
    );
}
