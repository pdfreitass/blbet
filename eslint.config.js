// Lint partilhado do monorepo (DT-015, item 3): typescript-eslint em todos os pacotes,
// regras de hooks do React só em apps/web.
// O typescript-eslint ainda não suporta o TypeScript 7: a raiz resolve `typescript` para o
// pacote de compatibilidade do TS 6 (ver package.json). Os pacotes continuam a compilar com o 7.
import js from '@eslint/js';
import reactHooks from 'eslint-plugin-react-hooks';
import globals from 'globals';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  { ignores: ['**/dist/', '**/coverage/', '**/node_modules/'] },
  js.configs.recommended,
  tseslint.configs.recommended,
  {
    // Convenção já usada no código: `_nome` marca um parâmetro ou uma desestruturação que existe só pela forma.
    rules: {
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_', ignoreRestSiblings: true },
      ],
    },
  },
  {
    files: ['apps/api/**/*.ts', 'packages/**/*.ts', '*.js'],
    languageOptions: { globals: globals.node },
  },
  {
    ...reactHooks.configs.flat.recommended,
    files: ['apps/web/**/*.{ts,tsx}'],
    languageOptions: { globals: globals.browser },
  },
);
