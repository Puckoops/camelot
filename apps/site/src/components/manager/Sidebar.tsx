"use client";

import {
  BookmarkHollowIcon,
  CheckIcon,
  CloseIcon,
  CogIcon,
  CollapseIcon,
  ComponentIcon,
  DocumentIcon,
  ExpandAltIcon,
  FilterIcon,
  FolderIcon,
  SearchIcon,
} from "@storybook/icons";
import { cn } from "@puckoops/camelot";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Fragment, useMemo, useRef, useState, useSyncExternalStore, type KeyboardEvent, type ReactNode, type RefObject } from "react";
import type { TreeLeaf, TreeNode } from "@/lib/types";
import { ToolMenu, ToolMenuCheckbox, ToolMenuItem, ToolMenuLabel, ToolMenuSeparator, Shortcut } from "./Menu";
import { useManager } from "./ManagerContext";
import { branchesUnder, categoriesOf, filterTree, isBranch, type LeafEntry } from "./tree";
import styles from "./manager.module.css";

const COLLAPSED_KEY = "camelot-sidebar-collapsed";
const listeners = new Set<() => void>();

function subscribe(listener: () => void) {
  listeners.add(listener);
  window.addEventListener("storage", listener);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", listener);
  };
}

function readCollapsed() {
  try {
    return localStorage.getItem(COLLAPSED_KEY) ?? "[]";
  } catch {
    return "[]";
  }
}

function writeCollapsed(ids: string[]) {
  try {
    localStorage.setItem(COLLAPSED_KEY, JSON.stringify(ids));
  } catch {
    /* without storage the choice lasts for this page only */
  }
  for (const l of listeners) l();
}

function useCollapsedRoots() {
  const raw = useSyncExternalStore(subscribe, readCollapsed, () => "[]");
  return useMemo(() => {
    try {
      return new Set(JSON.parse(raw) as string[]);
    } catch {
      return new Set<string>();
    }
  }, [raw]);
}

function Chevron({ open }: { open: boolean }) {
  return (
    <span className={cn(styles.chevron, open && styles.chevronOpen)} aria-hidden="true">
      <svg width="8" height="8" viewBox="0 0 8 8" fill="none">
        <path
          fill="currentColor"
          fillRule="evenodd"
          clipRule="evenodd"
          d="M1.896 7.146a.5.5 0 1 0 .708.708l3.5-3.5a.5.5 0 0 0 0-.708l-3.5-3.5a.5.5 0 1 0-.708.708L5.043 4 1.896 7.146Z"
        />
      </svg>
    </span>
  );
}

export function NodeIcon({ type }: { type: TreeNode["type"] }) {
  if (type === "docs") return <DocumentIcon size={14} className={styles.iconDocs} aria-hidden="true" />;
  if (type === "story") return <BookmarkHollowIcon size={14} className={styles.iconStory} aria-hidden="true" />;
  if (type === "group") return <FolderIcon size={14} className={styles.iconGroup} aria-hidden="true" />;
  return <ComponentIcon size={14} className={styles.iconComponent} aria-hidden="true" />;
}

export function Brand() {
  return (
    <Link href="/" className={styles.brandLink} aria-label="Camelot, introduction">
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none" aria-hidden="true">
        <rect x="3" y="3" width="22" height="22" rx="6.5" stroke="currentColor" strokeWidth="1.8" />
        <circle cx="14" cy="14" r="3.4" fill="currentColor" />
      </svg>
      <span className={styles.brandName}>CAMELOT</span>
    </Link>
  );
}

export interface Commands {
  previousComponent: () => void;
  nextComponent: () => void;
  previousStory: () => void;
  nextStory: () => void;
  collapseAll: () => void;
  focusSearch: () => void;
}

