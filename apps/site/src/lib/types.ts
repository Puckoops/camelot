export type PropKind = "string" | "true" | "action" | "expr";

export interface ExampleProp {
  key: string;
  kind: PropKind;
  value: string;
}

export interface ExampleSource {
  export: string;
  name: string;
  render?: string;
  props: ExampleProp[];
}

export interface DocsPageSource {
  slug: string;
  name: string;
  kind: "component" | "hook";
  title: string;
  file: string;
  module: string;
  component?: string;
  examples: ExampleSource[];
}

export interface UseInstead {
  name: string;
  when: string;
}

export interface CatalogEntry {
  name: string;
  category: string;
  summary: string;
  exports: string[];
  import: string;
  whenToUse?: string;
  useInstead?: UseInstead[];
  keywords?: string[];
  types?: string[];
}

export interface PropDoc {
  name: string;
  type: string;
  optional?: boolean;
  values?: string[];
  default?: string;
  description?: string;
}

export interface ApiEntry {
  name: string;
  kind: "component" | "hook" | "function" | "constant" | "type" | "external";
  source?: string;
  description?: string;
  signature?: string;
  returns?: string;
  definition?: string;
  values?: string[];
  members?: { name: string; signature: string }[];
  props?: { extends?: string[]; props: PropDoc[]; typeName?: string };
}

export interface TreeLeaf {
  type: "docs" | "story";
  id: string;
  name: string;
  href: string;
  /** A story's full-screen page, opened from the toolbar. */
  preview?: string;
  keywords?: string[];
}

export interface TreeBranch {
  /** A root is a section heading, a group is a folder, a component holds a docs page and its stories. */
  type: "root" | "group" | "component";
  id: string;
  name: string;
  children: TreeNode[];
  category?: string;
}

export type TreeNode = TreeLeaf | TreeBranch;
