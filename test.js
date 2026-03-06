const fs = require('fs');
const env = fs.readFileSync('.env.local', 'utf8').split('\n').reduce((acc, line) => {
    const [k, ...v] = line.split('=');
    if (k && v) acc[k.trim()] = v.join('=').trim().replace(/['"]/g, '');
    return acc;
}, {});

fetch(env.NEXT_PUBLIC_SUPABASE_URL + '/rest/v1/templates?select=id,tier,name', {
    headers: {
        'apikey': env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
        'Authorization': 'Bearer ' + env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    }
}).then(r => r.json()).then(data => {
    console.log(JSON.stringify(data, null, 2));
}).catch(console.error);
