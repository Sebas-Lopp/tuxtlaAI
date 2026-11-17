// Bot de Telegram — polling directo (getUpdates) que consulta el API Gateway.
const TELEGRAM_TOKEN = process.env.TELEGRAM_TOKEN || '';
// Intenta primero el gateway interno (localhost:$PORT) y, si falla, la URL pública.
const GATEWAYS = [
    process.env.GATEWAY_URL,
    'https://tuxtla-backend.onrender.com',
].filter(Boolean);
const API = `https://api.telegram.org/bot${TELEGRAM_TOKEN}`;

const TYPE_LABEL = {
    BACHE: '🕳️ Baches',
    LUMINARIA: '💡 Luminarias',
    BASURA: '🗑️ Basura',
    FUGA_AGUA: '💧 Fugas de agua',
    OTRO: '📌 Otros',
};
const TYPE_COMMANDS = {
    '/bache': 'BACHE', '/baches': 'BACHE',
    '/luminaria': 'LUMINARIA', '/luminarias': 'LUMINARIA',
    '/basura': 'BASURA',
    '/fuga': 'FUGA_AGUA', '/fugas': 'FUGA_AGUA',
};

const HELP = `👋 ¡Hola! Soy TuxtlaResponde AI 🤖

📊 /stats — métricas generales
📋 /reportes — últimos reportes aprobados
🧠 /resumen — resumen de la ciudad con IA
🕳️ /baches — reportes de baches
💡 /luminarias — reportes de luminarias
🗑️ /basura — reportes de basura
💧 /fugas — reportes de fugas de agua
ℹ️ /ayuda — esta lista`;

let offset = 0;

// fetch al gateway con reintento entre gateways
async function gw(path, options) {
    let lastErr;
    for (const base of GATEWAYS) {
        try {
            const r = await fetch(base + path, options);
            if (r.ok) return r;
            lastErr = new Error(`HTTP ${r.status} (${base})`);
        } catch (e) {
            lastErr = e;
        }
    }
    throw lastErr || new Error('Backend no disponible');
}

async function telegram(method, payload) {
    const r = await fetch(`${API}/${method}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
    });
    return r.json();
}

async function sendMessage(chatId, text) {
    await telegram('sendMessage', { chat_id: chatId, text, disable_web_page_preview: true });
}

async function sendStats(chatId) {
    const r = await gw('/api/transparency/stats');
    const j = await r.json();
    const s = j.data || {};
    const sev = s.by_severity || {};
    await sendMessage(chatId,
        `📊 TuxtlaResponde — Estadísticas\n\n` +
        `Total reportes: ${s.total_reports}\n` +
        `⏳ Pendientes: ${s.pending_reports}\n` +
        `🛠️ En proceso: ${s.in_progress_reports}\n` +
        `✅ Resueltos: ${s.resolved_reports} (${s.resolved_rate}%)\n\n` +
        `🔴 Alta: ${sev.ALTA ?? 0} · 🟡 Media: ${sev.MEDIA ?? 0} · 🟢 Baja: ${sev.BAJA ?? 0}`
    );
}

async function sendReports(chatId) {
    const j = await (await gw('/api/incidents')).json();
    const list = (j.data || []).slice(0, 8)
        .map((i) => `• ${i.title} — ${i.status} (${i.severity})`)
        .join('\n');
    await sendMessage(chatId, `📋 ${j.total} reportes aprobados:\n\n${list || 'Sin reportes aún.'}`);
}

async function sendByType(chatId, type) {
    const j = await (await gw('/api/incidents')).json();
    const filtered = (j.data || []).filter((i) => i.type === type);
    const list = filtered.slice(0, 10)
        .map((i) => `• ${i.title} — ${i.status} (${i.severity})`)
        .join('\n');
    await sendMessage(chatId, `${TYPE_LABEL[type] || type}: ${filtered.length}\n\n${list || 'Sin reportes de este tipo.'}`);
}

async function sendSummary(chatId) {
    await sendMessage(chatId, '🤖 Generando resumen...');
    const r = await gw('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: 'Resume qué está pasando en la ciudad' }),
    });
    const j = await r.json();
    await sendMessage(chatId, `🤖 ${(j.data && j.data.reply) || 'No pude generar el resumen.'}`);
}

async function handleUpdate(update) {
    const msg = update.message;
    if (!msg || !msg.text) return;
    const chatId = msg.chat.id;
    const cmd = msg.text.trim().toLowerCase().split(' ')[0];

    try {
        if (cmd === '/start' || cmd === '/help' || cmd === '/ayuda') {
            await sendMessage(chatId, HELP);
        } else if (cmd === '/stats') {
            await sendStats(chatId);
        } else if (cmd === '/reportes' || cmd === '/ultimos') {
            await sendReports(chatId);
        } else if (cmd === '/resumen') {
            await sendSummary(chatId);
        } else if (TYPE_COMMANDS[cmd]) {
            await sendByType(chatId, TYPE_COMMANDS[cmd]);
        } else {
            await sendMessage(chatId, 'No reconozco ese comando. Usa /ayuda para ver la lista.');
        }
    } catch (e) {
        await sendMessage(chatId, '⚠️ Error al consultar el backend: ' + e.message);
    }
}

async function poll() {
    if (!TELEGRAM_TOKEN) {
        console.error('❌ TELEGRAM_TOKEN no configurada');
        return;
    }
    console.log(`🤖 Bot de Telegram iniciado (gateways: ${GATEWAYS.join(' | ')})`);

    try {
        const init = await telegram('getUpdates', { offset: -1 });
        if (init.ok && init.result && init.result.length) {
            offset = init.result[init.result.length - 1].update_id + 1;
        }
    } catch (e) { /* ignorar */ }

    while (true) {
        try {
            const r = await fetch(`${API}/getUpdates?timeout=25&offset=${offset}`);
            const j = await r.json();
            if (j.ok && j.result) {
                for (const u of j.result) {
                    offset = u.update_id + 1;
                    handleUpdate(u);
                }
            }
        } catch (e) {
            console.error('poll error:', e.message);
            await new Promise((res) => setTimeout(res, 3000));
        }
    }
}

poll();
