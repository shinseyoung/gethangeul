import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // A GitHub project page serves the site from /<repo>/, a domain of our own
  // from /. The deploy workflow sets this; dev and a custom domain leave it
  // alone. useFlowStore reads the same value, so the router agrees with it.
  base: process.env.BASE_PATH || '/',
  // honour PORT so a harness that assigns one is actually listened on
  server: { port: Number(process.env.PORT) || 5173 },
})