function SettingsMenu({ commands, isStory }: { commands: Commands; isStory: boolean }) {
  const m = useManager();
  const check = (on: boolean) => (on ? <CheckIcon size={12} /> : <span />);
  return (
    <ToolMenu
      label="Settings"
      align="end"
      width={260}
      trigger={
        <button type="button" className={styles.settings} aria-label="Shortcuts and layout">
          <CogIcon size={14} />
        </button>
      }
    >
      <ToolMenuItem icon={check(m.sidebar && !m.fullscreen)} right={<Shortcut keys={["⌥", "S"]} />} onSelect={m.toggleSidebar}>
        Show sidebar
      </ToolMenuItem>
      <ToolMenuItem icon={check(m.toolbar)} right={<Shortcut keys={["⌥", "T"]} />} onSelect={m.toggleToolbar}>
        Show toolbar
      </ToolMenuItem>
      <ToolMenuItem icon={check(m.panel && !m.fullscreen)} right={<Shortcut keys={["⌥", "A"]} />} onSelect={m.togglePanel} disabled={!isStory}>
        Show addons
      </ToolMenuItem>
      <ToolMenuItem icon={<span />} right={<Shortcut keys={["⌥", "D"]} />} onSelect={m.togglePanelSide} disabled={!isStory}>
        Change addons orientation
      </ToolMenuItem>
      <ToolMenuItem icon={check(m.fullscreen)} right={<Shortcut keys={["⌥", "F"]} />} onSelect={m.toggleFullscreen}>
        Go full screen
      </ToolMenuItem>
      <ToolMenuItem icon={<span />} right={<Shortcut keys={["⌘", "K"]} />} onSelect={commands.focusSearch}>
        Search
      </ToolMenuItem>
      <ToolMenuSeparator />
      <ToolMenuItem icon={<span />} right={<Shortcut keys={["⌥", "↑"]} />} onSelect={commands.previousComponent}>
        Previous component
      </ToolMenuItem>
      <ToolMenuItem icon={<span />} right={<Shortcut keys={["⌥", "↓"]} />} onSelect={commands.nextComponent}>
        Next component
      </ToolMenuItem>
      <ToolMenuItem icon={<span />} right={<Shortcut keys={["⌥", "←"]} />} onSelect={commands.previousStory}>
        Previous story
      </ToolMenuItem>
      <ToolMenuItem icon={<span />} right={<Shortcut keys={["⌥", "→"]} />} onSelect={commands.nextStory}>
        Next story
      </ToolMenuItem>
      <ToolMenuItem icon={<span />} right={<Shortcut keys={["⇧", "⌘", "↑"]} />} onSelect={commands.collapseAll}>
        Collapse all
      </ToolMenuItem>
    </ToolMenu>
  );
}

function highlight(text: string, q: string): ReactNode {
  const at = q ? text.toLowerCase().indexOf(q) : -1;
  if (at < 0) return text;
  return (
    <>
      {text.slice(0, at)}
      <mark>{text.slice(at, at + q.length)}</mark>
      {text.slice(at + q.length)}
    </>
  );
}

interface Result {
  entry: LeafEntry;
  score: number;
}

function search(entries: LeafEntry[], query: string): Result[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  const out: Result[] = [];
  for (const entry of entries) {
    const { leaf, path } = entry;
    const subject = (leaf.type === "docs" && path.length ? path[path.length - 1]! : leaf.name).toLowerCase();
    const score = subject.startsWith(q)
      ? 0
      : subject.includes(q)
        ? 1
        : leaf.type === "docs" && leaf.keywords?.some((k) => k.toLowerCase().includes(q))
          ? 2
          : -1;
    if (score >= 0) out.push({ entry, score });
  }
  return out.sort((a, b) => a.score - b.score).slice(0, 50);
}

function Results({ results, query, active, onActive, onOpen }: { results: Result[]; query: string; active: number; onActive: (i: number) => void; onOpen: (leaf: TreeLeaf) => void }) {
  const q = query.trim().toLowerCase();
  if (results.length === 0) {
    return (
      <div className={styles.noResults}>
        <strong>No components found</strong>
        <span>Find components by name or path.</span>
      </div>
    );
  }
  return (
    <ol id="camelot-search-results" role="listbox" aria-label="Search results" className={styles.results}>
      {results.map(({ entry }, i) => {
        const { leaf, path } = entry;
        const docs = leaf.type === "docs" && path.length > 0;
        return (
          <li
            key={leaf.id}
            id={`camelot-search-${i}`}
            role="option"
            aria-selected={i === active}
            className={cn(styles.result, i === active && styles.resultActive)}
            onMouseEnter={() => onActive(i)}
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => onOpen(leaf)}
          >
            <NodeIcon type={leaf.type} />
            <div className={styles.resultText}>
              <div className={styles.resultTitle}>{docs ? leaf.name : highlight(leaf.name, q)}</div>
              {path.length > 0 && (
                <div className={styles.resultPath}>
                  {path.map((part, n) => (
                    <Fragment key={n}>
                      {n > 0 && <span className={styles.resultSlash}> / </span>}
                      <span>{docs && n === path.length - 1 ? highlight(part, q) : part}</span>
                    </Fragment>
                  ))}
                </div>
              )}
            </div>
          </li>
        );
      })}
    </ol>
  );
}

