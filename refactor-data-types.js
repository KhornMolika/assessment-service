const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'src');
const typesDir = path.join(srcDir, 'types');
const dataDir = path.join(srcDir, 'data');

if (!fs.existsSync(typesDir)) fs.mkdirSync(typesDir, { recursive: true });
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });

// 1. Find all types and mock data files
const typesFiles = [];
const dataFiles = [];

function scanDir(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      scanDir(fullPath);
    } else {
      if (fullPath.includes('/types/') && fullPath.endsWith('.ts') && entry.name !== 'index.ts') {
        typesFiles.push(fullPath);
      }
      if ((fullPath.includes('/mock-data/') || entry.name === 'mock-data.json') && fullPath.endsWith('.json')) {
        dataFiles.push(fullPath);
      }
    }
  }
}

scanDir(path.join(srcDir, 'components'));

// 2. Move files and build replacement maps
const typeReplacements = [];
for (const file of typesFiles) {
  const fileName = path.basename(file);
  const dest = path.join(typesDir, fileName);
  fs.renameSync(file, dest);
  
  // Calculate the old import path
  // e.g. /Users/.../src/components/content/types/question.types.ts
  // Old import could be "@/src/components/content/types/question.types"
  const relPath = path.relative(srcDir, file).replace(/\\/g, '/').replace(/\.tsx?$/, '');
  
  typeReplacements.push({
    fromRegex: new RegExp(`@/src/${relPath}`, 'g'),
    to: `@/src/types/${fileName.replace(/\.ts$/, '')}`
  });
}

// Special case: old index.ts imports like `@/src/components/content/types`
// Since we don't know exactly what was imported, we'll replace the prefix but this might be tricky.
// Let's just blindly replace `@/src/components/[domain]/types` with `@/src/types`
// This assumes the file names exported are the same as imported, which usually they are.
const domainTypesRegex = /@\/src\/components\/[^/]+\/types/g;

const dataReplacements = [];
for (const file of dataFiles) {
  let fileName = path.basename(file);
  if (fileName === 'mock-data.json') {
    fileName = 'dashboard-mock-data.json';
  }
  const dest = path.join(dataDir, fileName);
  fs.renameSync(file, dest);
}

// 3. Update all files with new paths
function processDirectory(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      processDirectory(fullPath);
    } else if (fullPath.endsWith('.ts') || fullPath.endsWith('.tsx')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      let newContent = content;
      
      for (const r of typeReplacements) {
        newContent = newContent.replace(r.fromRegex, r.to);
      }
      
      newContent = newContent.replace(domainTypesRegex, '@/src/types');
      
      // Update data paths in the API files
      newContent = newContent.replace(/src\/components\/[^/]+\/api\/mock-data/g, 'src/data');
      newContent = newContent.replace(/src\/components\/dashboard\/api\/mock-data\.json/g, 'src/data/dashboard-mock-data.json');

      if (content !== newContent) {
        fs.writeFileSync(fullPath, newContent, 'utf8');
        console.log('Updated imports in:', fullPath);
      }
    }
  }
}

processDirectory(srcDir);

// 4. Cleanup old types and mock-data directories
function cleanup(dir) {
  if (!fs.existsSync(dir)) return;
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      cleanup(fullPath);
    } else if (entry.name === 'index.ts' && fullPath.includes('/types/')) {
       fs.unlinkSync(fullPath); // Delete index.ts in old types folders
    }
  }
  try { fs.rmdirSync(dir); } catch (e) {}
}

cleanup(path.join(srcDir, 'components'));

console.log('Refactoring types and data done!');
