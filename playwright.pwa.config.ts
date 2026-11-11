import { defineConfig, devices } from '@playwright/test';

const PORT = Number(process.env.PWA_PORT ?? 4173);

export default defineConfig({
  testDir: 'tests/pwa',
  workers: 1,
  retries: 0,
  reporter: 'list',
  outputDir: 'test-results/pwa',
  use: {
    baseURL: `http://localhost:${PORT}`,
    serviceWorkers: 'allow',
  },
  projects: [
    {
      name: 'pwa-chromium',
      use: { ...devices['Pixel 7'] },
    },
  ],
  webServer: {
    command: `npm run build && npx vite preview --host localhost --port ${PORT} --strictPort`,
    url: `http://localhost:${PORT}`,
    reuseExistingServer: false,
    timeout: 180_000,
  },
});
