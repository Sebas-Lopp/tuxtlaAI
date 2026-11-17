const N8N = 'http://localhost:5678';
(async () => {
    let r = await fetch(`${N8N}/rest/settings`, { redirect: 'manual' });
    console.log('settings status:', r.status);
    console.log('settings raw:', (await r.text()).slice(0, 200));

    r = await fetch(`${N8N}/rest/owner/setup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'admin@tuxtla.mx', firstName: 'Admin', lastName: 'Tuxtla', password: 'TuxtlaN8n123!' }),
        redirect: 'manual',
    });
    console.log('owner/setup status:', r.status);
    console.log('set-cookie:', r.headers.get('set-cookie'));
    console.log('getSetCookie:', typeof r.headers.getSetCookie === 'function' ? JSON.stringify(r.headers.getSetCookie()) : 'n/a');
    console.log('owner/setup raw:', (await r.text()).slice(0, 400));
})().catch(e => console.log('ERR', e.message));
