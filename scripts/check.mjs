// Bundles the TypeScript check with rolldown (already a vite dependency, so no
// test framework is installed) and runs it.
import { rolldown } from 'rolldown';

const bundle = await rolldown({
  input: 'scripts/matcher.check.ts',
  platform: 'node',
  logLevel: 'warn',
});
const { output } = await bundle.generate({ format: 'esm' });
await bundle.close();

const code = output.find((chunk) => chunk.type === 'chunk')?.code;
if (!code) {
  console.error('nothing to run — the check did not bundle');
  process.exit(1);
}

await import(`data:text/javascript;base64,${Buffer.from(code).toString('base64')}`);
