import { CATALOG_SCHEMA_VERSION, type ApiExport, type CatalogFile, type ComponentEntry } from "./catalog-types.js";

export const MCP_DOCS_PATH = "/docs/mcp";

export function checkSchemaVersion(data: { schemaVersion?: unknown }, source = "The catalogue") {
  if (data.schemaVersion !== CATALOG_SCHEMA_VERSION) {
    throw new Error(`${source} has schema version ${String(data.schemaVersion)}; this server reads version ${CATALOG_SCHEMA_VERSION}. Run \`npm run catalog\` again.`);
  }
}

export interface Resolution {
  entry: ComponentEntry;
  via: "name" | "short-name" | "export";
  exportName?: string;
}

const normalise = (name: string) =>
  name
    .trim()
    .replace(/^<\s*/, "")
    .replace(/\s*\/?>$/, "")
    .replace(/^@puckoops\/ui\s*[:/]?\s*/i, "")
    .replace(/^ui\//i, "")
    .toLowerCase();

export const shortName = (entry: ComponentEntry) => entry.name.split("/").pop() ?? entry.name;

export class Catalog {
  readonly docsUrl: string;
  private readonly exportOwner = new Map<string, ComponentEntry>();

  constructor(
    readonly data: CatalogFile,
    docsUrl?: string,
  ) {
    checkSchemaVersion(data);
    this.docsUrl = (docsUrl || data.docs.baseUrl).replace(/\/+$/, "");
    for (const entry of data.components) {
      for (const name of entry.exports) if (!this.exportOwner.has(name.toLowerCase())) this.exportOwner.set(name.toLowerCase(), entry);
    }
  }

  get entries() {
    return this.data.components;
  }

  get categories() {
    return this.data.categories;
  }

  find(name: string): Resolution | undefined {
    const key = normalise(name);
    if (!key) return undefined;
    const byName = this.entries.find((e) => e.name.toLowerCase() === key);
    if (byName) return { entry: byName, via: "name" };
    const byShort = this.entries.find((e) => shortName(e).toLowerCase() === key);
    if (byShort) return { entry: byShort, via: "short-name" };
    const owner = this.exportOwner.get(key);
    if (owner) {
      const exportName = owner.exports.find((x) => x.toLowerCase() === key) ?? name;
      return { entry: owner, via: "export", exportName };
    }
    return undefined;
  }

  isExported(name: string) {
    return this.data.api[name] !== undefined;
  }

  exists(name: string) {
    return this.find(name) !== undefined || this.isExported(name);
  }

  api(name: string): ApiExport | undefined {
    return this.data.api[name];
  }

  pageUrl(entry: ComponentEntry) {
    return `${this.docsUrl}${entry.docsPath}`;
  }

  mcpDocsUrl() {
    return `${this.docsUrl}${MCP_DOCS_PATH}`;
  }

  introUrl() {
    return `${this.docsUrl}/`;
  }

  suggest(name: string, limit = 3): string[] {
    const key = normalise(name);
    const candidates = [...new Set(this.entries.flatMap((e) => [e.name, ...e.exports]))];
    return candidates
      .map((candidate) => ({ candidate, distance: editDistance(key, candidate.toLowerCase().split("/").pop() ?? "") }))
      .filter(({ candidate, distance }) => distance <= Math.max(1, Math.floor(key.length / 4)) || (key.length >= 3 && candidate.toLowerCase().includes(key)))
      .sort((a, b) => a.distance - b.distance)
      .slice(0, limit)
      .map(({ candidate }) => candidate);
  }

  uncatalogued(): ApiExport[] {
    const listed = new Set(this.entries.flatMap((e) => e.exports));
    return Object.values(this.data.api).filter((a) => a.kind !== "type" && !listed.has(a.name));
  }

  uncataloguedGroup(name: string): { primary: ApiExport; members: ApiExport[]; types: ApiExport[] } | undefined {
    const key = normalise(name);
    const primary = this.uncatalogued().find((a) => a.name.toLowerCase() === key);
    if (!primary) return undefined;
    const members = this.uncatalogued().filter((a) => a.source === primary.source);
    const typeNames = new Set(
      members.flatMap((m) => [...(m.props?.props ?? []).map((p) => p.type), ...(m.props?.extends ?? []), m.signature ?? ""]).flatMap((t) => t.match(/\b[A-Z][A-Za-z0-9]*\b/g) ?? []),
    );
    const propsTypes = new Set(members.flatMap((m) => m.props?.typeName?.replace(/<.*$/, "") ?? []));
    const types = Object.values(this.data.api).filter((a) => a.kind === "type" && typeNames.has(a.name) && !propsTypes.has(a.name));
    return { primary, members, types };
  }

  lookalikePair(): [string, string] | undefined {
    for (const entry of this.entries) {
      for (const alt of entry.useInstead) {
        const other = this.find(alt.name);
        if (other && other.entry !== entry) return [shortName(entry), shortName(other.entry)];
      }
    }
    return undefined;
  }
}

function editDistance(a: string, b: string) {
  const row = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i++) {
    let diagonal = row[0]!;
    row[0] = i;
    for (let j = 1; j <= b.length; j++) {
      const above = row[j]!;
      row[j] = Math.min(row[j]! + 1, row[j - 1]! + 1, diagonal + (a[i - 1] === b[j - 1] ? 0 : 1));
      diagonal = above;
    }
  }
  return row[b.length]!;
}
