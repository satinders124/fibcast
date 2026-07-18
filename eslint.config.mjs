// Minimal, repo-scoped ESLint setup (Expo flat config).
// Targets the project's own source only — no vendor/build noise.
import expoConfig from 'eslint-config-expo/flat.js';
import { defineConfig, globalIgnores } from 'eslint/config';

export default defineConfig([
  expoConfig,
  globalIgnores(['dist/*', 'node_modules/*', '.expo/*', 'web-build/*']),
]);
