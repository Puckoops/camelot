import { useId, useLayoutEffect, useMemo, useRef, useState, type KeyboardEvent, type PointerEvent } from "react";
import { cn } from "../../../lib/cn";
import styles from "./Chart.module.css";

export interface ChartDatum {
  label: string;
  value: number;
  /** The quiet series at the same position, such as last year or the target. */
  comparison?: number | null;
}

export interface ChartProps {
  data: ChartDatum[];
  /** Names the chart for assistive tech and captions its data table; it is not drawn. */
  title: string;
  description?: string;
  seriesLabel?: string;
  comparisonLabel?: string;
  /** Heads the first column of the data table, such as Month. */
  categoryLabel?: string;
  format?: (value: number) => string;
  /** Labels on the value axis; defaults to format. */
  formatTick?: (value: number) => string;
  /** Total height, axis labels included. */
  height?: number;
  /** Roughly how many gridlines; the scale rounds to clean steps. */
  ticks?: number;
  /** Shown by default when there is a comparison series, and never for one series. */
  legend?: boolean;
  className?: string;
}

type Kind = "bar" | "line" | "area";

const MONO_CHAR = 7;
const TOP = 8;
const AXIS_BAND = 24;
const MAX_BAR = 24;
const BAR_GAP = 2;

const defaultFormat = (n: number) => n.toLocaleString("en-GB", { maximumFractionDigits: 2 });

function niceScale(min: number, max: number, count: number) {
  let lo = min;
  let hi = max;
  if (lo === hi) {
    if (hi === 0) hi = 1;
    else if (hi > 0) lo = 0;
    else hi = 0;
  }
  const raw = (hi - lo) / Math.max(1, count);
  const mag = 10 ** Math.floor(Math.log10(raw));
  const norm = raw / mag;
  const step = (norm <= 1 ? 1 : norm <= 2 ? 2 : norm <= 2.5 ? 2.5 : norm <= 5 ? 5 : 10) * mag;
  const start = Math.floor(lo / step) * step;
  const end = Math.ceil(hi / step) * step;
  const ticks: number[] = [];
  for (let i = 0; start + i * step <= end + step / 2; i++) ticks.push(Number((start + i * step).toPrecision(12)));
  return { lo: start, hi: end, ticks };
}

function barPath(x: number, w: number, yEnd: number, yBase: number, radius: number) {
  const h = Math.abs(yBase - yEnd);
  if (h < 0.5) return "";
  const r = Math.min(radius, w / 2, h);
  if (yEnd <= yBase) {
    return `M${x},${yBase}V${yEnd + r}A${r},${r} 0 0 1 ${x + r},${yEnd}H${x + w - r}A${r},${r} 0 0 1 ${x + w},${yEnd + r}V${yBase}Z`;
  }
  return `M${x},${yBase}V${yEnd - r}A${r},${r} 0 0 0 ${x + r},${yEnd}H${x + w - r}A${r},${r} 0 0 0 ${x + w},${yEnd - r}V${yBase}Z`;
}

function linePath(points: ([number, number] | null)[]) {
  let d = "";
  let pen = false;
  for (const p of points) {
    if (!p) {
      pen = false;
      continue;
    }
    d += `${pen ? "L" : "M"}${p[0].toFixed(2)},${p[1].toFixed(2)}`;
    pen = true;
  }
  return d;
}

const isValue = (v: number | null | undefined): v is number => typeof v === "number" && Number.isFinite(v);

