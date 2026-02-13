import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  // GitHub Pages 部署时使用仓库名作为 base 路径
  // 如果绑定了自定义域名，改为 '/'
  base: '/TheFinalApplause/',
  plugins: [react()],
})
