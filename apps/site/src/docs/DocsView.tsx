"use client";

import { cn } from "@puckoops/camelot";
import Link from "next/link";
import { useState } from "react";
import { Source } from "@/components/code/Source";
import { InlineMarkdown } from "@/components/InlineMarkdown";
import type { ApiEntry, CatalogEntry, DocsPageSource, ExampleSource } from "@/lib/types";
import { previewHref, slugOf } from "@/lib/slug";
import { ArgsTable, argRows } from "./ArgsTable";
import { Canvas, useExampleArgs, type ExampleState } from "./Canvas";
import { Description, DocsWrapper, Title } from "./Doc";
import { PreviewBlock } from "./PreviewBlock";
import { exampleCode } from "./source";
import type { DocsModule, ExampleOf, Meta } from "./types";
import styles from "./docs.module.css";

export interface DocsViewProps {
  page: DocsPageSource;
  entry: CatalogEntry;
  api: ApiEntry[];
  /** Catalogue names and exports to the page that documents them. */
  links: Record<string, string>;
}

const NO_EXAMPLE: ExampleOf = {};

interface ExampleProps {
  meta: Meta;
  example: ExampleOf;
  source: ExampleSource;
  page: DocsPageSource;
  state: ExampleState;
  toolbar?: boolean;
}

function ExampleBlock({ meta, example, source, page, state, toolbar }: ExampleProps) {
  return (
    <PreviewBlock toolbar={toolbar} href={previewHref(page.kind, page.slug, source.export)} code={exampleCode(meta, example, source, page.component, state) || undefined}>
      {(zoom) => <Canvas meta={meta} example={example} name={example.name ?? source.name} state={state} zoom={zoom} />}
    </PreviewBlock>
  );
}

function StatefulExample(props: Omit<ExampleProps, "state">) {
  const state = useExampleArgs(props.meta, props.example);
  return <ExampleBlock {...props} state={state} />;
}

function Signature({ api }: { api: ApiEntry }) {
  const code =
    api.kind === "type"
      ? `type ${api.name} = ${api.definition ?? "…"}`
      : [api.signature ?? api.name, ...(api.members ?? []).map((m) => m.signature), api.returns ? `// returns ${api.returns}` : ""].filter(Boolean).join("\n");
  return (
    <>
      {api.description && (
        <p className={styles.description}>
          <InlineMarkdown text={api.description.replace(/\n/g, " ")} />
        </p>
      )}
      <Source code={code} className={styles.signature} />
    </>
  );
}

function Controls({ page, meta, state, main, reference }: { page: DocsPageSource; meta: Meta; state: ExampleState; main?: ApiEntry; reference: ApiEntry[] }) {
  const tabs = [{ name: main?.name ?? page.component ?? "Controls", api: main, controls: true }, ...reference.map((api) => ({ name: api.name, api, controls: false }))];
  const [active, setActive] = useState(0);
  const tab = tabs[active] ?? tabs[0]!;
  const rows = tab.controls ? argRows(main, meta, state) : argRows(tab.api, undefined, undefined);
  if (tabs.length === 1 && rows.length === 0) return null;
  const extended = tab.api?.props?.extends;
  return (
    <div className={styles.argsBlock}>
      {tabs.length > 1 && (
        <div role="tablist" aria-label="Components on this page" className={styles.argsTabs}>
          {tabs.map((t, i) => (
            <button key={t.name} type="button" role="tab" aria-selected={i === active} className={cn(styles.argsTab, i === active && styles.argsTabOn)} onClick={() => setActive(i)}>
              {t.name}
            </button>
          ))}
        </div>
      )}
      {!tab.controls && tab.api && tab.api.kind !== "component" ? (
        <Signature api={tab.api} />
      ) : (
        <ArgsTable rows={rows} state={tab.controls ? state : undefined} emptyText={`${tab.name} takes no props of its own.`} />
      )}
      {extended?.length ? <p className={styles.argsNote}>Also takes {extended.join(", ")}.</p> : null}
    </div>
  );
}

function WhenToUse({ entry, links }: { entry: CatalogEntry; links: Record<string, string> }) {
  if (!entry.whenToUse && !entry.useInstead?.length) return null;
  return (
    <section className={styles.when}>
      <h2 className={styles.heading}>When to use</h2>
      {entry.whenToUse && <p>{entry.whenToUse}</p>}
      {entry.useInstead?.length ? (
        <ul>
          {entry.useInstead.map((alt) => (
            <li key={alt.name}>
              Use {links[alt.name] ? <Link href={links[alt.name]!}><strong>{alt.name}</strong></Link> : <strong>{alt.name}</strong>} instead {alt.when}
            </li>
          ))}
        </ul>
      ) : null}
    </section>
  );
}

export function DocsView({ module, page, entry, api, links }: DocsViewProps & { module: DocsModule }) {
  const meta = module.default as Meta;
  const examples = page.examples
    .map((source) => ({ source, example: module[source.export] as ExampleOf | undefined }))
    .filter((e): e is { source: ExampleSource; example: ExampleOf } => Boolean(e.example));
  const [primary, ...rest] = examples;
  const state = useExampleArgs(meta, primary?.example ?? NO_EXAMPLE);
  const main = api.find((a) => a.name === page.component);
  const reference = api.filter((a) => a !== main);

  return (
    <DocsWrapper>
      <Title>{entry.name.split("/").pop()}</Title>
      <Description text={meta.description ?? entry.summary} />
      <Source code={entry.import} />
      {primary && (
        <>
          <ExampleBlock meta={meta} example={primary.example} source={primary.source} page={page} state={state} toolbar />
          <Controls page={page} meta={meta} state={state} main={main} reference={reference} />
        </>
      )}
      <WhenToUse entry={entry} links={links} />
      {rest.length > 0 && (
        <>
          <h2 className={styles.storiesTitle}>Examples</h2>
          {rest.map((e) => (
            <section key={e.source.export} id={`story-${slugOf(e.source.export)}`}>
              <h3 className={styles.storyTitle}>{e.example.name ?? e.source.name}</h3>
              {e.example.description && (
                <p className={styles.storyDescription}>
                  <InlineMarkdown text={e.example.description} />
                </p>
              )}
              <StatefulExample meta={meta} example={e.example} source={e.source} page={page} />
            </section>
          ))}
        </>
      )}
    </DocsWrapper>
  );
}
