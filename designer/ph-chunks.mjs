import fs from 'node:fs';
const src = fs.readFileSync('js/icons.js', 'utf8'); const PH = JSON.parse(src.slice(src.indexOf('{'), src.lastIndexOf(';')));
const entries = []; for (const w of ['regular', 'duotone']) for (const [k, v] of Object.entries(PH[w])) entries.push([w, k, v]);
let chunk = [], size = 0, n = 0;
const flush = () => { if (!chunk.length) return; fs.writeFileSync(`/tmp/ph-${n++}.js`, `storage.PH = storage.PH || { regular: {}, duotone: {} };\nfor (const [w, k, v] of ${JSON.stringify(chunk)}) storage.PH[w][k] = v;\nreturn Object.keys(storage.PH.regular).length + '/' + Object.keys(storage.PH.duotone).length;`); chunk = []; size = 0; };
for (const e of entries) { const s = JSON.stringify(e).length; if (size + s > 60000) flush(); chunk.push(e); size += s; }
flush(); console.log(n);
