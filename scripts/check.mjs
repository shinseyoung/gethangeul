// Bundles the TypeScript check with rolldown (already a vite dependency, so no
// test framework is installed) and runs it.
import { rolldown } from 'rolldown';

for (const input of ['scripts/matcher.check.ts', 'scripts/surname.check.ts', 'scripts/pair.check.ts', 'scripts/traits.check.ts', 'scripts/kdrama.check.ts', 'scripts/fortune.check.ts', 'scripts/typography.check.ts', 'scripts/roman.check.ts', 'scripts/locale.check.ts']) {
  const bundle = await rolldown({ input, platform: 'node', logLevel: 'warn' });
  const { output } = await bundle.generate({ format: 'esm' });
  await bundle.close();

  const code = output.find((chunk) => chunk.type === 'chunk')?.code;
  if (!code) {
    console.error(`nothing to run — ${input} did not bundle`);
    process.exit(1);
  }

  await import(`data:text/javascript;base64,${Buffer.from(code).toString('base64')}`);
}
