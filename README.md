# Sales Analytics (Manager)

Manager dashboard for multi-brand clothing analytics. Data is driven by sales CSVs in `src/data/`. The Manager page loads precomputed analytics from `public/data/precomputed.json`.

## Data pipeline

Before running the app (or building), run the data pipeline to produce anonymized sales and precomputed analytics. You can run the full pipeline once, or run individual steps when only some inputs change.

### Master command (run everything)

```bash
npm run data-pipeline
```

This runs, in order:

1. **anonymize-sales** → `mark_sales_anonymized.csv` + `public/data/member_prefix_map.json`
2. **build-member-demographics** → `public/data/member_demographics.json` (age/gender from membership + users)
3. **precompute** → `public/data/precomputed.json`

### Individual commands

| Command                             | Inputs                                                                                                   | Outputs                                                                    |
| ----------------------------------- | -------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------- |
| `npm run anonymize-sales`           | `src/data/mark_sales_md.csv`, `mark_sales_EL.csv`, `mark_sales_LM.csv`                                   | `src/data/mark_sales_anonymized.csv`, `public/data/member_prefix_map.json` |
| `npm run build-member-demographics` | `public/data/member_prefix_map.json`, `src/data/mark_membership_MD_LM_EL.csv`, `src/data/mark_users.csv` | `public/data/member_demographics.json`                                     |
| `npm run precompute`                | `mark_sales_anonymized.csv`, (optional) `public/data/member_demographics.json`                           | `public/data/precomputed.json`                                             |

**Requirements:**

- **anonymize-sales** must be run before **build-member-demographics** (demographics script needs `member_prefix_map.json`).
- **anonymize-sales** must be run before **precompute** (precompute reads `mark_sales_anonymized.csv`).
- **build-member-demographics** is optional. If you don’t have `mark_membership_MD_LM_EL.csv` and `mark_users.csv`, skip it and run only `npm run anonymize-sales && npm run precompute`; age/gender segments will use a fallback.

For automated builds (e.g. Vercel), commit or upload `public/data/precomputed.json` so the build can skip the pipeline.

# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) (or [oxc](https://oxc.rs) when used in [rolldown-vite](https://vite.dev/guide/rolldown)) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default defineConfig([
  globalIgnores(["dist"]),
  {
    files: ["**/*.{ts,tsx}"],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ["./tsconfig.node.json", "./tsconfig.app.json"],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
]);
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from "eslint-plugin-react-x";
import reactDom from "eslint-plugin-react-dom";

export default defineConfig([
  globalIgnores(["dist"]),
  {
    files: ["**/*.{ts,tsx}"],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs["recommended-typescript"],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ["./tsconfig.node.json", "./tsconfig.app.json"],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
]);
```