interface TreeProps {
  current?: LeafEntry;
  isOpen: (id: string) => boolean;
  setOpen: (ids: string[], open: boolean) => void;
  collapsedRoots: Set<string>;
  onNavigate?: () => void;
}

function Rows({ nodes, depth, parent, props }: { nodes: TreeNode[]; depth: number; parent?: string; props: TreeProps }) {
  const router = useRouter();
  const { current, isOpen, setOpen, collapsedRoots, onNavigate } = props;
  return nodes.map((node) => {
    if (node.type === "root") {
      const open = !collapsedRoots.has(node.id);
      const branches = node.children.flatMap(branchesUnder);
      const allOpen = branches.length > 0 && branches.every((b) => isOpen(b.id));
      return (
        <div key={node.id} className={styles.rootBlock}>
          <div className={styles.root}>
            <button
              type="button"
              className={styles.rootToggle}
              aria-expanded={open}
              data-row=""
              data-id={node.id}
              onClick={() => writeCollapsed(open ? [...collapsedRoots, node.id] : [...collapsedRoots].filter((id) => id !== node.id))}
            >
              <Chevron open={open} />
              {node.name}
            </button>
            <button
              type="button"
              className={styles.rootAction}
              aria-label={allOpen ? `Collapse everything in ${node.name}` : `Expand everything in ${node.name}`}
              onClick={() => setOpen(branches.map((b) => b.id), !allOpen)}
            >
              {allOpen ? <CollapseIcon size={14} /> : <ExpandAltIcon size={14} />}
            </button>
          </div>
          {open && <Rows nodes={node.children} depth={0} parent={node.id} props={props} />}
        </div>
      );
    }
    if (isBranch(node)) {
      const open = isOpen(node.id);
      const onClick = () => {
        setOpen([node.id], !open);
        if (open || node.type !== "component") return;
        const first = node.children.find((c): c is TreeLeaf => !isBranch(c));
        if (first && first.id !== current?.leaf.id) {
          router.push(first.href);
          onNavigate?.();
        }
      };
      return (
        <Fragment key={node.id}>
          <button
            type="button"
            className={styles.node}
            style={{ paddingLeft: 8 + 18 * depth }}
            aria-expanded={open}
            data-row=""
            data-id={node.id}
            data-parent={parent}
            data-branch=""
            onClick={onClick}
          >
            <Chevron open={open} />
            <NodeIcon type={node.type} />
            <span className={styles.nodeName}>{node.name}</span>
          </button>
          {open && <Rows nodes={node.children} depth={depth + 1} parent={node.id} props={props} />}
        </Fragment>
      );
    }
    const selected = node.id === current?.leaf.id;
    return (
      <Link
        key={node.id}
        href={node.href}
        className={cn(styles.node, selected && styles.nodeSelected)}
        style={{ paddingLeft: 22 + 18 * depth }}
        aria-current={selected ? "page" : undefined}
        data-row=""
        data-id={node.id}
        data-parent={parent}
        onClick={onNavigate}
      >
        <NodeIcon type={node.type} />
        <span className={styles.nodeName}>{node.name}</span>
      </Link>
    );
  });
}

function onTreeKeyDown(e: KeyboardEvent<HTMLElement>, isOpen: (id: string) => boolean, setOpen: (ids: string[], open: boolean) => void) {
  if (!["ArrowDown", "ArrowUp", "ArrowLeft", "ArrowRight"].includes(e.key) || e.altKey || e.metaKey) return;
  const rows = [...e.currentTarget.querySelectorAll<HTMLElement>("[data-row]")];
  const row = (document.activeElement as HTMLElement | null)?.closest<HTMLElement>("[data-row]");
  const at = row ? rows.indexOf(row) : -1;
  if (at < 0) return;
  e.preventDefault();
  const id = row!.dataset.id!;
  const branch = row!.hasAttribute("data-branch");
  if (e.key === "ArrowDown") rows[at + 1]?.focus();
  else if (e.key === "ArrowUp") rows[at - 1]?.focus();
  else if (e.key === "ArrowRight") {
    if (branch && !isOpen(id)) setOpen([id], true);
    else rows[at + 1]?.focus();
  } else if (branch && isOpen(id)) setOpen([id], false);
  else rows.find((r) => r.dataset.id === row!.dataset.parent)?.focus();
}

