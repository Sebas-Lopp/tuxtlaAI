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
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ emailOrLdapLoginId: EMAIL, password: PASSWORD }),
    });
    const auth = { 'Content-Type': 'application/json', 'Cookie': `n8n-auth=${getCookie(res)}` };

    const r = await fetch(`${N8N}/rest/credentials`, { headers: auth });
    const j = await r.json();
    for (const c of (j.data || [])) {
        console.log(`id=${c.id} name=${c.name} type=${c.type}`);
        if (c.data) {
            const d = c.data;
            console.log('  data keys:', Object.keys(d).join(', '));
            console.log('  accessToken presente:', typeof d.accessToken === 'string' ? `sí (${d.accessToken.length} chars)` : 'no');
        }
    }
})().catch(e => console.log('ERR', e.message));
