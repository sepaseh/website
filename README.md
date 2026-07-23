# sepaseh website

Personal portfolio for Mahdi Sepaseh, built with Astro and published as a fully
static site.

## Content

The canonical content lives in
[sepaseh/career](https://github.com/sepaseh/career). Before development and
production builds, the site downloads the relevant Markdown files and renders
them into static pages.

Optional environment variables:

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
