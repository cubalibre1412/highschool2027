import { rm } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

// This target is fixed inside this checkout; source data lives in public/.
const root = fileURLToPath(new URL('../', import.meta.url));
const output = fileURLToPath(new URL('../dist/', import.meta.url));
if (!output.startsWith(root) || output === root) throw new Error('Invalid build output path');
await rm(output, { recursive: true, force: true });
