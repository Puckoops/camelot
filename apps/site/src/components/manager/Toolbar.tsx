"use client";

import {
  AccessibilityIcon,
  BrowserIcon,
  CloseIcon,
  ExpandIcon,
  GrowIcon,
  MenuIcon,
  MirrorIcon,
  MobileIcon,
  OutlineIcon,
  PopOutIcon,
  RulerIcon,
  SyncIcon,
  TabletIcon,
  UndoIcon,
  ZoomIcon,
  ZoomOutIcon,
  ZoomResetIcon,
} from "@storybook/icons";
import { cn, Tooltip, useTheme } from "@puckoops/camelot";
import type { ReactNode } from "react";
import { ToolMenu, ToolMenuItem, ToolMenuRadio, ToolMenuSeparator } from "./Menu";
import { useManager, VIEWPORTS, VISION_FILTERS, ZOOM_STEP, type ViewportId, type VisionId } from "./ManagerContext";
import styles from "./manager.module.css";

export function ToolButton({
  label,
  active,
  onClick,
  children,
  className,
}: {
  label: string;
  active?: boolean;
  onClick?: () => void;
  children: ReactNode;
  className?: string;
}) {
  return (
    <Tooltip content={label}>
      <button type="button" className={cn(styles.tool, active && styles.toolActive, className)} aria-label={label} aria-pressed={active} onClick={onClick}>
        {children}
      </button>
    </Tooltip>
  );
}

function ThemeChip() {
  const { resolved, setPreference } = useTheme();
  const label = resolved === "dark" ? "Dark" : "Light";
  return (
    <ToolMenu
      label="Theme"
      trigger={
        <button type="button" className={styles.chip} aria-label={`Theme ${label}`}>
          <MirrorIcon size={14} />
          {label}
        </button>
      }
    >
      <ToolMenuRadio
        value={resolved}
        onValueChange={(v) => setPreference(v)}
        options={[
          { value: "light", label: "Light" },
          { value: "dark", label: "Dark" },
        ]}
      />
    </ToolMenu>
  );
}

const VIEWPORT_ICONS: Record<ViewportId, ReactNode> = {
  mobile1: <MobileIcon size={14} />,
  mobile2: <MobileIcon size={14} />,
  tablet: <TabletIcon size={14} />,
  desktop: <BrowserIcon size={14} />,
};

function ViewportTool() {
  const { viewport, setViewport } = useManager();
  return (
    <ToolMenu
      label="Viewport size"
      width={240}
      trigger={
        <button type="button" className={cn(styles.tool, viewport && styles.toolActive)} aria-label="Viewport size">
          <GrowIcon size={14} />
        </button>
      }
    >
      <ToolMenuItem icon={<UndoIcon size={14} />} onSelect={() => setViewport(null)} active={!viewport}>
        Reset viewport
      </ToolMenuItem>
      <ToolMenuSeparator />
      <ToolMenuRadio<ViewportId | "">
        value={viewport ?? ""}
        onValueChange={(v) => setViewport(v || null)}
        options={VIEWPORTS.map((v) => ({ value: v.id, label: v.name, icon: VIEWPORT_ICONS[v.id], right: `${v.width}×${v.height}` }))}
      />
    </ToolMenu>
  );
}

function VisionTool() {
  const { vision, setVision } = useManager();
  return (
    <ToolMenu
      label="Vision filter"
      width={220}
      trigger={
        <button type="button" className={cn(styles.tool, vision && styles.toolActive)} aria-label="Vision filter">
          <AccessibilityIcon size={14} />
        </button>
      }
    >
      <ToolMenuItem icon={<UndoIcon size={14} />} onSelect={() => setVision(null)} active={!vision}>
        Reset color filter
      </ToolMenuItem>
      <ToolMenuSeparator />
      <ToolMenuRadio<VisionId | "">
        value={vision ?? ""}
        onValueChange={(v) => setVision(v || null)}
        options={VISION_FILTERS.map((f) => ({ value: f.id, label: f.name, icon: <span className={styles.visionSwatch} style={{ filter: f.filter }} /> }))}
      />
    </ToolMenu>
  );
}

function ZoomTool() {
  const { zoom, setZoom } = useManager();
  return (
    <ToolMenu
      label="Zoom"
      align="end"
      trigger={
        <button type="button" className={cn(styles.tool, styles.toolText)} aria-label={`Change zoom level, ${Math.round(zoom * 100)}%`}>
          {Math.round(zoom * 100)}%
        </button>
      }
    >
      <ToolMenuItem icon={<ZoomIcon size={14} />} onSelect={() => setZoom(zoom * ZOOM_STEP)}>
        Zoom in
      </ToolMenuItem>
      <ToolMenuItem icon={<ZoomOutIcon size={14} />} onSelect={() => setZoom(zoom / ZOOM_STEP)}>
        Zoom out
      </ToolMenuItem>
      <ToolMenuItem icon={<ZoomResetIcon size={14} />} onSelect={() => setZoom(1)} disabled={zoom === 1}>
        Reset zoom
      </ToolMenuItem>
    </ToolMenu>
  );
}

export function Toolbar({ mode, preview, onMenu }: { mode: "docs" | "story"; preview?: string; onMenu: () => void }) {
  const m = useManager();
  return (
    <section data-theme="light" className={styles.toolbar} aria-label="Toolbar">
      <div className={styles.toolGroup}>
        <ToolButton label="Open the sidebar" onClick={onMenu} className={styles.menuButton}>
          <MenuIcon size={14} />
        </ToolButton>
        {mode === "story" && (
          <>
            <ToolButton label="Remount component" onClick={m.remountStory}>
              <SyncIcon size={14} />
            </ToolButton>
            <ToolButton label="Measure tool" active={m.measure} onClick={m.toggleMeasure}>
              <RulerIcon size={14} />
            </ToolButton>
          </>
        )}
        <ToolButton label="Outline tool" active={m.outline} onClick={m.toggleOutline}>
          <OutlineIcon size={14} />
        </ToolButton>
        {mode === "story" && (
          <>
            <ViewportTool />
            <VisionTool />
          </>
        )}
        <span className={styles.separator} />
        <ThemeChip />
      </div>
      <div className={styles.toolGroup}>
        {mode === "story" && preview && (
          <Tooltip content="Open in isolation mode">
            <a href={preview} target="_blank" rel="noopener" className={styles.tool} aria-label="Open in isolation mode">
              <PopOutIcon size={14} />
            </a>
          </Tooltip>
        )}
        {mode === "story" && <ZoomTool />}
        <ToolButton label={m.fullscreen ? "Exit full screen" : "Enter full screen"} active={m.fullscreen} onClick={m.toggleFullscreen}>
          {m.fullscreen ? <CloseIcon size={14} /> : <ExpandIcon size={14} />}
        </ToolButton>
      </div>
    </section>
  );
}
