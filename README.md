# Camelot

Camelot is the Puckoops design system: the React package `@puckoops/camelot`, its documentation site, and an
MCP server that gives AI coding assistants the same catalogue. The site is a Next.js app that deploys to Vercel;
the package is what products such as Orbit install.

## What is in the repo

| Path | What it is |
| --- | --- |
| `packages/camelot` | `@puckoops/camelot`: tokens, type and components, built with tsup into `dist/`. This is all a product installs. |
| `packages/camelot-mcp` | The MCP tools, the catalogue builder, and a standalone server for editors (stdio) and self-hosting (HTTP, Docker). |
| `apps/site` | The Next.js site, laid out like the Storybook it replaced: a sidebar of components with their docs pages and stories, a toolbar, and an addon panel on each story. Also the design tokens, the MCP guide and the `/mcp` endpoint. Deployed to Vercel. |

## Where the content lives

There is no database. Every page and every MCP answer is compiled from files in this repo when the site builds.

| Content | Source |
| --- | --- |
| Component summaries, when to use, alternatives, keywords, categories | `packages/camelot/src/catalog/components.ts` |
| Hard rules, element mapping, icons guide, app setup | `packages/camelot/src/catalog/rules.ts` |
| Props, defaults, allowed values, hook signatures | The component sources in `packages/camelot/src`, read by the TypeScript compiler |
| Colour, type, spacing, radius and motion tokens | `packages/camelot/src/styles/*.css` |
| Each page's examples: preview, code and controls | `apps/site/src/content/**/*.docs.tsx` |
| Introduction, token pages and the MCP guide | `apps/site/src/components/{intro,tokens/pages,mcp}`, routed from `apps/site/src/app` |

`npm run generate -w @puckoops/camelot-site` compiles these into `apps/site/generated/` (`catalog.json`,
`pages.json`, `styles.json`, `registry.tsx`). That folder is rebuilt on every dev start and every build and is
not committed. The site and its `/mcp` endpoint both read `catalog.json`, so the docs and the MCP answers cannot
drift apart. To change what either says, edit the source file and rebuild.

## Develop

```bash
npm install
npm run dev
```

`npm run dev` builds the package and starts the site on http://localhost:3030. It watches `apps/site/src/content`
and the package sources and regenerates the data on every change; run `npm run dev -w @puckoops/camelot` beside
it to rebuild the components as you edit them.

```bash
npm test
npm run typecheck
npm run lint
npm run build
```

## Deploy the site to Vercel

1. Import `Puckoops/camelot` in Vercel.
2. Set **Root Directory** to `apps/site`. `apps/site/vercel.json` installs from the repo root, and the build
   compiles the package and the catalogue before Next.js.
3. Deploy. The site serves the docs, `https://<domain>/mcp` is the MCP endpoint, and `/health` reports status.

For a domain such as `camelot.puckoops.com`, add it to the Vercel project and create the CNAME record Vercel
asks for at your DNS provider.

## Ship the package

`npm run pack:camelot` builds `@puckoops/camelot` and writes `puckoops-camelot-<version>.tgz` at the repo root,
which an app can install directly.

## Add a component page

1. Build the component in `packages/camelot/src/components/ui/<Name>/` and export it from `src/index.ts`.
2. Add its catalogue entry to `packages/camelot/src/catalog/components.ts`.
3. Add `apps/site/src/content/components/<Name>.docs.tsx`. Its default export has `title: "ui/<Name>"`, and its
   named exports are its stories: the first is the docs page's preview with the controls, the rest follow under
   Examples, and each one also gets its own story page with the addon panel. `Button.docs.tsx` is the model.

The generator stops with an error if a docs file names an entry the catalogue does not have.
