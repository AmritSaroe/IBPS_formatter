# IBPS Formatter

A browser-only React/Vite application for resizing and converting IBPS exam documents to the required specifications. Image and PDF processing happens locally in the browser; uploaded files are not sent to a server.

## Run locally

```bash
npm install
npm run dev
```

Open the local URL printed by Vite. To create a production build locally:

```bash
npm run build
npm run preview
```

## Deploy to GitHub Pages

This repository includes a GitHub Actions workflow at `.github/workflows/deploy.yml`. Every push to `main` builds the app and deploys the `dist` directory to GitHub Pages.

GitHub Pages must be enabled once by a repository administrator. The workflow token is intentionally not allowed to create the Pages site, so the `configure-pages` step will report `Not Found` or `Resource not accessible by integration` until this setting is completed:

1. Open the repository's **Settings** page.
2. Select **Pages** in the **Code and automation** section.
3. Under **Build and deployment → Source**, select **GitHub Actions**.
4. Save the setting, then open **Actions** and rerun the latest failed `Deploy to GitHub Pages` workflow, or push another commit.

After the first successful workflow run, the app will be available at:

<https://amritsaroe.github.io/IBPS_formatter/>

The workflow sets `BASE_PATH=/IBPS_formatter/`, and the Vite configuration uses that value for JavaScript, public assets, and PWA URLs. Local builds continue to use `/` by default.

## Useful commands

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start the development server |
| `npm run build` | Create a production build |
| `npm run preview` | Preview the production build |
| `npm run lint` | Type-check the project |
