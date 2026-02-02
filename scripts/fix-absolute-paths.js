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
if(!fs.existsSync(outDir)){
  console.error('out/ directory not found:', outDir);
  process.exit(1);
}

const files = walk(outDir).filter(f => /\.(html|js|json|txt|map)$/.test(f));
let changed = 0;
for(const f of files){
  let txt = fs.readFileSync(f,'utf8');
  let newTxt = txt
    // common absolute paths that break when hosted in a subfolder or opened as file://
    .split('/_next/').join('./_next/')
    .split('/images/').join('./images/')
    .split('/_vercel/').join('./_vercel/')
    .split('/favicon.ico').join('./favicon.ico')
    .split('/robots.txt').join('./robots.txt');

  // Also fix occurrences where the path is escaped inside JSON or JS strings like "\/_next\/..."
  newTxt = newTxt
    .split('\"/_next/').join('\"./_next/')
    .split("\'/_next/").join("\'./_next/")
    .split('\\/_next/').join('./_next/');

  if(newTxt !== txt){
    fs.writeFileSync(f,newTxt,'utf8');
    console.log('Modified:', f);
    changed++;
  }
}

console.log('Total files modified:', changed);
