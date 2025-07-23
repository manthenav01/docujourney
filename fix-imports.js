#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Function to recursively find all TypeScript/JavaScript files
function findFiles(dir, extensions = ['.ts', '.tsx', '.js', '.jsx']) {
  let files = [];
  const items = fs.readdirSync(dir, { withFileTypes: true });
  
  for (const item of items) {
    const fullPath = path.join(dir, item.name);
    
    if (item.isDirectory() && !item.name.includes('node_modules') && !item.name.includes('.next')) {
      files = files.concat(findFiles(fullPath, extensions));
    } else if (item.isFile() && extensions.some(ext => item.name.endsWith(ext))) {
      files.push(fullPath);
    }
  }
  
  return files;
}

// Function to fix imports in a file
function fixImports(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let updated = false;
  
  // Fix malformed @docujourney/ui imports (like @docujourney/uicard -> @docujourney/ui)
  const malformedImports = [
    /@docujourney\/ui([a-z]+)/g,
    /@docujourney\/utils([a-z]+)/g
  ];
  
  for (const regex of malformedImports) {
    if (regex.test(content)) {
      if (regex.source.includes('ui')) {
        content = content.replace(regex, '@docujourney/ui');
      } else {
        content = content.replace(regex, '@docujourney/utils');
      }
      updated = true;
    }
  }
  
  // Fix specific common patterns
  const fixes = [
    // UI component imports - consolidate multiple imports from same package
    [/import { ([^}]+) } from '@docujourney\/ui';\s*import { ([^}]+) } from '@docujourney\/ui';/g, 
     "import { $1, $2 } from '@docujourney/ui';"],
    
    // Fix any remaining individual component imports
    [/from '@docujourney\/ui\/([^']+)'/g, "from '@docujourney/ui'"],
    [/from '@docujourney\/utils\/([^']+)'/g, "from '@docujourney/utils'"],
  ];
  
  for (const [pattern, replacement] of fixes) {
    if (pattern.test(content)) {
      content = content.replace(pattern, replacement);
      updated = true;
    }
  }
  
  if (updated) {
    fs.writeFileSync(filePath, content);
    console.log(`Fixed: ${filePath}`);
  }
}

// Process all files
console.log('Fixing import issues...');

const allFiles = [
  ...findFiles('./apps/public-app'),
  ...findFiles('./apps/auth-app')
];

allFiles.forEach(file => {
  fixImports(file);
});

console.log('Import fixes completed!');