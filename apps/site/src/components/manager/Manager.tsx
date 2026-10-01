"use client";

import { Dialog as Sheet } from "radix-ui";
import { usePathname, useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { cn } from "@puckoops/camelot";
import type { TreeNode } from "@/lib/types";
import { ManagerProvider, useManager } from "./ManagerContext";
import { Resizer } from "./Resizer";
import { Sidebar, type Commands } from "./Sidebar";
import { Toolbar } from "./Toolbar";
import { branchesUnder, leafEntries, normalisePath } from "./tree";
import styles from "./manager.module.css";

function VisionFilters() {
  const matrices = {
    protanopia: "0.567 0.433 0 0 0 0.558 0.442 0 0 0 0 0.242 0.758 0 0 0 0 0 1 0",
    deuteranopia: "0.625 0.375 0 0 0 0.7 0.3 0 0 0 0 0.3 0.7 0 0 0 0 0 1 0",
    tritanopia: "0.95 0.05 0 0 0 0 0.433 0.567 0 0 0 0.475 0.525 0 0 0 0 0 1 0",
  };
  return (
    <svg width="0" height="0" aria-hidden="true" className={styles.filters}>
      <defs>
        {Object.entries(matrices).map(([id, values]) => (
          <filter key={id} id={`camelot-vision-${id}`}>
            <feColorMatrix type="matrix" values={values} />
          </filter>
        ))}
      </defs>
    </svg>
  );
}

function Layout({ tree, children }: { tree: TreeNode[]; children: ReactNode }) {
  const m = useManager();
  const pathname = normalisePath(usePathname());
  const router = useRouter();
  const [menu, setMenu] = useState(false);
  const search = useRef<HTMLInputElement>(null);
  const entries = useMemo(() => leafEntries(tree), [tree]);
  const current = useMemo(() => entries.find((e) => e.leaf.href === pathname), [entries, pathname]);
  const branches = useMemo(() => tree.flatMap(branchesUnder), [tree]);

  const [overrides, setOverrides] = useState<Record<string, boolean>>({});
  const [seen, setSeen] = useState(current?.leaf.id);
  if (seen !== current?.leaf.id) {
    setSeen(current?.leaf.id);
    const ancestors = current?.ancestors ?? [];
    if (ancestors.some((id) => overrides[id] === false)) setOverrides((o) => Object.fromEntries(Object.entries(o).filter(([id]) => !ancestors.includes(id))));
  }
  const ancestors = useMemo(() => new Set(current?.ancestors ?? []), [current]);
  const isOpen = useCallback((id: string) => overrides[id] ?? ancestors.has(id), [overrides, ancestors]);
  const setOpen = useCallback((ids: string[], open: boolean) => setOverrides((o) => ({ ...o, ...Object.fromEntries(ids.map((id) => [id, open])) })), []);

  const commands = useMemo<Commands>(() => {
    const at = current ? entries.indexOf(current) : -1;
    const go = (index: number) => {
      const target = entries[index];
      if (target) router.push(target.leaf.href);
    };
    const componentOf = (i: number) => entries[i]?.component?.id ?? entries[i]?.leaf.id;
    const firstOfComponent = (i: number) => {
      let j = i;
      while (j > 0 && componentOf(j - 1) === componentOf(i)) j--;
      return j;
    };
    return {
      previousStory: () => go(Math.max(at - 1, 0)),
      nextStory: () => go(Math.min(at + 1, entries.length - 1)),
      previousComponent: () => {
        if (at <= 0) return;
        go(firstOfComponent(firstOfComponent(at) - 1));
      },
      nextComponent: () => {
        let j = at + 1;
        while (j < entries.length && componentOf(j) === componentOf(at)) j++;
        go(j);
      },
      collapseAll: () => setOpen(branches.map((b) => b.id), false),
      focusSearch: () => {
        const input = search.current;
        if (input?.offsetParent) {
          input.focus();
          input.select();
        } else setMenu(true);
      },
    };
  }, [current, entries, router, branches, setOpen]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      const typing = target && (target.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(target.tagName));
      if ((e.metaKey || e.ctrlKey) && !e.shiftKey && e.key.toLowerCase() === "k") {
        e.preventDefault();
        commands.focusSearch();
        return;
      }
      if (typing) return;
      if (e.key === "/" && !e.metaKey && !e.ctrlKey && !e.altKey) {
        e.preventDefault();
        commands.focusSearch();
        return;
      }
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key === "ArrowUp") {
        e.preventDefault();
        commands.collapseAll();
        return;
      }
      if (!e.altKey || e.metaKey || e.ctrlKey) return;
      const actions: Record<string, () => void> = {
        KeyS: m.toggleSidebar,
        KeyT: m.toggleToolbar,
        KeyA: m.togglePanel,
        KeyD: m.togglePanelSide,
        KeyF: m.toggleFullscreen,
        ArrowUp: commands.previousComponent,
        ArrowDown: commands.nextComponent,
        ArrowLeft: commands.previousStory,
        ArrowRight: commands.nextStory,
      };
      const action = actions[e.code];
      if (action) {
        e.preventDefault();
        action();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [m, commands]);

  useEffect(() => {
    document.querySelector<HTMLElement>(`[data-id="${current?.leaf.id}"]`)?.scrollIntoView({ block: "nearest" });
  }, [current]);

  const mode = current?.leaf.type === "story" ? "story" : "docs";
  const showSidebar = m.sidebar && !m.fullscreen;
  const sidebarProps = { tree, entries, current, isOpen, setOpen, commands };

  return (
    <div
      className={cn(styles.manager, !showSidebar && styles.noSidebar, !m.toolbar && styles.noToolbar)}
      style={{ "--sb-sidebar-w": `${m.sizes.sidebar}px` } as CSSProperties}
      data-mode={mode}
    >
      <VisionFilters />
      {showSidebar && (
        <aside data-theme="light" className={styles.sidebar} aria-label="Sidebar">
          <div className={styles.sidebarScroll}>
            <Sidebar {...sidebarProps} searchRef={search} />
          </div>
          <Resizer label="Resize the sidebar" orientation="vertical" size={m.sizes.sidebar} direction={1} onResize={(v) => m.resize("sidebar", v)} className={styles.sidebarResizer} />
        </aside>
      )}
      <div className={styles.main}>
        {m.toolbar && <Toolbar mode={mode} preview={current?.leaf.preview} onMenu={() => setMenu(true)} />}
        <div className={styles.content} data-outline={m.outline || undefined}>
          {children}
        </div>
      </div>
      <Sheet.Root open={menu} onOpenChange={setMenu}>
        <Sheet.Portal>
          <Sheet.Overlay className={styles.sheetScrim} />
          <Sheet.Content data-theme="light" className={styles.sheet} aria-describedby={undefined}>
            <Sheet.Title className={styles.srOnly}>Sidebar</Sheet.Title>
            <Sidebar {...sidebarProps} onNavigate={() => setMenu(false)} />
          </Sheet.Content>
        </Sheet.Portal>
      </Sheet.Root>
    </div>
  );
}

export function Manager({ tree, children }: { tree: TreeNode[]; children: ReactNode }) {
  return (
    <ManagerProvider>
      <Layout tree={tree}>{children}</Layout>
    </ManagerProvider>
  );
}
