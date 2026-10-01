import catalogJson from "@generated/catalog.json";
import { Catalog, type CatalogFile } from "@puckoops/camelot-mcp";

const data = catalogJson as unknown as CatalogFile;

export function catalogFor(request: Request) {
  return new Catalog(data, new URL(request.url).origin);
}
