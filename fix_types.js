const fs = require('fs');
let content = fs.readFileSync('src/types.ts', 'utf8');

// The original file had multiple notes?: string; let's fix it by regex or just rewriting.
