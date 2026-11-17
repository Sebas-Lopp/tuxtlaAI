// API relativa al mismo origen: funciona en localhost Y desde el celular por la IP de la LAN.
const API_BASE = import.meta.env.VITE_API_URL || '/api';
const UPLOADS_BASE = import.meta.env.VITE_UPLOADS_URL || '/uploads';

// Resuelve una URL de foto: si es relativa (/uploads/..) y el API es absoluto (APK),
// le antepone el origen del API. En la web queda relativa (nginx la proxya).
export function resolveUpload(url) {
    if (!url) return url;
    if (/^https?:\/\//i.test(url)) return url;
    if (url.startsWith('/') && /^https?:\/\//i.test(API_BASE)) {
        try { return new URL(API_BASE).origin + url; } catch { return url; }
    }
    return url;
}

const SESSION_KEY = 'tuxtla_session';

export function getToken() {
    try {
        const s = JSON.parse(localStorage.getItem(SESSION_KEY) || '{}');
        return s.token || null;
    } catch {
        return null;
    }
}

export function getSession() {
    try {
        const s = JSON.parse(localStorage.getItem(SESSION_KEY) || 'null');
        return s && s.token ? s : null;
    } catch {
        return null;
    }
}

export function setSession(session) {
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
}

export function clearSession() {
    localStorage.removeItem(SESSION_KEY);
}

async function request(path, options = {}) {
    const token = getToken();
    const headers = { ...(options.headers || {}) };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const res = await fetch(`${API_BASE}${path}`, { ...options, headers });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
        throw new Error(data.error || data.details || `Error ${res.status}`);
    }
    return data;
}

// ---- Auth ----
export async function login(email, password) {
    const r = await request('/users/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
    });
    return r.data; // { token, user }
}

export async function register(name, email, password) {
    const r = await request('/users/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
    });
    return r.data;
}

// ---- Reportes ----
export async function getIncidents(all = false) {
    const q = all ? '?all=1' : '';
    const r = await request(`/incidents${q}`);
    return r.data || [];
}

export async function getPending() {
    const r = await request('/incidents/moderation/pending');
    return r.data || [];
}

export async function moderate(id, moderation) {
    const r = await request(`/incidents/${id}/moderation`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ moderation }),
    });
    return r.data;
}

export async function createIncident(payload) {
    const r = await request('/incidents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
    });
    return r.data;
}

export async function attachIncidentPhoto(id, photoUrl) {
    const r = await request(`/incidents/${id}/photo`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ photoUrl }),
    });
    return r.data;
}

export async function updateSeverity(id, severity) {
    const r = await request(`/incidents/${id}/severity`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ severity }),
    });
    return r.data;
}

export async function uploadMedia(file, incidentId) {
    const formData = new FormData();
    formData.append('image', file);
    formData.append('incidentId', incidentId);

    const token = getToken();
    const headers = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const res = await fetch(`${API_BASE}/media`, { method: 'POST', body: formData, headers });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error || data.details || 'Error subiendo la imagen');
    return data.data;
}

export async function analyzeEvidence(incidentId, imageUrl) {
    const r = await request('/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ incidentId, imageUrl }),
    });
    return r.data;
}

// ---- Comentarios ----
export async function getComments(incidentId) {
    const r = await request(`/incidents/${incidentId}/comments`);
    return r.data || [];
}

export async function addComment(incidentId, content) {
    const r = await request(`/incidents/${incidentId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content }),
    });
    return r.data;
}

// ---- Métricas y chatbot ----
export async function getStats() {
    const r = await request('/transparency/stats');
    return r.data || {};
}

export async function chat(message) {
    const r = await request('/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message }),
    });
    return r.data;
}

export { API_BASE, UPLOADS_BASE };
