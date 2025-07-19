import { defineConfig, type UserConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()] as UserConfig["plugins"],
  base: '/rouh-mahjong-web/',
})
