const fs = require('fs');
const path = require('path');

const N8N = 'http://localhost:5678';
const TELEGRAM_TOKEN = '9154661333:AAF59SgusyMXELyqjmJYQU_VGAOiNUAaeNw';
const EMAIL = 'admin@tuxtla.mx';
const PASSWORD = 'TuxtlaN8n123!';

function getCookie(res) {
    if (typeof res.headers.getSetCookie === 'function') {
        for (const c of res.headers.getSetCookie()) {
            const m = c.match(/n8n-auth=([^;]+)/);
            if (m) return m[1];
        }
    }
    const sc = res.headers.get('set-cookie') || '';
    const m = sc.match(/n8n-auth=([^;]+)/);
    return m ? m[1] : null;
}

async function main() {
    // 1. Crear owner (instancia fresca) -> devuelve la cookie n8n-auth directamente
    let res = await fetch(`${N8N}/rest/owner/setup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: EMAIL, firstName: 'Admin', lastName: 'Tuxtla', password: PASSWORD }),
    });

    let cookie = getCookie(res);
    if (!cookie) {
        // Ya existía el owner -> login
        res = await fetch(`${N8N}/rest/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ emailOrLdapLoginId: EMAIL, password: PASSWORD }),
        });
        cookie = getCookie(res);
    }

    if (!cookie) {
        console.error('No se pudo autenticar en n8n. owner/setup:', res.status);
        process.exit(1);
    }
    console.log('✔ Autenticado en n8n');
    const auth = { 'Content-Type': 'application/json', 'Cookie': `n8n-auth=${cookie}` };

    // 2. Crear credencial de Telegram
    const credRes = await fetch(`${N8N}/rest/credentials`, {
        method: 'POST',
        headers: auth,
        body: JSON.stringify({
            name: 'Telegram Tuxtla',
            type: 'telegramApi',
            data: { accessToken: TELEGRAM_TOKEN },
            nodesAccess: [
                { nodeType: 'n8n-nodes-base.telegramTrigger' },
                { nodeType: 'n8n-nodes-base.telegram' },
            ],
        }),
    });
    const credJson = await credRes.json().catch(() => ({}));
    if (credRes.status >= 400) {
        console.error('Error al crear credencial:', credRes.status, JSON.stringify(credJson).slice(0, 1500));
        process.exit(1);
    }
    const credId = credJson.data.id;
    console.log('✔ Credencial Telegram creada:', credId);

    // 3. Construir workflow inyectando la credencial
    const wfPath = path.join(__dirname, 'telegram-workflow.json');
    const wf = JSON.parse(fs.readFileSync(wfPath, 'utf8'));
    for (const node of wf.nodes) {
        if (node.type === 'n8n-nodes-base.telegramTrigger' || node.type === 'n8n-nodes-base.telegram') {
            node.credentials = { telegramApi: { id: credId, name: 'Telegram Tuxtla' } };
        }
    }

    // 4. Crear workflow
    const wfRes = await fetch(`${N8N}/rest/workflows`, {
        method: 'POST',
        headers: auth,
        body: JSON.stringify(wf),
    });
    const wfJson = await wfRes.json().catch(() => ({}));
    if (wfRes.status >= 400) {
        console.error('Error al crear workflow:', wfRes.status, JSON.stringify(wfJson).slice(0, 2000));
        process.exit(1);
    }
    const wfId = wfJson.data.id;
    console.log('✔ Workflow creado:', wfId);

    // 5. Activar workflow
    const actRes = await fetch(`${N8N}/rest/workflows/${wfId}/activate`, {
        method: 'POST',
        headers: auth,
    });
    const actText = await actRes.text();
    console.log(`✔ Activación: HTTP ${actRes.status} ${actText.slice(0, 300)}`);
}

main().catch((e) => { console.error(e); process.exit(1); });
