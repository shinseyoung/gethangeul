import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // honour PORT so a harness that assigns one is actually listened on
  server: { port: Number(process.env.PORT) || 5173 },
})
