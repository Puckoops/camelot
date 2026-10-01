import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { Catalog, checkSchemaVersion } from "./catalog.js";
import type { CatalogFile } from "./catalog-types.js";

export const DEFAULT_CATALOG_PATH = fileURLToPath(new URL("../data/catalog.json", import.meta.url));

export class CatalogNotFoundError extends Error {}

export function readCatalogFile(path = process.env.CATALOG_PATH || DEFAULT_CATALOG_PATH): CatalogFile {
  let text: string;
  try {
    text = readFileSync(path, "utf8");
  } catch {
    throw new CatalogNotFoundError(`No catalogue at ${path}. Run \`npm run catalog\` in packages/camelot-mcp to generate it from the package sources.`);
  }
  const data = JSON.parse(text) as CatalogFile;
  checkSchemaVersion(data, path);
  return data;
}

export function loadCatalog(options: { path?: string; docsUrl?: string } = {}) {
  return new Catalog(readCatalogFile(options.path), options.docsUrl ?? process.env.DOCS_URL);
}
