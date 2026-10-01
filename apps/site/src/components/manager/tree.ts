import type { TreeBranch, TreeLeaf, TreeNode } from "@/lib/types";

export interface LeafEntry {
  leaf: TreeLeaf;
  /** Names from the root down to the leaf's parent, as the search results show them. */
  path: string[];
  /** Ids of every branch above the leaf, nearest last. */
  ancestors: string[];
  component?: TreeBranch;
}

export function isBranch(node: TreeNode): node is TreeBranch {
  return node.type === "root" || node.type === "group" || node.type === "component";
}

export function leafEntries(nodes: TreeNode[]): LeafEntry[] {
  const out: LeafEntry[] = [];
  const visit = (node: TreeNode, path: string[], ancestors: string[], component?: TreeBranch) => {
    if (!isBranch(node)) {
      out.push({ leaf: node, path, ancestors, component });
      return;
    }
    for (const child of node.children) visit(child, [...path, node.name], [...ancestors, node.id], node.type === "component" ? node : component);
  };
  for (const node of nodes) visit(node, [], []);
  return out;
}

export function normalisePath(pathname: string) {
  return pathname.length > 1 ? pathname.replace(/\/+$/, "") : pathname;
}

export function branchesUnder(node: TreeNode): TreeBranch[] {
  if (!isBranch(node)) return [];
  const own = node.type === "root" ? [] : [node];
  return [...own, ...node.children.flatMap(branchesUnder)];
}

/** Keeps the components in the chosen categories, and the folders and roots that still hold one. */
export function filterTree(nodes: TreeNode[], categories: ReadonlySet<string>): TreeNode[] {
  if (categories.size === 0) return nodes;
  return nodes.flatMap((node): TreeNode[] => {
    if (!isBranch(node)) return [node];
    if (node.type === "component") return node.category && categories.has(node.category) ? [node] : [];
    const children = filterTree(node.children, categories);
    return children.length ? [{ ...node, children }] : [];
  });
}

export function categoriesOf(nodes: TreeNode[]) {
  const found = new Set<string>();
  for (const node of nodes) for (const b of branchesUnder(node)) if (b.category) found.add(b.category);
  return [...found].sort();
}
