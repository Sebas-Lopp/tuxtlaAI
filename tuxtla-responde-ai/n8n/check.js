const N8N = 'http://localhost:5678';
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

(async () => {
    const res = await fetch(`${N8N}/rest/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ emailOrLdapLoginId: EMAIL, password: PASSWORD }),
    });
    const cookie = getCookie(res);
    if (!cookie) { console.log('login falló', res.status); return; }
    const auth = { 'Content-Type': 'application/json', 'Cookie': `n8n-auth=${cookie}` };

    const wf = await fetch(`${N8N}/rest/workflows`, { headers: auth });
    const wj = await wf.json();
    console.log('WORKFLOWS:');
    for (const w of (wj.data || [])) {
        console.log(`  - ${w.name} (active=${w.active}) triggerCount=${w.triggerCount}`);
    }

    const ex = await fetch(`${N8N}/rest/executions?limit=15`, { headers: auth });
    const ej = await ex.json();
    const list = ej.data || [];
    console.log('EJECUCIONES recientes:', list.length);
    for (const e of list.slice(0, 15)) {
        console.log(`  id=${e.id} status=${e.status} started=${e.startedAt} finished=${e.finished} mode=${e.mode}`);
    }
})().catch(e => console.log('ERR', e.message));
