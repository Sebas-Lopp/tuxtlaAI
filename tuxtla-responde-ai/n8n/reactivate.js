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

    // obtener versionId actual
    const w = await fetch(`${N8N}/rest/workflows/${WF_ID}`, { headers: auth });
    const wj = await w.json();
    const versionId = (wj.data && wj.data.versionId) || '6456a388-4c34-4597-b858-f4a2e7c75f9a';

    // desactivar (ignorar error si ya estaba inactivo)
    let r = await fetch(`${N8N}/rest/workflows/${WF_ID}/deactivate`, { method: 'POST', headers: auth });
    console.log('deactivate:', r.status, (await r.text()).slice(0, 150));

    // activar
    r = await fetch(`${N8N}/rest/workflows/${WF_ID}/activate`, {
        method: 'POST', headers: auth,
        body: JSON.stringify({ versionId }),
    });
    const txt = await r.text();
    console.log('activate:', r.status, txt.slice(0, 300));
})().catch(e => console.log('ERR', e.message));
