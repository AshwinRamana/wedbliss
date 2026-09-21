/** Prepare the existing split HTML/CSS/JS Handlebars format; performs no remote writes. */
const fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'..');
const source=fs.readFileSync(path.join(root,'template/templates/sundara.html'),'utf8');
const css=[...source.matchAll(/<style>([\s\S]*?)<\/style>/g)].map(m=>m[1]).join('\n');
const js=[...source.matchAll(/<script>([\s\S]*?)<\/script>/g)].map(m=>m[1]).join('\n');
const html=source.match(/<body>([\s\S]*?)<\/body>/)[1].replace(/<script>[\s\S]*?<\/script>/g,'').trim();
const data=JSON.parse(fs.readFileSync(path.join(root,'scripts/fixtures/sundara-demo.json'),'utf8'));
const origin='https://www.wedbliss.co';
data.gallery.images=data.gallery.images.map(p=>new URL(p,origin).href);data.media.videoUrl=new URL(data.media.videoUrl,origin).href;
const template={id:'tm-sundara',name:'Sundara',tier:'premium',description:'A sunlit South Indian courtyard in ivory, indigo and antique brass. A graceful event timeline, personal photographs and your wedding film.',is_live:false,is_hero:false,html_content:html,css_content:css,js_content:js,demo_url:origin+'/templates/sundara-preview.html',thumbnail_url:origin+'/templates/thumbs/sundara.png'};
const output=process.argv[2]||'/tmp/sundara-release.json';fs.writeFileSync(output,JSON.stringify({template,data}));console.log('Prepared split Handlebars release:',{html:html.length,css:css.length,js:js.length,output});
