# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some Oxlint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react/README.md) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the Oxlint configuration

Linting is handled by [Oxlint](https://oxc.rs/docs/guide/usage/linter/). The configuration lives in `.oxlintrc.json`.

- Run `pnpm lint` to lint the project, or `pnpm lint:fix` to apply auto-fixes.
- Enable additional rule categories in `.oxlintrc.json` when you want stricter checks:

```json
{
  "categories": {
    "correctness": "error",
    "suspicious": "warn"
  }
}
```

- For type-aware rules, install `oxlint-tsgolint` and enable the relevant TypeScript rules in `.oxlintrc.json`.
