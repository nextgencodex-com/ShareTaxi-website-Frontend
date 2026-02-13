const fs = require('fs');
const path = require('path');

function walk(dir){
  const res = [];
  for(const name of fs.readdirSync(dir)){
    const full = path.join(dir,name);
    const stat = fs.statSync(full);
    if(stat.isDirectory()) res.push(...walk(full));
    else if(full.endsWith('.html')) res.push(full);
  }
  return res;
}

const files = walk(path.join(__dirname,'..','out'));
let changed = 0;
for(const f of files){
  let txt = fs.readFileSync(f,'utf8');
  const newTxt = txt.replace(/=(\"|\')\//g, '=$1./');
  if(newTxt !== txt){
    fs.writeFileSync(f,newTxt,'utf8');
    console.log('Modified:', f);
    changed++;
  }
}
console.log('Total files modified:', changed);
