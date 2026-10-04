# sepaseh website

Personal portfolio for Mahdi Sepaseh, built with Astro and published as a fully
static site.

## Content

The canonical content lives in
[sepaseh/career](https://github.com/sepaseh/career). Before development and
production builds, the site syncs Markdown content and both ATS resume PDFs.
When the sibling `../career` checkout is available, it uses its latest working
files; otherwise it downloads them from GitHub. English pages live at `/` and
Persian pages at `/fa/`, with a page-preserving language switch, RTL layout, and
locally hosted Vazirmatn. Skills and education are accessible from About.

Optional environment variables:

- `CAREER_SOURCE_DIR` — explicit local career checkout path
- `CAREER_REPOSITORY` — defaults to `sepaseh/career`
- `CAREER_REF` — defaults to `main`

## Development

```sh
npm install
npm run dev
```

## Production build

```sh
npm run build
```
