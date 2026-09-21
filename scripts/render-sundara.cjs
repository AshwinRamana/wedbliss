/** Render a demo only; the uploadable template never contains sample couple data. */
const fs=require('node:fs');
const path=require('node:path');
const Handlebars=require('handlebars');
const root=path.resolve(__dirname,'..');
const source=fs.readFileSync(path.join(root,'template/templates/sundara.html'),'utf8');
const data=JSON.parse(fs.readFileSync(path.join(__dirname,'fixtures/sundara-demo.json'),'utf8'));
const html=Handlebars.compile(source)(data);
fs.writeFileSync(path.join(root,'public/templates/sundara-preview.html'),html);
console.log('Rendered public/templates/sundara-preview.html');
