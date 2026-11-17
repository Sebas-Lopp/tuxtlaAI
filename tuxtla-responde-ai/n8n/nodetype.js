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

    for (const type of ['n8n-nodes-base.telegramTrigger', 'n8n-nodes-base.telegram']) {
        const r = await fetch(`${N8N}/rest/node-types/${type}`, { headers: auth });
        const j = await r.json();
        console.log(`\n=== ${type} (status ${r.status}) ===`);
        const d = (j.data || j) || {};
        console.log('keys:', Object.keys(d).join(', '));
        if (d.properties) {
            console.log('properties:', JSON.stringify(d.properties, null, 1).slice(0, 2500));
        }
        if (d.credentials) {
            console.log('credentials:', JSON.stringify(d.credentials, null, 1).slice(0, 600));
        }
        if (d.defaultVersion !== undefined) console.log('defaultVersion:', d.defaultVersion);
        if (d.version) console.log('versions:', JSON.stringify(d.version || d.versions).slice(0, 400));
    }
})().catch(e => console.log('ERR', e.message));
