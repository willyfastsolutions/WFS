const fs = require('fs');
const path = require('path');

const outDir = path.join(__dirname, 'out');

function processDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat.isDirectory()) {
      processDir(filePath);
    } else if (file.endsWith('.html')) {
      let content = fs.readFileSync(filePath, 'utf8');
      
      // Calculate relative depth to the root of the output directory
      const relativePathToRoot = path.relative(dir, outDir);
      const prefix = relativePathToRoot ? relativePathToRoot.replace(/\\/g, '/') + '/' : './';
      
      // Replace absolute paths starting with /_next/ to relative ones
      content = content.replace(/(href|src)="\/_next\//g, `$1="${prefix}_next/`);
      // Replace absolute paths starting with /favicon.ico to relative ones
      content = content.replace(/(href|src)="\/favicon\.ico/g, `$1="${prefix}favicon.ico`);
      
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`Processed ${filePath} with relative prefix: ${prefix}`);
    }
  }
}

if (fs.existsSync(outDir)) {
  processDir(outDir);
  console.log('Post-export processing completed successfully!');
} else {
  console.error('Error: out/ directory not found.');
}
