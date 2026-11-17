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
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ emailOrLdapLoginId: EMAIL, password: PASSWORD }),
    });
    const cookie = getCookie(res);
    const auth = { 'Content-Type': 'application/json', 'Cookie': `n8n-auth=${cookie}` };
    console.log('login cookie:', cookie ? 'ok' : 'MISSING');

    const w = await fetch(`${N8N}/rest/workflows/${WF_ID}`, { headers: auth });
    const wj = await w.json();
    const data = wj.data || {};
    console.log('workflow keys:', Object.keys(data).join(', '));
    console.log('id:', data.id);
    console.log('versionId:', data.versionId);
    console.log('activeVersionId:', data.activeVersionId);
    console.log('active:', data.active);
    if (data.versions) console.log('versions:', JSON.stringify(data.versions.map(v => ({ id: v.id, name: v.name }))));

    // Intentar activar con versionId
    const versionId = data.versionId || data.activeVersionId || (data.versions && data.versions[0] && data.versions[0].id);
    if (versionId) {
        const act = await fetch(`${N8N}/rest/workflows/${WF_ID}/activate`, {
            method: 'POST',
            headers: auth,
            body: JSON.stringify({ versionId }),
        });
        console.log('activate status:', act.status, (await act.text()).slice(0, 300));
    } else {
        console.log('NO versionId encontrado');
    }
})().catch(e => console.log('ERR', e.message));
