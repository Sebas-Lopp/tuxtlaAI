const N8N = 'http://localhost:5678';
const EMAIL = 'admin@tuxtla.mx';
const PASSWORD = 'TuxtlaN8n123!';
const WF_ID = 'icfqlnBGNXWTLbuD';

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

    const w = await fetch(`${N8N}/rest/workflows/${WF_ID}`, { headers: auth });
    const wj = await w.json();
    const data = wj.data || {};
    console.log('active:', data.active, '· versionId:', data.versionId);
    for (const n of data.nodes || []) {
        if (n.type.includes('telegram')) {
            console.log('\n=== NODE:', n.name, n.type, 'typeVersion', n.typeVersion);
            console.log(JSON.stringify(n, null, 2));
        }
    }
})().catch(e => console.log('ERR', e.message));
