"use client";

import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";

export const VIEWPORTS = [
  { id: "mobile1", name: "Small mobile", width: 320, height: 568 },
  { id: "mobile2", name: "Large mobile", width: 414, height: 896 },
  { id: "tablet", name: "Tablet", width: 834, height: 1112 },
  { id: "desktop", name: "Desktop", width: 1024, height: 1280 },
] as const;

export type ViewportId = (typeof VIEWPORTS)[number]["id"];

export const VISION_FILTERS = [
  { id: "blurred", name: "Blurred vision", filter: "blur(2px)" },
  { id: "deuteranopia", name: "Deuteranopia", filter: "url(#camelot-vision-deuteranopia)" },
  { id: "protanopia", name: "Protanopia", filter: "url(#camelot-vision-protanopia)" },
  { id: "tritanopia", name: "Tritanopia", filter: "url(#camelot-vision-tritanopia)" },
  { id: "achromatopsia", name: "Achromatopsia", filter: "grayscale(100%)" },
] as const;

export type VisionId = (typeof VISION_FILTERS)[number]["id"];

export const ZOOM_STEP = 1.25;

export type PanelTab = "controls" | "actions" | "code" | "a11y";

export interface Sizes {
  sidebar: number;
  panelHeight: number;
  panelWidth: number;
}

const LIMITS: Record<keyof Sizes, [number, number]> = { sidebar: [220, 480], panelHeight: [120, 720], panelWidth: [280, 800] };

export interface ManagerState {
  sidebar: boolean;
  toolbar: boolean;
  panel: boolean;
  panelRight: boolean;
  fullscreen: boolean;
  outline: boolean;
  measure: boolean;
  zoom: number;
  viewport: ViewportId | null;
  vision: VisionId | null;
  remount: number;
  panelTab: PanelTab;
  sizes: Sizes;
  toggleSidebar: () => void;
  toggleToolbar: () => void;
  togglePanel: () => void;
  togglePanelSide: () => void;
  toggleFullscreen: () => void;
  toggleOutline: () => void;
  toggleMeasure: () => void;
  setZoom: (zoom: number) => void;
  setViewport: (viewport: ViewportId | null) => void;
  setVision: (vision: VisionId | null) => void;
  remountStory: () => void;
  setPanelTab: (tab: PanelTab) => void;
  resize: (key: keyof Sizes, value: number) => void;
}

const ManagerContext = createContext<ManagerState | null>(null);

export function useManager() {
  const state = useContext(ManagerContext);
  if (!state) throw new Error("useManager works only inside the docs manager.");
  return state;
}

export function ManagerProvider({ children }: { children: ReactNode }) {
  const [sidebar, setSidebar] = useState(true);
  const [toolbar, setToolbar] = useState(true);
  const [panel, setPanel] = useState(true);
  const [panelRight, setPanelRight] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);
  const [outline, setOutline] = useState(false);
  const [measure, setMeasure] = useState(false);
  const [zoom, setZoomState] = useState(1);
  const [viewport, setViewport] = useState<ViewportId | null>(null);
  const [vision, setVision] = useState<VisionId | null>(null);
  const [remount, setRemount] = useState(0);
  const [panelTab, setPanelTab] = useState<PanelTab>("controls");
  const [sizes, setSizes] = useState<Sizes>({ sidebar: 300, panelHeight: 300, panelWidth: 400 });

  const setZoom = useCallback((value: number) => setZoomState(Math.min(Math.max(value, 0.25), 4)), []);
  const remountStory = useCallback(() => setRemount((n) => n + 1), []);
  const resize = useCallback((key: keyof Sizes, value: number) => {
    const [min, max] = LIMITS[key];
    setSizes((s) => ({ ...s, [key]: Math.round(Math.min(Math.max(value, min), max)) }));
  }, []);

  const value = useMemo<ManagerState>(
    () => ({
      sidebar,
      toolbar,
      panel,
      panelRight,
      fullscreen,
      outline,
      measure,
      zoom,
      viewport,
      vision,
      remount,
      panelTab,
      sizes,
      toggleSidebar: () => {
        setFullscreen(false);
        setSidebar((v) => !v);
      },
      toggleToolbar: () => setToolbar((v) => !v),
      togglePanel: () => {
        setFullscreen(false);
        setPanel((v) => !v);
      },
      togglePanelSide: () => setPanelRight((v) => !v),
      toggleFullscreen: () => setFullscreen((v) => !v),
      toggleOutline: () => setOutline((v) => !v),
      toggleMeasure: () => setMeasure((v) => !v),
      setZoom,
      setViewport,
      setVision,
      remountStory,
      setPanelTab,
      resize,
    }),
    [sidebar, toolbar, panel, panelRight, fullscreen, outline, measure, zoom, viewport, vision, remount, panelTab, sizes, setZoom, remountStory, resize],
  );

  return <ManagerContext.Provider value={value}>{children}</ManagerContext.Provider>;
}
