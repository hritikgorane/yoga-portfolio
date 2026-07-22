const fs = require('fs');
const path = require('path');
function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) { 
      results = results.concat(walk(file));
    } else { 
      if (file.endsWith('.js') || file.endsWith('.jsx')) results.push(file);
    }
  });
  return results;
}
const files = walk('client/src');
for (const file of files) {
  let content = fs.readFileSync(file, 'utf8');
  const original = content;
  content = content.replace(/fetch\('\/api\//g, 'fetch(\'https://yoga-portfolio.onrender.com/api/');
  content = content.replace(/fetch\(\`\/api\//g, 'fetch(`https://yoga-portfolio.onrender.com/api/');
  content = content.replace(/fetch\('\/uploads\//g, 'fetch(\'https://yoga-portfolio.onrender.com/uploads/');
  if (content !== original) {
    fs.writeFileSync(file, content, 'utf8');
    console.log('Updated ' + file);
  }
}
