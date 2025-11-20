const fs = require('fs');
const path = require('path');

function walk(dir){
  const res = [];
  for(const name of fs.readdirSync(dir)){
    const full = path.join(dir,name);
    const stat = fs.statSync(full);
    if(stat.isDirectory()) res.push(...walk(full));
    else res.push(full);
  }
  return res;
}

const outDir = path.join(__dirname,'..','out');
const files = walk(outDir).filter(f => /\.(html|js|json|txt|map)$/.test(f));
let changed = 0;
for(const f of files){
  let txt = fs.readFileSync(f,'utf8');
  const newTxt = txt
    .split('../_next/').join('./_next/')
    .split('../images/').join('./images/')
    .split('../_vercel/').join('./_vercel/')
    .split('..\/ _next\/').join('./_next/');
  if(newTxt !== txt){
    fs.writeFileSync(f,newTxt,'utf8');
    console.log('Normalized:', f);
    changed++;
  }
}
console.log('Total normalized:', changed);
