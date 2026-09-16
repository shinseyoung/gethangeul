// Serves the built site the way GitHub Pages will: under /<repo>/, with
// index.html as the 404 page. The base path is the one thing local dev cannot
// show you, and it is the one thing most likely to break a deep link.
import { spawnSync } from 'node:child_process';
import { copyFileSync } from 'node:fs';

const base = process.env.BASE_PATH || '/gethangeul/';
spawnSync('npx', ['vite', 'build'], { stdio: 'inherit', shell: true, env: { ...process.env, BASE_PATH: base } });
copyFileSync('dist/index.html', 'dist/404.html');
spawnSync('npx', ['vite', 'preview', '--port', '4173'], { stdio: 'inherit', shell: true, env: { ...process.env, BASE_PATH: base } });
