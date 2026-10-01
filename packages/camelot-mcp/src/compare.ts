import type { ComponentEntry } from "./catalog-types.js";
import { type Catalog, shortName } from "./catalog.js";

export interface ComparedSide {
  query: string;
  name: string;
  entry?: ComponentEntry;
  exportName?: string;
  exported: boolean;
}

export interface Guidance {
  instead: string;
  of: string;
  when: string;
}

export interface SharedAlternative {
  name: string;
  fromA: string;
  fromB: string;
}

export interface Comparison {
  a: ComparedSide;
  b: ComparedSide;
  sameEntry: boolean;
  guidance: Guidance[];
  shared: SharedAlternative[];
}

function side(catalog: Catalog, query: string): ComparedSide {
  const found = catalog.find(query);
  const name = query.trim();
  if (!found) return { query, name, exported: catalog.isExported(name) };
  const out: ComparedSide = { query, name: shortName(found.entry), entry: found.entry, exported: true };
  if (found.exportName && found.exportName !== out.name) out.exportName = found.exportName;
  return out;
}

const displayName = (s: ComparedSide) => s.exportName ?? s.name;

export function compareComponents(catalog: Catalog, a: string, b: string): Comparison {
  const A = side(catalog, a);
  const B = side(catalog, b);
  const refersTo = (altName: string, target: ComparedSide) => {
    const resolved = catalog.find(altName);
    if (resolved && target.entry) return resolved.entry === target.entry;
    const short = altName.split("/").pop()?.toLowerCase();
    return altName.toLowerCase() === target.name.toLowerCase() || short === target.name.toLowerCase();
  };

  const guidance: Guidance[] = [];
  for (const [from, to] of [
    [A, B],
    [B, A],
  ] as const) {
    for (const alt of from.entry?.useInstead ?? []) {
      if (refersTo(alt.name, to)) guidance.push({ instead: displayName(to), of: displayName(from), when: alt.when });
    }
  }

  const shared: SharedAlternative[] = [];
  const key = (name: string) => {
    const resolved = catalog.find(name);
    return resolved ? resolved.entry.name : name.toLowerCase();
  };
  for (const altA of A.entry?.useInstead ?? []) {
    if (refersTo(altA.name, B)) continue;
    const altB = B.entry?.useInstead.find((alt) => key(alt.name) === key(altA.name));
    if (altB) shared.push({ name: altA.name.split("/").pop() ?? altA.name, fromA: altA.when, fromB: altB.when });
  }

  return { a: A, b: B, sameEntry: Boolean(A.entry && A.entry === B.entry), guidance, shared };
}
