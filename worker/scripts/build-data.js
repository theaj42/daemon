/**
 * Build script: Reads YAML data files and generates embedded JS module
 * Run with: npm run build-data
 */

import { readFileSync, writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import yaml from 'js-yaml';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const dataDir = join(__dirname, '../../data');
const outputFile = join(__dirname, '../src/data.js');

// Read and parse YAML files
const publicData = yaml.load(readFileSync(join(dataDir, 'public.yaml'), 'utf8'));
const trustedData = yaml.load(readFileSync(join(dataDir, 'trusted.yaml'), 'utf8'));

// Generate the JavaScript module
const output = `// Auto-generated from YAML data files
// Run 'npm run build-data' to regenerate
// Generated: ${new Date().toISOString()}

export const publicData = ${JSON.stringify(publicData, null, 2)};

export const trustedData = ${JSON.stringify(trustedData, null, 2)};
`;

writeFileSync(outputFile, output);
console.log(`✓ Generated ${outputFile}`);
console.log(`  - Public data sections: ${Object.keys(publicData).join(', ')}`);
console.log(`  - Trusted data sections: ${Object.keys(trustedData).join(', ')}`);