function ChartFrame({
  kind,
  data,
  title,
  description,
  seriesLabel = "Value",
  comparisonLabel = "Comparison",
  categoryLabel = "Category",
  format = defaultFormat,
  formatTick,
  height = 220,
  ticks: tickCount = 4,
  legend,
  className,
}: ChartProps & { kind: Kind }) {
  const id = useId();
  const frameRef = useRef<HTMLDivElement>(null);
  const [measured, setMeasured] = useState({ width: 0, radius: 6 });
  const [active, setActive] = useState<number | null>(null);
  const [fromKeyboard, setFromKeyboard] = useState(false);

  useLayoutEffect(() => {
    const el = frameRef.current;
    if (!el) return;
    const radius = parseFloat(getComputedStyle(el).getPropertyValue("--radius-xs")) || 6;
    const measure = () => setMeasured({ width: Math.round(el.getBoundingClientRect().width), radius });
    measure();
    if (typeof ResizeObserver === "undefined") return;
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const width = measured.width || 560;
  const n = data.length;
  const hasComparison = data.some((d) => isValue(d.comparison));
  const showLegend = (legend ?? hasComparison) && hasComparison;
  const tickFormat = formatTick ?? format;

  const geometry = useMemo(() => {
    const values = data.flatMap((d) => [d.value, d.comparison]).filter(isValue);
    const { lo, hi, ticks } = niceScale(Math.min(0, ...values), Math.max(0, ...values), tickCount);
    const tickLabels = ticks.map(tickFormat);
    const left = Math.ceil(Math.max(1, ...tickLabels.map((l) => l.length)) * MONO_CHAR) + 12;
    const right = kind === "bar" ? 4 : 8;
    const plotW = Math.max(40, width - left - right);
    const plotH = Math.max(40, height - TOP - AXIS_BAND);
    const y = (v: number) => TOP + plotH * (1 - (v - lo) / (hi - lo));
    const band = plotW / Math.max(1, n);
    const labelWidth = Math.max(1, ...data.map((d) => d.label.length)) * MONO_CHAR;
    const inset = kind === "bar" || n <= 1 ? 0 : Math.min(Math.ceil(labelWidth / 2), plotW / 4);
    const span = plotW - 2 * inset;
    const x = (i: number) => (kind === "bar" ? left + band * (i + 0.5) : n <= 1 ? left + plotW / 2 : left + inset + (span * i) / (n - 1));
    const slot = kind === "bar" ? band : span / Math.max(1, n - 1);
    const every = Math.max(1, Math.ceil((labelWidth + 12) / Math.max(1, slot)));
    return { ticks, tickLabels, left, plotW, plotH, y, x, band, inset, span, every, yZero: y(0) };
  }, [data, tickCount, tickFormat, width, height, kind, n]);

  const { ticks, tickLabels, left, plotW, plotH, y, x, band, inset, span, every, yZero } = geometry;
  const barW = Math.max(2, Math.min(MAX_BAR, hasComparison ? (band * 0.72 - BAR_GAP) / 2 : band * 0.6));

  const indexAt = (px: number) => {
    if (n === 0) return null;
    const raw = kind === "bar" ? Math.floor((px - left) / band) : n === 1 ? 0 : Math.round(((px - left - inset) / Math.max(1, span)) * (n - 1));
    return Math.min(n - 1, Math.max(0, raw));
  };

  const onPointerMove = (e: PointerEvent<SVGSVGElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setFromKeyboard(false);
    setActive(indexAt(((e.clientX - rect.left) * width) / Math.max(1, rect.width)));
  };

  const onKeyDown = (e: KeyboardEvent<SVGSVGElement>) => {
    if (n === 0) return;
    const from = active ?? -1;
    const next =
      e.key === "ArrowRight" ? Math.min(n - 1, from + 1) : e.key === "ArrowLeft" ? Math.max(0, from < 0 ? 0 : from - 1) : e.key === "Home" ? 0 : e.key === "End" ? n - 1 : null;
    if (e.key === "Escape") {
      setActive(null);
      return;
    }
    if (next === null) return;
    e.preventDefault();
    setFromKeyboard(true);
    setActive(next);
  };

  const current = active !== null ? data[active] : undefined;
  const activeX = active !== null ? x(active) : 0;
  const readout = current
    ? `${current.label}: ${format(current.value)} ${seriesLabel}${isValue(current.comparison) ? `, ${format(current.comparison)} ${comparisonLabel}` : ""}`
    : "";

  const mainPoints = data.map((d, i) => [x(i), y(d.value)] as [number, number]);
  const quietPoints = data.map((d, i) => (isValue(d.comparison) ? ([x(i), y(d.comparison)] as [number, number]) : null));
  const crisp = (v: number) => Math.round(v) + 0.5;

  return (
    <div className={cn(styles.chart, className)}>
      {showLegend && (
        <div className={cn("caption", styles.legend)}>
          <span className={styles.legendItem}>
            <span className={cn(styles.swatch, kind === "line" ? styles.swatchLine : styles.swatchBlock, styles.swatchMain)} aria-hidden="true" />
            {seriesLabel}
          </span>
          <span className={styles.legendItem}>
            <span className={cn(styles.swatch, kind === "bar" ? styles.swatchBlock : styles.swatchLine, styles.swatchQuiet)} aria-hidden="true" />
            {comparisonLabel}
          </span>
        </div>
      )}
      <div ref={frameRef} className={styles.frame}>
        <svg
          width={width}
          height={height}
          viewBox={`0 0 ${width} ${height}`}
          role="img"
          aria-labelledby={`${id}-title${description ? ` ${id}-desc` : ""}`}
          tabIndex={n ? 0 : undefined}
          className={styles.svg}
          onPointerMove={n ? onPointerMove : undefined}
          onPointerLeave={() => setActive(null)}
          onKeyDown={onKeyDown}
          onFocus={(e) => {
            let fromKeys = true;
            try {
              fromKeys = e.currentTarget.matches(":focus-visible");
            } catch {
              fromKeys = true;
            }
            if (fromKeys && active === null && n) {
              setFromKeyboard(true);
              setActive(n - 1);
            }
          }}
          onBlur={() => setActive(null)}
        >
          <title id={`${id}-title`}>{title}</title>
          {description && <desc id={`${id}-desc`}>{description}</desc>}

          <g aria-hidden="true">
            {ticks.map((t) => (
              <line key={t} x1={left} x2={left + plotW} y1={crisp(y(t))} y2={crisp(y(t))} className={t === 0 ? styles.baseline : styles.grid} />
            ))}
            {ticks.map((t, i) => (
              <text key={t} x={left - 8} y={y(t)} dy="0.32em" textAnchor="end" className={styles.tick}>
                {tickLabels[i]}
              </text>
            ))}
            {data.map((d, i) =>
              i % every === 0 ? (
                <text
                  key={i}
                  x={x(i)}
                  y={TOP + plotH + 17}
                  textAnchor="middle"
                  className={cn(styles.tick, i === active && styles.tickActive)}
                >
                  {d.label}
                </text>
              ) : null,
            )}

            {kind === "bar" &&
              data.map((d, i) => {
                const cx = x(i);
                const delay = { animationDelay: `${Math.min(i * 18, 240)}ms` };
                return (
                  <g key={i} className={cn(styles.group, active !== null && active !== i && styles.dim)}>
                    {hasComparison && isValue(d.comparison) && (
                      <path
                        d={barPath(cx - BAR_GAP / 2 - barW, barW, y(d.comparison), yZero, measured.radius)}
                        className={cn(styles.bar, styles.markQuiet, d.comparison < 0 && styles.barDown)}
                        style={delay}
                      />
                    )}
                    <path
                      d={barPath(hasComparison ? cx + BAR_GAP / 2 : cx - barW / 2, barW, y(d.value), yZero, measured.radius)}
                      className={cn(styles.bar, styles.markMain, d.value < 0 && styles.barDown)}
                      style={delay}
                    />
                  </g>
                );
              })}

            {kind !== "bar" && n > 0 && (
              <>
                {active !== null && <line x1={crisp(activeX)} x2={crisp(activeX)} y1={TOP} y2={TOP + plotH} className={styles.crosshair} />}
                {hasComparison && <path d={linePath(quietPoints)} className={cn(styles.line, styles.lineQuiet)} />}
                {kind === "area" && (
                  <path
                    d={`${linePath(mainPoints)}L${mainPoints[n - 1]![0].toFixed(2)},${yZero}L${mainPoints[0]![0].toFixed(2)},${yZero}Z`}
                    className={styles.area}
                  />
                )}
                <path d={linePath(mainPoints)} className={cn(styles.line, styles.lineMain)} />
                {active !== null && isValue(data[active]?.comparison) && quietPoints[active] && (
                  <circle cx={quietPoints[active]![0]} cy={quietPoints[active]![1]} r={4} className={cn(styles.dot, styles.markQuiet)} />
                )}
                <circle cx={mainPoints[active ?? n - 1]![0]} cy={mainPoints[active ?? n - 1]![1]} r={4} className={cn(styles.dot, styles.markMain)} />
              </>
            )}
          </g>
        </svg>

        {current && (
          <div
            className={styles.tooltip}
            style={activeX > width / 2 ? { right: width - activeX + 12, top: TOP } : { left: activeX + 12, top: TOP }}
            aria-hidden="true"
          >
            <p className={cn("caps", styles.tipLabel)}>{current.label}</p>
            <p className={styles.tipRow}>
              <span className={cn(styles.key, styles.keyMain)} />
              <span className={cn("num", styles.tipValue)}>{format(current.value)}</span>
              <span className={styles.tipName}>{seriesLabel}</span>
            </p>
            {isValue(current.comparison) && (
              <p className={styles.tipRow}>
                <span className={cn(styles.key, styles.keyQuiet)} />
                <span className={cn("num", styles.tipValue)}>{format(current.comparison)}</span>
                <span className={styles.tipName}>{comparisonLabel}</span>
              </p>
            )}
          </div>
        )}
      </div>

      <p className="visually-hidden" aria-live="polite">
        {fromKeyboard ? readout : ""}
      </p>
      <table className="visually-hidden">
        <caption>{title}</caption>
        <thead>
          <tr>
            <th scope="col">{categoryLabel}</th>
            <th scope="col">{seriesLabel}</th>
            {hasComparison && <th scope="col">{comparisonLabel}</th>}
          </tr>
        </thead>
        <tbody>
          {data.map((d, i) => (
            <tr key={i}>
              <th scope="row">{d.label}</th>
              <td>{format(d.value)}</td>
              {hasComparison && <td>{isValue(d.comparison) ? format(d.comparison) : "–"}</td>}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/** Discrete periods or categories: one ink bar per slot, the comparison as a quiet bar beside it. */
export function BarChart(props: ChartProps) {
  return <ChartFrame kind="bar" {...props} />;
}

/** A trend over time: one ink line, the comparison as a quiet line behind it. */
export function LineChart(props: ChartProps) {
  return <ChartFrame kind="line" {...props} />;
}

/** A total that accumulates, such as invoiced to date: an ink line over a faint ink wash. */
export function AreaChart(props: ChartProps) {
  return <ChartFrame kind="area" {...props} />;
}
