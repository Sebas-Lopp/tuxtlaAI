const N8N = 'http://localhost:5678';
const EMAIL = 'admin@tuxtla.mx';
const PASSWORD = 'TuxtlaN8n123!';
const CRED_ID = 'JS2LZfVOdcJAnyOk';
const TOKEN = '9154661333:AAF59SgusyMXELyqjmJYQU_VGAOiNUAaeNw';

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

    const r = await fetch(`${N8N}/rest/credentials/${CRED_ID}`, {
        method: 'PATCH', headers: auth,
        body: JSON.stringify({ name: 'Telegram Tuxtla', type: 'telegramApi', data: { accessToken: TOKEN } }),
    });
    const txt = await r.text();
    console.log('PATCH', r.status, txt.slice(0, 300));

    const v = await fetch(`${N8N}/rest/credentials/${CRED_ID}`, { headers: auth });
    const vj = await v.json();
    console.log('data final:', JSON.stringify(vj.data && vj.data.data));
})().catch(e => console.log('ERR', e.message));
