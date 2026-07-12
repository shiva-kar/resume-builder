const fs = require('fs');

function processFile(filename) {
  let content = fs.readFileSync(filename, 'utf8');
  
  // Remove 0.4.NaN block (from ## [0.4.NaN] to the next --- or EOF)
  content = content.replace(/## \[0\.4\.NaN\].*?(?=---)/s, '');
  
  // Standardize version tags: [Beta 0.4] -> [0.4.0-beta]
  content = content.replace(/## \[Beta ([\d.]+)\]/g, (match, v) => {
    // If it is 0.4, it becomes 0.4.0-beta. If it is 0.3.1, it becomes 0.3.1-beta.
    const parts = v.split('.');
    if (parts.length === 2) parts.push('0');
    return `## [${parts.join('.')}-beta]`;
  });

  // Standardize version tags: [Alpha 0.7] -> [0.7.0-alpha]
  content = content.replace(/## \[Alpha ([\d.]+)\]/g, (match, v) => {
    const parts = v.split('.');
    if (parts.length === 2) parts.push('0');
    return `## [${parts.join('.')}-alpha]`;
  });

  fs.writeFileSync(filename, content);
}

processFile('CHANGELOG.md');
processFile('UPDATES.md');
console.log('Fixed versions');
