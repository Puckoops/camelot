export const CATALOG_SCHEMA_VERSION = 2;

export interface CatalogFile {
  schemaVersion: typeof CATALOG_SCHEMA_VERSION;
  generatedAt: string;
  package: PackageInfo;
  docs: DocsInfo;
  principles: Principles;
  categories: string[];
  components: ComponentEntry[];
  api: Record<string, ApiExport>;
  tokens: Tokens;
  typography: Typography;
  rules: Rules;
  warnings: string[];
}

export interface PackageInfo {
  name: string;
  version: string;
  description?: string;
  peerDependencies: Record<string, string>;
}

export interface DocsInfo {
  baseUrl: string;
  pages: DocsPageRef[];
}

export type DocsKind = "component" | "hook";

export interface DocsPageRef {
  title: string;
  name: string;
  kind: DocsKind;
  path: string;
  file: string;
}

export interface Principles {
  tagline?: string;
  points: string[];
  readmeRules: string[];
}

export interface Alternative {
  name: string;
  when: string;
}

export interface ComponentEntry {
  name: string;
  category: string;
  summary: string;
  exports: string[];
  import: string;
  whenToUse: string;
  useInstead: Alternative[];
  keywords: string[];
  docsPath: string;
  hasDocs: boolean;
  types: string[];
  missingExports: string[];
}

export type ExportKind = "component" | "hook" | "function" | "constant" | "type" | "external";

export interface ApiExport {
  name: string;
  kind: ExportKind;
  source: string;
  description?: string;
  props?: PropsInfo;
  signature?: string;
  returns?: string;
  members?: ApiMember[];
  definition?: string;
  values?: string[];
  fields?: PropInfo[];
  typeParameters?: string[];
}

export interface ApiMember {
  name: string;
  signature: string;
  description?: string;
}

export interface PropsInfo {
  typeName?: string;
  typeParameters?: string[];
  extends: string[];
  props: PropInfo[];
  passThroughDefaults?: Record<string, string>;
}

export interface PropInfo {
  name: string;
  type: string;
  optional: boolean;
  default?: string;
  description?: string;
  values?: string[];
  deprecated?: string;
}

export interface ThemedValue {
  value: string;
  resolved: string;
  chain: string[];
}

export type ColorGroup = "role" | "neutral" | "hue";

export interface TokenUsage {
  component: string;
  properties: string[];
}

export interface ColorToken {
  name: string;
  group: ColorGroup;
  family: string;
  hue?: string;
  step?: string;
  light: ThemedValue;
  dark: ThemedValue;
  usage: TokenUsage[];
}

export interface ThemedToken {
  name: string;
  family: string;
  light: ThemedValue;
  dark: ThemedValue;
  usage: TokenUsage[];
}

export interface StaticToken {
  name: string;
  value: string;
  resolved: string;
  usage: TokenUsage[];
}

export interface UtilityClass {
  name: string;
  source: string;
  context: string[];
  declarations: Record<string, string>;
}

export interface Tokens {
  notes: string[];
  selectors: { light: string[]; dark: string[] };
  colors: ColorToken[];
  effects: ThemedToken[];
  spacing: StaticToken[];
  radius: StaticToken[];
  layout: StaticToken[];
  fonts: StaticToken[];
  motion: StaticToken[];
  utilities: UtilityClass[];
}

export interface TypeClass {
  name: string;
  declarations: Record<string, string>;
  fontToken?: string;
  fontStack?: string;
  tabular: boolean;
  note?: string;
}

export interface InkClass {
  name: string;
  token: string;
  light: string;
  dark: string;
}

export interface Typography {
  classes: TypeClass[];
  inkClasses: InkClass[];
  notes: string[];
}

export interface DetectPattern {
  pattern: string;
  flags?: string;
  message: string;
}

export interface HardRule {
  id: string;
  rule: string;
  why: string;
  detect: DetectPattern[];
}

export interface ElementMapping {
  element: string;
  use: string;
  note?: string;
}

export interface Rules {
  hardRules: HardRule[];
  elementMapping: ElementMapping[];
  iconsGuide: string;
  appSetup: string;
}
