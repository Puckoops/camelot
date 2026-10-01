# @puckoops/camelot-mcp

A [Model Context Protocol](https://modelcontextprotocol.io) server for Camelot, the Puckoops design system. It gives an AI coding
assistant the `@puckoops/camelot` component catalogue, the design tokens and the hard rules, so it builds UI with the real
system instead of guessing at it.

Everything it serves is generated from the package's sources, so it cannot drift from what ships. All tools are read-only.

The docs site (`apps/site`) serves the server at `/mcp`, beside the docs, from the same Vercel deployment. This package holds
the tools, the catalogue builder, and a standalone server for editors (stdio) and self-hosting (HTTP, Docker).

## Tools

| Tool | Input | Returns |
| --- | --- | --- |
| `get_components` | `{ category? }`, one of the catalogue's categories | Every component grouped by category, plus exports that are not catalogued yet |
| `get_component_details` | `{ name }`, a catalogue name or any export | Summary, import, exports, when to use, use instead, props of every export, related types, docs page URL (and structured JSON) |
| `compare_components` | `{ a, b }` | Which to use when, from both components' use-instead guidance and summaries |
| `search_components` | `{ query }` | Matches ranked over names, exports, keywords, summaries and when-to-use text |
| `get_color_tokens` | `{ group? }`: `roles`, `neutral`, `hues` or `effects` | Tokens with light and dark values, alias chains and where components use them; hue ramps carry the "only inside Chip" rule |
| `get_typography` | none | Type classes with their declarations, font tokens and ink classes |
| `get_icons_guide` | none | The icons guide, `Icon` props and glyph shapes |
| `get_hard_rules` | none | The hard rules with their reasons, marked checked or review-by-hand |
| `get_element_mapping` | none | Which component replaces each raw element, flagging names the package does not export |
| `get_app_setup` | none | The app setup code and peer dependencies |
| `validate_code` | `{ code }` | Every `detect` pattern of the hard rules run over the code: rule id, message, line, column and offending text, with a pass/fail summary |
| `get_docs` | `{ component? }` | One component's or hook's docs page URL, or every docs page |
| `get_full_guide` | none | All of the above as one markdown document |

Responses are markdown. `get_component_details`, `compare_components`, `search_components`, `validate_code` and
`get_docs` also return `structuredContent`; the last four declare an output schema. The input schemas carry `examples`,
which the docs site's Tool reference and Try it out pages use as sample arguments.

The catalogue is also exposed as resources: `camelot://catalog.json`, `camelot://guide.md`, `camelot://tokens.json`,
`camelot://rules.json` and the template `camelot://components/{name}`.

On connect the server sends instructions that tell the assistant to call `get_hard_rules` before writing UI,
`compare_components` when two components look alike, and `validate_code` before finishing.

## How the catalogue is built

`buildCatalog({ root, docsRoot, docsUrl? })` in `scripts/catalog/build.ts` reads the design-system sources in `root`
(`packages/camelot`) and the docs pages in `docsRoot` (`apps/site/src/content`). The site's `npm run generate` calls it and
writes `apps/site/generated/catalog.json`; `npm run catalog` here writes `data/catalog.json` for the standalone server.

| Source | What it becomes |
| --- | --- |
| `src/catalog/components.ts` (imported) | Catalogue entries; categories in the order of the `Category` type |
| `src/index.ts` and everything it re-exports | Each export's kind, JSDoc, props (`<Export>Props` or the parameter type) with allowed values and defaults, signatures of functions and hooks, and exported types, read with the TypeScript compiler API from the `.tsx` sources, never from `dist/` |
| `src/catalog/rules.ts` (imported) | Hard rules with their `detect` patterns, element mapping, icons guide and app setup |
| `src/styles/tokens.css` | Colour tokens with light and dark values, `var()` aliases resolved per theme, effects, spacing, radius, layout, font and motion tokens |
| `src/components/ui/**/*.module.css`, `src/styles/*.css` | Which components use each token, and for which properties |
| `src/styles/type.css`, `base.css`, `motion.css` | Type classes with their declarations, ink classes, utility classes |
| `README.md` | The tagline and the rules worth memorising |
| `apps/site/src/content/**/*.docs.tsx` | Which entries have a docs page, from the `title` of each file's default export (`"ui/Button"`, `"Hooks/useFileUpload"`), read as the site's generator reads it |

Every entry has a `docsPath`: `/docs/components/<slug>` for a component and `/docs/hooks/<slug>` for a hook, where the slug
is the catalogue name in kebab case with `/` as `-` (`Cards/FigureCard` → `cards-figure-card`). `hasDocs` says whether a docs
file documents it, and the top-level `docs` holds the base URL and the pages found. A docs file whose title names no
catalogue entry is left out with a warning.

The component list is never hard-coded: a component added to the catalogue or to `src/index.ts` appears on the next
build. Exports without a catalogue entry are still listed, with their props. The build prints warnings for guidance that
names components the package does not export.

`data/catalog.json` is generated and ignored by git.

## In the docs site

The package entry imports no Node built-ins and reads no files, so a bundler can put it in a serverless function; the
catalogue comes in as data. A Next.js route handler needs only this; `apps/site/src/app/mcp/route.ts` does the same,
and `apps/site/src/app/health/route.ts` swaps in `handleHealthRequest`:

```ts
import catalogJson from "@generated/catalog.json";
import { Catalog, type CatalogFile, handleMcpRequest } from "@puckoops/camelot-mcp";

export const dynamic = "force-dynamic";

const handle = (request: Request) =>
  handleMcpRequest(request, new Catalog(catalogJson as unknown as CatalogFile, new URL(request.url).origin));

export const GET = handle;
export const POST = handle;
export const DELETE = handle;
export const OPTIONS = handle;
```

`handleMcpRequest` answers each POST or DELETE with a fresh `createMcpServer(catalog)` on a fresh
`WebStandardStreamableHTTPServerTransport` in stateless JSON mode, and mirrors the Node server for GET, OPTIONS and CORS.
The docs links in its answers use the request's origin. `handleHealthRequest` serves `/health` the same way.

| Export | What it is |
| --- | --- |
| `createMcpServer(catalog)` | An `McpServer` with every tool and resource, ready to connect to any transport |
| `new Catalog(data, docsUrl?)` | The catalogue over a `CatalogFile` object; `docsUrl` overrides `data.docs.baseUrl` |
| `handleMcpRequest(request, catalog, options?)`, `handleHealthRequest(...)` | Web `Request` → `Response` handlers for `/mcp` and `/health` |
| `corsHeaders(origin?, request?)`, `CORS_ALLOWED_HEADERS`, `CORS_EXPOSED_HEADERS`, `CORS_ALLOWED_METHODS`, `CORS_MAX_AGE_SECONDS` | The CORS policy both transports share |
| `healthInfo(catalog)`, `MCP_PATH`, `HEALTH_PATH`, `SERVER_NAME`, `SERVER_VERSION` | What `/health` reports, and the paths |
| `CatalogFile`, `ComponentEntry`, `DocsPageRef` and the other catalogue types | The shape of `catalog.json` |

## Standalone server

Node 20 or later. From the repo root:

```bash
npm install
npm run catalog -w @puckoops/camelot-mcp
npm run build -w @puckoops/camelot-mcp
npm start -w @puckoops/camelot-mcp
node packages/camelot-mcp/dist/server.js --stdio
```

`npm start` serves Streamable HTTP on port 8787; `--stdio` serves one editor over stdin and stdout.
`npm run dev -w @puckoops/camelot-mcp` rebuilds the catalogue and restarts whenever the package sources or the docs
pages change.

| Variable | Default | Purpose |
| --- | --- | --- |
| `PORT` | `8787` | HTTP port (`--port` also works) |
| `HOST` | all interfaces | Interface to bind (`--host`) |
| `DOCS_URL` | `http://localhost:3030` | Base of the docs links; read by `npm run catalog` and, as an override, by the server (`--docs-url`) |
| `CORS_ORIGIN` | `*` | `Access-Control-Allow-Origin` for browsers |
| `CATALOG_PATH` | `data/catalog.json` | Where `npm run catalog` writes and the server reads (`--catalog`) |
| `CAMELOT_ROOT` | `../camelot` | The design-system package `npm run catalog` reads |
| `DOCS_ROOT` | `../../apps/site/src/content` | The docs pages `npm run catalog` scans |
| `MCP_TRANSPORT` | `http` | `stdio` does the same as `--stdio` |

### HTTP

The standalone server and the docs site answer the same way:

- `POST /mcp`: JSON-RPC. Stateless, so no session is needed and any request can come first; responses are JSON.
  Clients must send `Accept: application/json, text/event-stream`.
- `DELETE /mcp`: accepted and ignored, since there are no sessions.
- `GET /mcp`: `405`, because the server does not open an SSE stream.
- `GET /health`: status, versions, component count, when the catalogue was built and the docs URL.
- CORS allows any origin by default and exposes `Mcp-Session-Id`, so a page on another origin can call the server.

## Install in an assistant

Use the docs site's endpoint, `https://<docs-domain>/mcp`, or `http://localhost:3030/mcp` while the site runs locally.
The site's MCP page shows these snippets with its own URL filled in.

Claude Code:

```bash
claude mcp add camelot --scope user --transport http https://<docs-domain>/mcp
claude mcp add camelot --scope user -- node /path/to/camelot/packages/camelot-mcp/dist/server.js --stdio
```

Cursor, in `~/.cursor/mcp.json` or a project's `.cursor/mcp.json`:

```json
{ "mcpServers": { "camelot": { "url": "https://<docs-domain>/mcp" } } }
```

Claude Desktop, in `claude_desktop_config.json`, bridged to the endpoint or run locally over stdio:

```json
{ "mcpServers": { "camelot": { "command": "npx", "args": ["-y", "mcp-remote", "https://<docs-domain>/mcp"] } } }
```

```json
{
  "mcpServers": {
    "camelot": { "command": "node", "args": ["/path/to/camelot/packages/camelot-mcp/dist/server.js", "--stdio"] }
  }
}
```

VS Code, in `.vscode/mcp.json`:

```json
{ "servers": { "camelot": { "type": "http", "url": "https://<docs-domain>/mcp" } } }
```

curl:

```bash
curl -s https://<docs-domain>/mcp \
  -H 'Content-Type: application/json' \
  -H 'Accept: application/json, text/event-stream' \
  -d '{"jsonrpc":"2.0","id":1,"method":"tools/list"}'

curl -s https://<docs-domain>/mcp \
  -H 'Content-Type: application/json' \
  -H 'Accept: application/json, text/event-stream' \
  -d '{"jsonrpc":"2.0","id":2,"method":"tools/call","params":{"name":"compare_components","arguments":{"a":"Select","b":"SegmentedControl"}}}'
```

## Docker

Build from the repo root, because the image builds the catalogue from `packages/camelot` and `apps/site/src/content`:

```bash
docker build -f packages/camelot-mcp/Dockerfile -t camelot-mcp .
docker run --rm -p 8787:8787 -e DOCS_URL=https://<docs-domain> camelot-mcp
```

`Dockerfile.dockerignore` limits the context to the root manifests, the package sources, the docs pages and this folder.
The image is `node:22-alpine` with only this package's production dependencies, runs as the `node` user, serves HTTP on
`PORT` and has a health check on `/health`.

## Tests

```bash
npm test
npm run typecheck
```

Vitest covers `validate_code`, the `search_components` ranking, `compare_components` and the docs slugs; lists the tools
and calls `get_component_details` through the SDK client in process; talks to the Node HTTP transport; and drives
`handleMcpRequest` with real `Request` objects through the web-standard transport: `initialize`, `tools/list`, `get_docs`
and the CORS preflight. The tests that need the real catalogue build it from the sources in memory, so they do not depend
on `data/catalog.json`.

## Docs site

The site documents the server under MCP → Camelot MCP: its docs page (`/docs/mcp`) and three stories, How To Use
(`/docs/mcp/how-to-use`), Tool Reference (`/docs/mcp/tool-reference`, read live with `initialize` and `tools/list`) and
Try It Out (`/docs/mcp/try-it-out`). They call the site's own `/mcp`.