export interface SidebarProps {
  tree: TreeNode[];
  entries: LeafEntry[];
  current?: LeafEntry;
  isOpen: (id: string) => boolean;
  setOpen: (ids: string[], open: boolean) => void;
  commands: Commands;
  searchRef?: RefObject<HTMLInputElement | null>;
  onNavigate?: () => void;
}

export function Sidebar({ tree, entries, current, isOpen, setOpen, commands, searchRef, onNavigate }: SidebarProps) {
  const router = useRouter();
  const collapsedRoots = useCollapsedRoots();
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const [categories, setCategories] = useState<Set<string>>(() => new Set());
  const allCategories = useMemo(() => categoriesOf(tree), [tree]);
  const visible = useMemo(() => filterTree(tree, categories), [tree, categories]);
  const results = useMemo(
    () => search(entries, query).filter(({ entry }) => !categories.size || !entry.component || categories.has(entry.component.category ?? "")),
    [entries, query, categories],
  );
  const local = useRef<HTMLInputElement>(null);
  const input = searchRef ?? local;

  const open = (leaf: TreeLeaf) => {
    setQuery("");
    setActive(0);
    router.push(leaf.href);
    onNavigate?.();
  };

  const onSearchKey = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Escape") {
      if (query) setQuery("");
      else input.current?.blur();
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((i) => Math.min(i + 1, results.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter" && results[active]) {
      e.preventDefault();
      open(results[active].entry.leaf);
    }
  };

  const toggleCategory = (category: string, on: boolean) =>
    setCategories((set) => {
      const next = new Set(set);
      if (on) next.add(category);
      else next.delete(category);
      return next;
    });

  return (
    <div className={styles.sidebarInner}>
      <div className={styles.brand}>
        <Brand />
        <SettingsMenu commands={commands} isStory={current?.leaf.type === "story"} />
      </div>

      <div className={styles.search}>
        <span className={styles.searchIcon}>
          <SearchIcon size={14} />
        </span>
        <input
          ref={input}
          type="search"
          className={styles.searchInput}
          placeholder="Find components"
          autoComplete="off"
          aria-label="Find components"
          aria-controls={query ? "camelot-search-results" : undefined}
          aria-activedescendant={query && results[active] ? `camelot-search-${active}` : undefined}
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setActive(0);
          }}
          onKeyDown={onSearchKey}
        />
        {query ? (
          <button type="button" className={styles.searchClear} aria-label="Clear search" onClick={() => setQuery("")}>
            <CloseIcon size={12} />
          </button>
        ) : (
          <code className={styles.kbd} aria-hidden="true">
            <span>⌘</span>K
          </code>
        )}
        <ToolMenu
          label="Filter by category"
          align="end"
          width={220}
          trigger={
            <button type="button" className={cn(styles.filter, categories.size > 0 && styles.filterOn)} aria-label={categories.size ? `Category filters, ${categories.size} on` : "Category filters"}>
              <FilterIcon size={14} />
            </button>
          }
        >
          <ToolMenuLabel>Filter by category</ToolMenuLabel>
          {allCategories.map((c) => (
            <ToolMenuCheckbox key={c} checked={categories.has(c)} onCheckedChange={(on) => toggleCategory(c, on)}>
              {c}
            </ToolMenuCheckbox>
          ))}
          <ToolMenuSeparator />
          <ToolMenuItem onSelect={() => setCategories(new Set())} disabled={categories.size === 0}>
            Clear filters
          </ToolMenuItem>
        </ToolMenu>
      </div>

      {query.trim() ? (
        <Results results={results} query={query} active={active} onActive={setActive} onOpen={open} />
      ) : (
        <nav aria-label="Components" className={styles.tree} onKeyDown={(e) => onTreeKeyDown(e, isOpen, setOpen)}>
          <Rows nodes={visible} depth={0} props={{ current, isOpen, setOpen, collapsedRoots, onNavigate }} />
        </nav>
      )}
    </div>
  );
}
