---
title: Funnel Chart
description: An animated funnel chart with multi-layer halo rings, hover interactions, and staggered entrance animations
---

import { FunnelChart } from "@bklitui/ui/charts";

export const funnelData = [
  { label: "Visitors", value: 12400, displayValue: "12.4k" },
  { label: "Leads", value: 6800, displayValue: "6.8k" },
  { label: "Qualified", value: 3200, displayValue: "3.2k" },
  { label: "Proposals", value: 1500, displayValue: "1.5k" },
  { label: "Closed", value: 620, displayValue: "620" },
];

<ComponentPreview registryName="funnel-chart">
  <FunnelChart
    data={funnelData}
    color="var(--chart-1)"
    layers={3}
  />
</ComponentPreview>

## Installation

<InstallationTabs name="funnel-chart" dependencies={["motion"]} />

## Usage

The Funnel Chart is a standalone component that renders an animated funnel visualization. Each segment represents a stage in a pipeline, with the width (or height in vertical mode) proportional to the value.

```tsx
import { FunnelChart } from "@bklitui/ui/charts";

const data = [
  { label: "Visitors", value: 12400, displayValue: "12.4k" },
  { label: "Leads", value: 6800, displayValue: "6.8k" },
  { label: "Qualified", value: 3200, displayValue: "3.2k" },
  { label: "Proposals", value: 1500, displayValue: "1.5k" },
  { label: "Closed", value: 620, displayValue: "620" },
];

export default function SalesFunnel() {
  return (
    <FunnelChart
      data={data}
      color="var(--chart-1)"
      layers={3}
    />
  );
}
```

## Props

### FunnelChart

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `data` | `FunnelStage[]` | required | Array of funnel stages |
| `orientation` | `"horizontal" \| "vertical"` | `"horizontal"` | Layout direction |
| `color` | `string` | `"var(--chart-1)"` | Default color for all segments |
| `layers` | `number` | `3` | Number of concentric halo rings per segment |
| `edges` | `"curved" \| "straight"` | `"curved"` | Edge style for segment shapes |
| `gap` | `number` | `4` | Gap between segments in pixels |
| `staggerDelay` | `number` | `0.12` | Stagger delay between segment animations (seconds) |
| `showPercentage` | `boolean` | `true` | Show percentage badges |
| `showValues` | `boolean` | `true` | Show value labels |
| `showLabels` | `boolean` | `true` | Show stage name labels |
| `formatPercentage` | `(pct: number) => string` | rounds to integer | Custom percentage formatter |
| `formatValue` | `(value: number) => string` | locale string | Custom value formatter |
| `labelLayout` | `"spread" \| "grouped"` | `"spread"` | How labels are arranged within each segment |
| `labelOrientation` | `"vertical" \| "horizontal"` | auto | Stack direction for grouped labels |
| `labelAlign` | `"center" \| "start" \| "end"` | `"center"` | Alignment of grouped labels |
| `hoveredIndex` | `number \| null` | - | Controlled hover state (segment index) |
| `onHoverChange` | `(index: number \| null) => void` | - | Callback when hover state changes |
| `grid` | `boolean \| GridConfig` | `false` | Background bands and grid lines |
| `renderPattern` | `(id: string, color: string) => ReactNode` | - | Custom SVG pattern for the innermost ring |
| `className` | `string` | - | Additional CSS class |
| `style` | `CSSProperties` | - | Additional inline styles |

### FunnelStage

| Property | Type | Description |
|----------|------|-------------|
| `label` | `string` | Stage name displayed below the segment |
| `value` | `number` | Numeric value (first item is treated as 100%) |
| `displayValue` | `string?` | Custom display string (overrides formatted value) |
| `color` | `string?` | Override the chart-level color for this segment |
| `gradient` | `FunnelGradientStop[]?` | Linear gradient for this segment |

### GridConfig

When passing an object to `grid`, the following options are available:

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `bands` | `boolean` | `true` | Show alternating background bands |
| `bandColor` | `string` | `"var(--color-muted)"` | Color of the background bands |
| `lines` | `boolean` | `true` | Show grid lines between segments |
| `lineColor` | `string` | `"var(--chart-grid)"` | Color of the grid lines |
| `lineOpacity` | `number` | `1` | Opacity of the grid lines |
| `lineWidth` | `number` | `1` | Width of the grid lines in pixels |

See the [charts gallery](/charts/funnel-chart) for vertical layouts, per-segment colors, patterns, and legend sync.


---
title: Gauge
description: Notch-based radial or linear gauge with optional center label, theme fills, patterns, arc gradients, and responsive sizing
---

import { GaugeChartDemo } from "@/components/docs/gauge-chart-demo";

<ComponentPreview registryName="gauge-chart">
  <GaugeChartDemo />
</ComponentPreview>

## Installation

<InstallationTabs
  name="gauge-chart"
  dependencies={[
    "@visx/responsive",
    "@visx/pattern",
    "@number-flow/react",
    "motion",
    "d3-shape",
  ]}
/>

## Usage

`Gauge` draws **notches** around an arc (default) or along a horizontal track (`orientation="linear"`). The center label is **optional** — omit `centerValue` for a track-only gauge.

- **Fill vs center:** `value` is the fill level **0–100**. `centerValue` is the statistic shown in the label (often the same story or a related KPI).
- **Arc center:** arc gauges overlay the label in the middle of the sweep (PieCenter-style NumberFlow + caption).
- **Linear label placement:** with `orientation="linear"`, place the label above or below the track using `labelPlacement` (`top` | `bottom`) and `labelAlign` (`start` | `center` | `end`) — the same six-position model as chart legend (top/bottom × left/center/right).
- **Responsive:** omit `width` and `height` to fill the parent. Arc gauges use **`minWidth`** (default **300**) and an aspect ratio. Linear gauges fill the parent width and use **`linearHeight`** (default **24**).
- **Linear notches:** linear gauges default to **`uniformWidth`** (rectangular notches). Pass `uniformWidth={false}` for tapered ticks.
- **Patterns / gradients in `<defs>`:** pass **`PatternLines`**, **`LinearGradient`**, etc. as **`children`**, then set **`activeFill`** / **`inactiveFill`** to `url(#id)`.
- **Arc gradients:** set **`useGradient`**. Optional **`activeGradient`** and **`inactiveGradient`** are **`[hexFrom, hexTo]`** tuples (interpolated along the notch index).
- **Fill opacity:** `activeFillOpacity` and `inactiveFillOpacity` map to SVG `fill-opacity` (0–1). Defaults are **1** for active notches and **0.8** for the track; docs and gallery examples use **`inactiveFillOpacity={0.4}`** for a lighter track.
- **Corner radius:** `notchCornerRadius` is the fillet in **pixels** at each notch corner (**0** = sharp). Large values are clamped by edge length and radial depth so shapes can approach a **capsule** / near-circular look.

```tsx
import { Gauge, PatternLines } from "@bklitui/ui/charts";

export default function RevenueGauge() {
  return (
    <Gauge
      value={66}
      centerValue={428_000}
      spacing={25}
      inactiveFillOpacity={0.4}
      defaultLabel="ARR run rate"
      formatOptions={{
        style: "currency",
        currency: "USD",
        maximumFractionDigits: 0,
      }}
    />
  );
}
```

### Linear gauge

Track-only (no label):

```tsx
<Gauge
  orientation="linear"
  value={72}
  totalNotches={72}
  spacing={0}
  notchCornerRadius={3}
  inactiveFillOpacity={0.4}
  useGradient
/>
```

With label below center:

```tsx
<Gauge
  orientation="linear"
  value={72}
  centerValue={428_000}
  defaultLabel="ARR run rate"
  labelPlacement="bottom"
  labelAlign="center"
  totalNotches={72}
  spacing={0}
  notchCornerRadius={3}
  inactiveFillOpacity={0.4}
  useGradient
/>
```

## Props

### Gauge

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `orientation` | `"arc"` \| `"linear"` | `"arc"` | Arc (default) or horizontal linear notch track |
| `value` | `number` | required | Fill level **0–100** |
| `centerValue` | `number` | — | Optional center statistic (NumberFlow); omit for no label |
| `labelPlacement` | `"top"` \| `"bottom"` \| `"left"` \| `"right"` | `"top"` | Label position for linear gauges (`top` / `bottom` recommended) |
| `labelAlign` | `"start"` \| `"center"` \| `"end"` | `"start"` | Horizontal alignment for linear label (left / center / right) |
| `totalNotches` | `number` | `40` | Notch count |
| `spacing` | `number` | `25` | **%** gap between notches |
| `notchLengthPercent` | `number` | `100` | Notch depth as **%** of default (5–100); lower = shorter notches |
| `notchWidthPercent` | `number` | `80` | Linear only — notch width as **%** of slot |
| `notchCornerRadius` | `number` | `0` | Corner fillet in **px** (0 = sharp); large values clamp toward a capsule shape |
| `uniformWidth` | `boolean` | `false` (arc) / `true` (linear) | Rectangular notches vs tapered |
| `startAngle` / `endAngle` | `number` | `135` / `405` | Arc sweep in degrees (arc only) |
| `linearHeight` | `number` | `24` | Bar height in px (linear only) |
| `useGradient` | `boolean` | `false` | Per-notch color ramp |
| `activeGradient` | `[string, string]` | lime → emerald | Hex stops for active notches when `useGradient` |
| `inactiveGradient` | `[string, string]` | same as active | Hex stops for inactive notches when `useGradient` |
| `activeFill` / `inactiveFill` | `string` | `chart-1` / `border` | Solid, CSS color, or `url(#patternId)` |
| `activeFillOpacity` / `inactiveFillOpacity` | `number` | `1` / `0.8` | SVG `fill-opacity` (0–1) for active / track notches |
| `defaultLabel` | `string` | `"Total"` | Center label |
| `formatOptions` | `ChartStatFlowFormat` | standard | NumberFlow format |
| `prefix` / `suffix` | `string` | - | Center prefix / suffix |
| `width` / `height` | `number` | - | Fixed size; omit for responsive |
| `minWidth` | `number` | `300` (arc) / `200` (linear) | Min width (px) when responsive |
| `className` | `string` | - | Root wrapper |
| `children` | `ReactNode` | - | Defs (`Pattern*`, `*Gradient`, …) |

## Theming

Inactive (track) notches default to **`var(--border)`** — shared with ring tracks and radar grid lines. Active notches default to **`var(--chart-1)`**. Override with `inactiveFill` / `activeFill`, or tune **`--border`** / **`--chart-1`** in your theme. See [Theming](/docs/theming).

## Live examples

See the [Gauge gallery](/charts/gauge-chart) for arc and linear variants. Use [Studio](/studio?chart=gauge-chart) to tune every gauge prop interactively — toggle **Linear** for the horizontal notch track, **Show label** for optional center text, and the legend-style **Position** picker for label placement — then copy the resulting code.


---
title: Line Chart
description: A composable line chart with tooltips, markers, and hover interactions
---

import { studioChartHref } from "@bklitui/studio";
import { LineChart, Line, Grid, XAxis, ChartTooltip, ChartBrush, ChartBrushLayout, ChartMarkers } from "@bklitui/ui/charts";
import { LineChartBrushDemo } from "@/components/docs/line-chart-brush-demo";
import { LineChartYDomainDemo } from "@/components/docs/line-chart-y-domain-demo";
import { LineChartDateRangeDemo } from "@/components/docs/line-chart-date-range-demo";
import { ProjectionLineDemo } from "@/components/docs/projection-line-demo";
import { MarkerContentDemo } from "@/components/docs/marker-content-demo";
import { OpenInStudioButton } from "@/components/docs/open-in-studio-button";
import {
  lineChartDocsData as chartData,
  lineChartDocsMarkers as demoMarkers,
} from "@/components/docs/line-chart-docs-data";

<ComponentPreview registryName="line-chart">
  <div className="w-full">
    <LineChart data={chartData}>
      <Grid horizontal />
      <Line dataKey="users" stroke="var(--chart-line-primary)" />
      <Line dataKey="pageviews" stroke="var(--chart-line-secondary)" />
      <ChartMarkers items={demoMarkers} />
      <XAxis />
      <ChartTooltip>
        <MarkerContentDemo markers={demoMarkers} />
      </ChartTooltip>
    </LineChart>
  </div>
</ComponentPreview>

## Installation

<InstallationTabs name="line-chart" dependencies={["@visx/curve", "@visx/shape", "motion"]} />

## Usage

Build charts by composing components. See the [charts gallery](/charts/line-chart) for interactive examples.

```tsx
import { LineChart, Line, Grid, XAxis, ChartTooltip } from "@bklitui/ui/charts";

const data = [
  { date: new Date("2025-01-01"), users: 1200 },
  { date: new Date("2025-01-02"), users: 1350 },
  // ...
];

export default function SimpleChart() {
  return (
    <LineChart data={data}>
      <Grid horizontal />
      <Line dataKey="users" />
      <XAxis />
      <ChartTooltip />
    </LineChart>
  );
}
```

## Updating data smoothly

When your data changes (e.g. filtering by date range, refreshing from an API), the chart automatically updates smoothly without replaying the enter animation. The y-domain tweens to the new scale via `yDomainTween` (enabled by default).

**Do not** change or pass the `revealSignature` prop when updating data — that prop is only for manually replaying the reveal animation (used in Studio's replay button).

<ComponentShowcase
  code={`const [range, setRange] = useState<"7d" | "30d" | "90d">("30d");
const filteredData = useMemo(() => {
  const daysMap = { "7d": 7, "30d": 30, "90d": 90 };
  const days = daysMap[range];
  return fullData.slice(-days);
}, [range]);

<LineChart data={filteredData} yDomainTween>
  <Grid horizontal />
  <Line dataKey="revenue" />
  <XAxis />
  <ChartTooltip />
</LineChart>`}
  liveChartPreview
  previewMinHeight={360}
>
  <LineChartDateRangeDemo />
</ComponentShowcase>

Click the date range buttons — the line and y-axis morph smoothly without reinitialization. Use the replay button to run the enter animation again.

## Components

### LineChart

The root component that provides context to all children.

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `data` | `Record<string, unknown>[]` | required | Array of data points |
| `xDataKey` | `string` | `"date"` | Key in data for x-axis values |
| `margin` | `Partial<Margin>` | `{ top: 40, right: 40, bottom: 40, left: 40 }` | Chart margins |
| `animationDuration` | `number` | `1100` | Clip-reveal duration in ms (`cubic-bezier(0.85, 0, 0.15, 1)`) |
| `status` | `"loading" \| "ready"` | `"ready"` | Loading ↔ ready choreography on one chart instance |
| `loadingLabel` | `string` | — | Centered shimmer label while `status="loading"` (`""` hides it) |
| `yDomainTween` | `boolean` | `true` | Animate y-domain when status or target domain changes |
| `yDomainTweenDuration` | `number` | `500` | Y-domain tween duration in ms |
| `xDomain` | `[Date, Date]` | — | Visible x-range for brush zoom |
| `xDomainSlotCount` | `number` | — | Full dataset length for x-scale padding when `xDomain` is set |
| `tweenYDomainOnXDomainChange` | `boolean` | `false` | Tween y-domain when the brush changes the visible x-range |
| `aspectRatio` | `string` | `"2 / 1"` | CSS aspect ratio |
| `className` | `string` | `""` | Additional CSS class |
| `style` | `CSSProperties` | — | Inline container styles (e.g. fixed height for a brush strip) |

### Line

Renders a line on the chart.

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `dataKey` | `string` | required | Key in data for y values |
| `yAxisId` | `string \| number` | `"left"` | Y-scale group for biaxial charts (pair with `YAxis`) |
| `stroke` | `string` | `var(--chart-line-primary)` | Line color |
| `strokeWidth` | `number` | `2.5` | Line width |
| `curve` | `CurveFactory` | `curveNatural` | D3 curve function |
| `animate` | `boolean` | `true` | Enable grow animation |
| `fadeEdges` | `boolean` | `true` | Fade line at edges |
| `showHighlight` | `boolean` | `true` | Show highlight on hover |
| `showMarkers` | `boolean` | `false` | Render scatter-style ring markers at each point |
| `loadingStroke` | `string` | `var(--foreground)` | Pulse stroke color while chart is loading |
| `loadingStrokeOpacity` | `number` | `0.5` | Pulse stroke opacity while chart is loading |
| `markers` | `SeriesPointMarkerStyle` | — | Marker styling (same options as [`Scatter`](/docs/components/scatter-chart)) |

### Grid

Renders grid lines.

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `horizontal` | `boolean` | `true` | Show horizontal lines |
| `vertical` | `boolean` | `false` | Show vertical lines |
| `numTicksRows` | `number` | `5` | Number of horizontal lines |
| `numTicksColumns` | `number` | `10` | Number of vertical lines |
| `stroke` | `string` | `var(--chart-grid)` | Line color while ready |
| `loadingStroke` | `string` | — | Grid stroke while loading chrome is active |
| `strokeDasharray` | `string` | `"4,4"` | Dash pattern |
| `highlightRowValues` | `number[]` | — | Draw emphasized horizontal lines at specific y values (e.g. `[0]` for break-even) |
| `highlightRowStroke` | `string` | `var(--chart-foreground-muted)` | Stroke for highlighted rows |
| `highlightRowStrokeOpacity` | `number` | `1` | Opacity for highlighted rows |
| `highlightRowStrokeWidth` | `number` | `1` | Width for highlighted rows |
| `highlightRowStrokeDasharray` | `string` | `"0"` | Dash pattern for highlighted rows (`"0"` = solid) |
| `shimmer` | `boolean` | `false` | Animate a shimmer band across horizontal grid lines |
| `shimmerStroke` | `string` | `color-mix(…)` on `--foreground` at 68% | Shimmer band color and opacity |
| `shimmerLength` | `number` | `140` | Shimmer band width in pixels |
| `shimmerSpeed` | `number` | `1` | Shimmer speed multiplier when sync is off (higher = faster) |
| `shimmerSync` | `boolean` | `false` | Match shimmer timing to the line pulse (2.2s cycle + 280ms pause) |

### Background

Pattern fill for the plot area when you omit `Grid`. Fades in after the series reveal on time-series charts. See the [Background utility](/docs/utility/background) for presets (`diagonal`, `dots`, `cross`, …), edge fade, and opacity — and the **Pattern Background** examples on the [line chart gallery](/charts/line-chart).

### XAxis

Renders x-axis labels that fade when the crosshair passes.

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `numTicks` | `number` | `6` | Number of tick labels |
| `tickerHalfWidth` | `number` | `50` | Fade radius for labels |
| `tickMode` | `"data" \| "domain"` | `"data"` | `"data"` snaps labels to data rows (crosshair-aligned); `"domain"` for calendar-even spacing |

### ChartTooltip

Renders the tooltip with crosshair, dots, and content box.

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `showDatePill` | `boolean` | `true` | Show animated date ticker |
| `showCrosshair` | `boolean` | `true` | Show vertical crosshair |
| `showDots` | `boolean` | `true` | Show dots on lines |
| `indicatorColor` | `string \| (point) => string` | — | Crosshair and dot color; use a function for value-based colors |
| `indicatorDasharray` | `string` | — | Dash pattern for the crosshair (e.g. `"4,4"`) |
| `indicatorFadeEdges` | `"both" \| "top" \| "bottom" \| "none"` | `"both"` | Vertical crosshair fade |
| `indicatorFadeLength` | `number` | `10` | Fade size (% of height) |
| `matchCrosshair` | `boolean` | `false` | Panel uses crosshair spring when `true` |
| `damping` | `number` | `20` | Panel follow when `matchCrosshair={false}`; `0` = instant |
| `content` | `(props) => ReactNode` | - | Custom content renderer |
| `rows` | `(point) => TooltipRow[]` | - | Custom row generator |

## Dual Y axes (biaxial)

Pair `yAxisId` on each `Line` with matching `YAxis` components. Increase `margin.left` and `margin.right` so labels fit. See [Y Axis](/docs/utility/axis/y-axis) and the **Left and right Y axes** examples on the [line chart gallery](/charts/line-chart).

## Profit/Loss line

For a single series that crosses zero, use [`ProfitLossLine`](/docs/components/profit-loss-line) inside `LineChart`. Pair it with a hidden `Line` (same `dataKey`) so the chart registers the series for the y-domain and tooltip. When any value is negative, the y-axis automatically includes the full data extent instead of anchoring at zero.

Highlight the break-even baseline with `Grid highlightRowValues={[0]}`:

```tsx
<Grid
  highlightRowValues={[0]}
  highlightRowStroke="var(--foreground)"
  highlightRowStrokeOpacity={0.35}
  horizontal
/>
```

See the [Profit/Loss Line](/docs/components/profit-loss-line) docs and the [line chart gallery](/charts/line-chart) (**Profit/Loss** example).

## Projection

Extend a series past the last data point with [`ProjectionLine`](/docs/utility/projection-line). Build the path with `buildProjectionPath` (auto slope, target value, or manual points). Optionally add [`LineSeriesTerminalMarker`](/docs/utility/projection-line#terminal-marker) at the anchor.

Projections extend the x-domain to the horizon and are not supported together with [brush zoom](/docs/utility/brush).

<div className="not-prose mb-3 flex items-center justify-between gap-4">
  <h3 className="m-0 font-semibold text-foreground text-base tracking-tight">
    Preview
  </h3>
  <OpenInStudioButton
    href={studioChartHref("line-chart", { projectionCount: 1 })}
    slug="line-chart"
  />
</div>

<ComponentShowcase
  code={`import {
  buildProjectionPath,
  LineSeriesTerminalMarker,
  ProjectionLine,
} from "@bklitui/ui/charts";

const projectionPath = buildProjectionPath({
  sourceData: chartData,
  seriesKey: "users",
  mode: "auto",
  autoMethod: "lastSegment",
  pathDensity: "endpoints",
  horizonPoints: 8,
});

<LineChart data={chartData}>
  <Grid horizontal />
  <Line dataKey="users" strokeWidth={2} />
  <LineSeriesTerminalMarker dataKey="users" />
  <ProjectionLine
    data={projectionPath}
    strokeDasharray="6,4"
    curveKind="bezier"
    showEndMarker
  />
  <XAxis />
  <ChartTooltip />
</LineChart>`}
>
  <ProjectionLineDemo />
</ComponentShowcase>

Open [Studio with a projection](/studio?chart=line-chart) via **Settings → Projections** or the series context menu. See the [Projection Line utility](/docs/utility/projection-line) for props and `buildProjectionPath` options.

## Brush zoom

Use `ChartBrushLayout` and `ChartBrush` the same way as on [`AreaChart`](/docs/components/area-chart#brush-zoom). See the [Brush](/docs/utility/brush) utility docs for full API reference. The brush strip typically shows simplified `Line` series; the main chart receives `xDomain`, `xDomainSlotCount`, and `tweenYDomainOnXDomainChange` for live zoom and y-domain tweening.

<div className="not-prose mb-3 flex items-center justify-between gap-4">
  <h3 className="m-0 font-semibold text-foreground text-base tracking-tight">
    Preview
  </h3>
  <OpenInStudioButton
    href={studioChartHref("line-chart", { showBrush: true })}
    slug="line-chart"
  />
</div>

<ComponentShowcase
  code={`<ChartBrushLayout
  data={data}
  enabled
  height={72}
  brushStrip={(layout) => (
    <LineChart data={data} animationDuration={0} status="ready">
      <Line dataKey="value" animate={false} />
      <ChartBrush
        initialSelection={layout.brushSelection ?? undefined}
        onSelectionChange={layout.onBrushSelectionChange}
      />
    </LineChart>
  )}
>
  {(layout) => (
    <LineChart
      data={data}
      xDomain={layout.xDomain}
      xDomainSlotCount={layout.xDomainSlotCount}
      tweenYDomainOnXDomainChange
      yDomainTween
    >
      <Grid horizontal />
      <Line dataKey="value" />
      <XAxis />
      <ChartTooltip />
    </LineChart>
  )}
</ChartBrushLayout>`}
  liveChartPreview
  previewMinHeight={360}
>
  <LineChartBrushDemo />
</ComponentShowcase>

Open [Studio with brush enabled](/studio?chart=line-chart&showBrush=true) to tune strip height, blur, and selection pattern.

## Loading state

Drive loading and ready from your data layer with a single `LineChart` — one `Grid`, one `Line`, no component swap. Set `status="loading"` while fetching; switch to `"ready"` when data resolves.

**Loading → ready:** pulse loop on skeleton data → pulse finishes its grow, then flows out right → loading label drifts down 30px, blurs, and fades → grid y-domain tween (500ms) → clip-path reveal (`cubic-bezier(0.85, 0, 0.15, 1)`) → interaction enabled.

**Ready → loading:** ready line conceals to the right → grid y-domain tween → pulse loop and shimmer resume.

Pair `Grid` `stroke` / `loadingStroke` with shimmer props. Pair `Line` `loadingStroke` props. Use `loadingLabel` on `LineChart` for centered shimmer text via `@bklit/shimmering-text`.

<div className="not-prose mb-3 flex items-center justify-between gap-4">
  <h3 className="m-0 font-semibold text-foreground text-base tracking-tight">
    Preview
  </h3>
  <OpenInStudioButton
    href={studioChartHref("line-chart", { lineChartState: "loading" })}
    slug="line-chart"
  />
</div>

<ComponentShowcase
  code={`const [status, setStatus] = useState<"loading" | "ready">("loading");
const [loadingStyle, setLoadingStyle] = useState<"pulse" | "sweep">("pulse");

<LineChart
  data={data}
  status={status}
  loadingLabel="Loading revenue…"
  yDomainTween
>
  <Grid
    horizontal
    loadingStroke="color-mix(in oklch, var(--chart-grid) 50%, transparent)"
    shimmer
    shimmerSync
    stroke="var(--chart-grid)"
  />
  <Line
    dataKey="revenue"
    fadeEdges
    loadingStroke="var(--foreground)"
    loadingStrokeOpacity={0.5}
    loadingStyle={loadingStyle}
    stroke="var(--chart-line-primary)"
  />
</LineChart>`}
  liveChartPreview
  previewMinHeight={320}
>
  <LineChartYDomainDemo />
</ComponentShowcase>

Toggle **Loading** / **Ready** in the preview to replay the transition, and **Pulse** / **Sweep** to switch the loading animation style. When target data spans a different y-range than the skeleton, `yDomainTween` morphs the scale before the line reveals.

### Studio

Open [Studio in loading mode](/studio?chart=line-chart&lineChartState=loading) and set **State** to **Loading**. In **Settings**, choose **Loading style** — **Pulse** (traveling segment) or **Sweep** (diagonal shimmer). The components tree exposes **Grid**, **Label**, and **Line**:

| Layer | Controls |
|-------|----------|
| **Settings** | **Loading style** — Pulse or Sweep (Sweep turns off grid shimmer) |
| **Grid** | Grid and shimmer color pickers, shimmer toggle, band length, **Animation** (sync with line, speed when unsynced) |
| **Label** | Shimmer label text |
| **Line** | Pulse stroke color and opacity |

Data and animation panels stay collapsed in loading mode; scramble data is disabled. See the [line chart gallery](/charts/line-chart) (**Loading** example).

Installing `@bklit/line-chart` pulls in `@bklit/shimmering-text` automatically.

### Loading style: pulse or sweep

The loading state has two animation styles, set with `loadingStyle` on the `Line`: the default `"pulse"` (a segment travels along the skeleton stroke) or `"sweep"` (a soft diagonal shimmer sweeps across the whole line). Set it on the `Line` inside a `status="loading"` chart, or on the `LineChartLoading` wrapper:

```tsx
<LineChart data={data} status="loading">
  <Grid horizontal shimmer />
  <Line dataKey="revenue" loadingStyle="sweep" />
</LineChart>

// or, with the turnkey wrapper:
<LineChartLoading loadingStyle="sweep" />;
```

The sweep masks over the real skeleton line, so it follows whatever `curve` the `Line` uses (`curveStepAfter`, `curveNatural`, …) and respects `prefers-reduced-motion`. To keep the loading→ready handoff smooth, the sweep is used only during steady loading; the pulse still drives the exit transition. See the **Loading (Sweep)** example on the [line chart gallery](/charts/line-chart).

## Dashed tail

Set `dashFromIndex` on `Line` to draw a solid stroke through one data point, then a dashed segment through the end of the series. Useful when the final period is still in progress (e.g. yesterday → today).

`dashFromIndex` is **inclusive** — dashing starts at that row and continues through the last point. The dashed segment follows the same curved path as the solid stroke and respects `fadeEdges`.

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `dashFromIndex` | `number` | — | Inclusive data index where the dashed tail begins |
| `dashArray` | `string` | `"6,4"` | SVG `stroke-dasharray` pattern for the tail segment |

```tsx
<Line
  dataKey="visitors"
  dashFromIndex={5}
  dashArray="6,4"
  stroke="var(--chart-line-primary)"
/>
```

## Markers

Add markers to annotate specific dates on the chart:

```tsx
import { LineChart, Line, ChartTooltip, ChartMarkers, MarkerTooltipContent, useActiveMarkers, type ChartMarker } from "@bklitui/ui/charts";

const markers: ChartMarker[] = [
  {
    date: new Date("2025-01-05"),
    icon: "🚀",
    title: "v1.2.0 Released",
    description: "New chart animations",
  },
  {
    date: new Date("2025-01-05"), // Same day - will stack!
    icon: "🐛",
    title: "Bug Fix",
    description: "Fixed tooltip positioning",
  },
];

function MyChart({ data }) {
  return (
    <LineChart data={data}>
      <Line dataKey="users" />
      <ChartMarkers items={markers} />
      <ChartTooltip>
        <MarkerContent markers={markers} />
      </ChartTooltip>
    </LineChart>
  );
}

// Use the hook to get markers for the hovered date
function MarkerContent({ markers }) {
  const activeMarkers = useActiveMarkers(markers);
  if (activeMarkers.length === 0) return null;
  return <MarkerTooltipContent markers={activeMarkers} />;
}
```

### ChartMarker Interface

```ts
interface ChartMarker {
  date: Date;           // Date for marker position
  icon: React.ReactNode; // Icon (emoji or component)
  title: string;        // Tooltip title
  description?: string; // Optional description
  content?: React.ReactNode; // Custom tooltip content
  color?: string;       // Background color override
  onClick?: () => void; // Click handler
  href?: string;        // URL to navigate to
  target?: "_blank" | "_self"; // Link target
}
```

### ChartMarkers Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `items` | `ChartMarker[]` | required | Array of markers |
| `size` | `number` | `28` | Marker circle size |
| `showLines` | `boolean` | `true` | Show vertical guide lines |
| `animate` | `boolean` | `true` | Animate markers on entrance |

## Segment Selection

Add click-drag and touch segment selection with composable components. The line highlight automatically shows the selected path segment.

### Basic Usage

Click and drag (or two-finger touch on mobile) to select a range:

```tsx
import { LineChart, Line, Grid, XAxis, ChartTooltip, SegmentBackground, SegmentLineFrom, SegmentLineTo } from "@bklitui/ui/charts";

<LineChart data={data}>
  <Grid horizontal />
  <Line dataKey="users" />
  <SegmentBackground />
  <SegmentLineFrom />
  <SegmentLineTo />
  <XAxis />
  <ChartTooltip />
</LineChart>
```

Use `SegmentBackground`, `SegmentLineFrom`, and `SegmentLineTo` independently — you do not need all three. Boundary lines support `variant="dashed" | "solid" | "gradient"`.

### Reading Selection Data

Use the `useChart` hook inside a child component to read the active selection:

```tsx
import { useChart } from "@bklitui/ui/charts";

function SelectionStats({ onSelectionChange }) {
  const { selection, data, xAccessor } = useChart();

  useEffect(() => {
    if (!selection?.active) {
      onSelectionChange(null);
      return;
    }

    const startPoint = data[selection.startIndex];
    const endPoint = data[selection.endIndex];
    // Compute and report stats...
    onSelectionChange({ startPoint, endPoint });
  }, [selection, data, xAccessor, onSelectionChange]);

  return null;
}
```

### SegmentBackground

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `fill` | `string` | `var(--chart-segment-background)` | Fill color for the selected region |

### SegmentLineFrom / SegmentLineTo

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `stroke` | `string` | `var(--chart-segment-line)` | Line color |
| `strokeWidth` | `number` | `1` | Line width |
| `variant` | `"dashed" \| "solid" \| "gradient"` | `"dashed"` | Line style |

## Theming

The chart uses CSS variables for theming. Define these in your CSS:

```css
:root {
  --chart-background: oklch(1 0 0);
  --chart-foreground: oklch(0.145 0.004 285);
  --chart-foreground-muted: oklch(0.55 0.014 260);
  --chart-line-primary: oklch(0.623 0.214 255);
  --chart-line-secondary: oklch(0.705 0.015 265);
  --chart-crosshair: oklch(0.4 0.1828 274.34);
  --chart-grid: oklch(0.9 0 0);
  --chart-tooltip-foreground: oklch(0.985 0 0);
  --chart-tooltip-muted: oklch(0.65 0.01 260);
  --chart-marker-background: oklch(0.97 0.005 260);
  --chart-marker-border: oklch(0.85 0.01 260);
  --chart-marker-foreground: oklch(0.3 0.01 260);
  --chart-marker-badge-background: oklch(0 0 0);
  --chart-marker-badge-foreground: oklch(1 0 0);
  --chart-segment-background: oklch(0.5 0 0 / 0.06);
  --chart-segment-line: oklch(0.5 0 0 / 0.25);
}

.dark {
  --chart-background: oklch(0.145 0 0);
  --chart-foreground: oklch(0.45 0 0);
  --chart-crosshair: oklch(0.45 0 0);
  --chart-grid: oklch(0.25 0 0);
  --chart-marker-background: oklch(0.25 0.01 260);
  --chart-marker-border: oklch(0.4 0.01 260);
  --chart-marker-foreground: oklch(0.9 0 0);
  --chart-marker-badge-background: oklch(1 0 0);
  --chart-marker-badge-foreground: oklch(0.15 0 0);
  --chart-segment-background: oklch(1 0 0 / 0.06);
  --chart-segment-line: oklch(1 0 0 / 0.25);
}
```

## Dependencies

This component requires the following packages:

```bash
pnpm add @visx/shape @visx/curve @visx/scale @visx/gradient @visx/responsive @visx/event @visx/grid d3-array motion react-use-measure
```
---
title: Radar Chart
description: A composable multi-series radar chart with animated polygons, hover interactions, and customizable metrics
---

import { RadarChart, RadarGrid, RadarAxis, RadarLabels, RadarArea } from "@bklitui/ui/charts";
import { RadarChartDemo } from "@/components/docs/radar-chart-demo";

<ComponentPreview registryName="radar-chart">
  <RadarChartDemo />
</ComponentPreview>

## Installation

<InstallationTabs name="radar-chart" dependencies={["@visx/responsive", "d3-shape", "motion"]} />

## Usage

The Radar Chart uses a composable API. Define your metrics and data, then combine components:

```tsx
import { RadarChart, RadarGrid, RadarAxis, RadarLabels, RadarArea } from "@bklitui/ui/charts";

const metrics = [
  { key: "speed", label: "Speed" },
  { key: "power", label: "Power" },
  { key: "technique", label: "Technique" },
];

const data = [
  { label: "Player A", color: "#3b82f6", values: { speed: 85, power: 70, technique: 90 } },
  { label: "Player B", color: "#f59e0b", values: { speed: 65, power: 95, technique: 60 } },
];

export default function PerformanceRadar() {
  return (
    <RadarChart data={data} metrics={metrics} size={400}>
      <RadarGrid />
      <RadarAxis />
      <RadarLabels />
      {data.map((item, index) => (
        <RadarArea key={item.label} index={index} />
      ))}
    </RadarChart>
  );
}
```

## Components

### RadarChart

The root container that provides context to all children.

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `data` | `RadarData[]` | required | Array of data series |
| `metrics` | `RadarMetric[]` | required | Metrics to display |
| `size` | `number` | auto | Fixed size in pixels |
| `levels` | `number` | `5` | Number of grid circles |
| `margin` | `number` | `60` | Margin around chart |
| `animate` | `boolean` | `true` | Enable animations |
| `hoveredIndex` | `number \| null` | - | Controlled hover state |
| `onHoverChange` | `(index: number \| null) => void` | - | Hover callback |
| `className` | `string` | `""` | Additional CSS class |

### RadarGrid

Renders the circular grid lines (spider web pattern).

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `showLabels` | `boolean` | `true` | Show level value labels |
| `className` | `string` | `""` | Additional CSS class |

### RadarAxis

Renders axis lines from center to each metric.

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `className` | `string` | `""` | Additional CSS class |

### RadarLabels

Renders metric labels around the perimeter.

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `offset` | `number` | `24` | Distance from chart edge |
| `fontSize` | `number` | `11` | Font size for labels |
| `interactive` | `boolean` | `false` | Enable hover effects on labels |
| `className` | `string` | `""` | Additional CSS class |

### RadarArea

Renders a single data polygon with hover effects.

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `index` | `number` | required | Index in the data array |
| `color` | `string` | from data | Optional color override |
| `showPoints` | `boolean` | `true` | Show data point circles |
| `showGlow` | `boolean` | `true` | Show glow effect on hover |
| `className` | `string` | `""` | Additional CSS class |

## Data Shape

```ts
interface RadarMetric {
  key: string;    // Unique identifier
  label: string;  // Display label
}

interface RadarData {
  label: string;                    // Series label
  color: string;                    // Series color
  values: Record<string, number>;   // metric key -> value (0-100)
}
```

See the [charts gallery](/charts/radar-chart) for minimal styles, legend sync, and layout variations.

## Theming

`RadarGrid` and `RadarAxis` stroke defaults use `radarCssVars.border` → **`var(--border)`** — the same token as ring tracks and gauge inactive notches. Override `--border` in your theme or pass a custom `stroke` prop.

Series fill colors default to `--chart-1` through `--chart-5` via `defaultRadarColors`.

## Hooks

### useRadar

Access the radar context from any child component:

```tsx
import { useRadar } from "@bklitui/ui/charts";

function CustomComponent() {
  const {
    data,
    metrics,
    radius,
    hoveredIndex,
    setHoveredIndex,
    getPointPosition,
  } = useRadar();
  // ...
}
```

## Animation

The radar chart features a multi-phase animation on mount:

1. **Grid Expansion** - Concentric circles scale in from center
2. **Axis Growth** - Lines grow outward from center
3. **Label Fade** - Metric labels fade in
4. **Area Expansion** - Data polygons animate from center to values

All animations use spring physics for natural motion. Hover interactions are instant with no delays.

## Dependencies

```bash
pnpm add @visx/group @visx/responsive @visx/scale @visx/shape motion
```

---
title: Ring Chart
description: A composable multi-ring progress chart with animated arcs, hover interactions, and a reusable legend component
---

import { RingChart, Ring, RingCenter } from "@bklitui/ui/charts";
import { RingChartDemo } from "@/components/docs/ring-chart-demo";

<ComponentPreview registryName="ring-chart">
  <RingChartDemo />
</ComponentPreview>

## Installation

<InstallationTabs name="ring-chart" dependencies={["@visx/responsive", "@number-flow/react", "motion"]} />

## Usage

The Ring Chart uses a composable API similar to other charts in the library. Build charts by combining components:

```tsx
import { RingChart, Ring, RingCenter } from "@bklitui/ui/charts";

const data = [
  { label: "Organic", value: 4250, maxValue: 5000, color: "#0ea5e9" },
  { label: "Paid", value: 3120, maxValue: 5000, color: "#a855f7" },
  { label: "Email", value: 2100, maxValue: 5000, color: "#f59e0b" },
];

export default function SessionsChart() {
  return (
    <RingChart data={data} size={300}>
      {data.map((item, index) => (
        <Ring key={item.label} index={index} />
      ))}
      <RingCenter defaultLabel="Total Sessions" />
    </RingChart>
  );
}
```

## Components

### RingChart

The root component that provides context to all children.

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `data` | `RingData[]` | required | Array of ring data items |
| `size` | `number` | auto | Fixed size in pixels (uses parent if not set) |
| `strokeWidth` | `number` | `12` | Width of each ring |
| `ringGap` | `number` | `6` | Gap between rings |
| `baseInnerRadius` | `number` | `60` | Inner radius of the innermost ring |
| `hoveredIndex` | `number \| null` | - | Controlled hover state |
| `onHoverChange` | `(index: number \| null) => void` | - | Hover state callback |
| `className` | `string` | `""` | Additional CSS class |

### Ring

Renders an individual ring with background track and animated progress arc.

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `index` | `number` | required | Index of the ring in the data array |
| `color` | `string` | from data/palette | Optional color override |
| `animate` | `boolean` | `true` | Enable animation on mount |
| `showGlow` | `boolean` | `true` | Show glow effect on hover |
| `lineCap` | `"round" \| "butt"` | `"round"` | Line cap style for ring ends |

### RingCenter

Displays the total or hovered value in the center of the chart.

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `defaultLabel` | `string` | `"Total"` | Label shown when not hovering |
| `formatValue` | `(value: number) => string` | `toLocaleString()` | Format function for values |
| `children` | `function` | - | Custom render function |
| `className` | `string` | `""` | Additional CSS class |

### Legend

A composable legend component for ring charts, pie charts, and other visualizations. See the full [Legend documentation](/docs/components/legend) for all components and options.

## Data Shape

```ts
interface RingData {
  label: string;      // Display label
  value: number;      // Current value
  maxValue: number;   // Maximum value (for percentage)
  color?: string;     // Optional color (falls back to palette)
}

interface LegendItem {
  label: string;
  value: number;
  maxValue?: number;  // Required if showProgress is true
  color: string;
}
```

See the [charts gallery](/charts/ring-chart) for custom colors, legend sync, and center content variations.

## Theming

The Ring Chart uses CSS variables for theming. The ring track uses `--border` (same as radar grid lines), and ring colors default to `--chart-1` through `--chart-5`:

```css
:root {
  --border: oklch(0.92 0.004 286.32);
  --chart-1: oklch(0.646 0.222 41.116);
  --chart-2: oklch(0.6 0.118 184.704);
  --chart-3: oklch(0.398 0.07 227.392);
  --chart-4: oklch(0.828 0.189 84.429);
  --chart-5: oklch(0.769 0.188 70.08);
}

.dark {
  --border: oklch(0.56 0.0195 267.65 / 0.2);
  --chart-1: oklch(0.488 0.243 264.376);
  --chart-2: oklch(0.696 0.17 162.48);
  --chart-3: oklch(0.769 0.188 70.08);
  --chart-4: oklch(0.627 0.265 303.9);
  --chart-5: oklch(0.645 0.246 16.439);
}
```

## Animation

The ring chart features a multi-phase animation on mount:

1. **Ring Expansion** - Background rings scale in with staggered timing
2. **Progress Arcs** - Progress arcs animate from 0 to their target value
3. **Center Content** - Value and label fade in
4. **Legend** - Items slide in from the right with progress bars filling

All animations use spring physics for natural motion.

## Dependencies

```bash
pnpm add @visx/shape @visx/group @visx/responsive motion
```

---
title: Scatter Chart
description: A composable time-series scatter chart with offset rings, hover dimming, and animated enter
---

import { ScatterChartDemo } from "@/components/docs/scatter-chart-demo";

<ComponentPreview registryName="scatter-chart">
  <ScatterChartDemo />
</ComponentPreview>

## Installation

<InstallationTabs
  name="scatter-chart"
  dependencies={["d3-scale", "d3-array", "motion", "react-use-measure"]}
/>

## Usage

Build scatter charts by composing `ScatterChart` with one or more `Scatter` series, plus shared cartesian pieces (`Grid` or [`Background`](/docs/utility/background), `XAxis`, `ChartTooltip`).

### Basic Example

```tsx
import { ScatterChart, Scatter, Grid, XAxis, ChartTooltip } from "@bklitui/ui/charts";

const data = [
  { date: new Date("2025-01-01"), users: 1200 },
  { date: new Date("2025-02-01"), users: 1350 },
  { date: new Date("2025-03-01"), users: 1100 },
];

export default function SimpleScatter() {
  return (
    <ScatterChart data={data}>
      <Grid horizontal />
      <Scatter dataKey="users" />
      <XAxis />
      <ChartTooltip />
    </ScatterChart>
  );
}
```

### Multiple Series

Series colors default to the chart palette (`--chart-1` … `--chart-5`) in child order:

```tsx
<ScatterChart data={data}>
  <Grid horizontal />
  <Scatter dataKey="sessions" />
  <Scatter dataKey="conversions" />
  <XAxis />
  <ChartTooltip />
</ScatterChart>
```

### Offset Ring

Each dot is an inner fill plus an outer ring separated by a gap (`ringGap`):

```tsx
<Scatter dataKey="users" radius={6} strokeWidth={2} ringGap={2} />
```

### Hover Interaction

Non-active points can fade and blur while the crosshair is active:

```tsx
<Scatter
  dataKey="users"
  fadeOnHover
  inactiveOpacity={0.5}
  inactiveBlur={2}
  showActiveHighlight
/>
```

### Y Gradient

Color dots by vertical position with a chart-space gradient — lower values toward red, higher toward green. Set `strokeWidth={0}` for solid fills without rings:

```tsx
<Scatter dataKey="users" strokeWidth={0} yGradient />

// Custom stops
<Scatter
  dataKey="users"
  strokeWidth={0}
  yGradient={{ from: "var(--color-red-500)", to: "var(--color-emerald-500)" }}
/>
```

## Props

### ScatterChart

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `data` | `Record<string, unknown>[]` | required | Rows with a date (or `xDataKey`) and numeric series fields |
| `xDataKey` | `string` | `"date"` | Field used for the time x-axis |
| `margin` | `Partial<Margin>` | `40` all sides | Chart margins |
| `animationDuration` | `number` | `1100` | Enter animation duration (ms) |
| `enterTransition` | `Transition` | line-chart default | Motion tween for enter |
| `aspectRatio` | `string` | `"2 / 1"` | Container aspect ratio |

### Scatter

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `dataKey` | `string` | required | Y value field |
| `yAxisId` | `string \| number` | `"left"` | Y-scale group for biaxial charts (pair with `YAxis`) |
| `fill` | `string` | series palette | Inner dot fill |
| `stroke` | `string` | same as `fill` | Outer ring color |
| `strokeWidth` | `number` | `2` | Outer ring width (0 disables) |
| `ringGap` | `number` | `2` | Gap between fill and ring (px) |
| `radius` | `number` | `5` | Inner dot radius (px) |
| `fadeOnHover` | `boolean` | `true` | Dim/blur non-active points on hover |
| `inactiveOpacity` | `number` | `0.5` | Opacity for dimmed points |
| `inactiveBlur` | `number` | `2` | Blur (px) for dimmed points |
| `showActiveHighlight` | `boolean` | `true` | Scale up the active point |
| `yGradient` | `boolean \| { from?: string; to?: string }` | — | Color dots by y-position (default red → green) |

## Shared Components

Use the same cartesian building blocks as `LineChart`:

- `Grid` — horizontal/vertical grid lines
- [`Background`](/docs/utility/background) — pattern fill when grid lines are hidden (see [gallery](/charts/scatter-chart))
- `YAxis` — value labels (single shared scale; see [Y Axis](/docs/utility/axis/y-axis))
- `XAxis` — date labels with crosshair fade
- `ChartTooltip` — crosshair, date pill, and series rows

---
title: Area Chart
description: A composable area chart with gradient fills, tooltips, and hover interactions
---

import { studioChartHref } from "@bklitui/studio";
import { AreaChart, Area, Grid, XAxis, ChartTooltip, ChartBrush, ChartBrushLayout, PatternLines, PatternArea } from "@bklitui/ui/charts";
import { AreaChartBrushDemo } from "@/components/docs/area-chart-brush-demo";
import { AreaChartYDomainDemo } from "@/components/docs/area-chart-y-domain-demo";
import { AreaTooltipDemo } from "@/components/docs/area-tooltip-demo";
import { OpenInStudioButton } from "@/components/docs/open-in-studio-button";

export const chartData = [
  { date: new Date(Date.now() - 29 * 24 * 60 * 60 * 1000), revenue: 12000, costs: 8500 },
  { date: new Date(Date.now() - 28 * 24 * 60 * 60 * 1000), revenue: 13500, costs: 9200 },
  { date: new Date(Date.now() - 27 * 24 * 60 * 60 * 1000), revenue: 11000, costs: 7800 },
  { date: new Date(Date.now() - 26 * 24 * 60 * 60 * 1000), revenue: 14500, costs: 10100 },
  { date: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000), revenue: 13800, costs: 9400 },
  { date: new Date(Date.now() - 24 * 24 * 60 * 60 * 1000), revenue: 15200, costs: 10800 },
  { date: new Date(Date.now() - 23 * 24 * 60 * 60 * 1000), revenue: 16000, costs: 11200 },
  { date: new Date(Date.now() - 22 * 24 * 60 * 60 * 1000), revenue: 14800, costs: 10500 },
  { date: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000), revenue: 15500, costs: 10900 },
  { date: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000), revenue: 14200, costs: 9800 },
  { date: new Date(Date.now() - 19 * 24 * 60 * 60 * 1000), revenue: 16800, costs: 11800 },
  { date: new Date(Date.now() - 18 * 24 * 60 * 60 * 1000), revenue: 17500, costs: 12400 },
  { date: new Date(Date.now() - 17 * 24 * 60 * 60 * 1000), revenue: 16200, costs: 11500 },
  { date: new Date(Date.now() - 16 * 24 * 60 * 60 * 1000), revenue: 15800, costs: 11200 },
  { date: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000), revenue: 17200, costs: 12100 },
  { date: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000), revenue: 18500, costs: 13200 },
  { date: new Date(Date.now() - 13 * 24 * 60 * 60 * 1000), revenue: 17800, costs: 12600 },
  { date: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000), revenue: 16500, costs: 11700 },
  { date: new Date(Date.now() - 11 * 24 * 60 * 60 * 1000), revenue: 19200, costs: 13800 },
  { date: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000), revenue: 18800, costs: 13400 },
  { date: new Date(Date.now() - 9 * 24 * 60 * 60 * 1000), revenue: 17500, costs: 12400 },
  { date: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000), revenue: 19800, costs: 14200 },
  { date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), revenue: 20500, costs: 14800 },
  { date: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000), revenue: 19200, costs: 13600 },
  { date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), revenue: 21000, costs: 15200 },
  { date: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000), revenue: 21800, costs: 15800 },
  { date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), revenue: 20500, costs: 14600 },
  { date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), revenue: 22500, costs: 16200 },
  { date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), revenue: 23200, costs: 16800 },
  { date: new Date(), revenue: 24000, costs: 17400 },
];

<ComponentPreview registryName="area-chart">
  <div className="w-full">
    <AreaChart data={chartData}>
      <Grid horizontal />
      <Area dataKey="revenue" fill="var(--chart-line-primary)" fillOpacity={0.3} fadeEdges />
      <Area dataKey="costs" fill="var(--chart-line-secondary)" fillOpacity={0.3} fadeEdges />
      <XAxis />
      <AreaTooltipDemo />
    </AreaChart>
  </div>
</ComponentPreview>

## Installation

<InstallationTabs name="area-chart" dependencies={["@visx/curve", "@visx/gradient", "@visx/pattern", "@visx/shape", "motion"]} />

## Usage

The Area Chart uses the same composable API as the Line Chart. See the [charts gallery](/charts/area-chart) for interactive examples.

```tsx
import { AreaChart, Area, Grid, XAxis, ChartTooltip } from "@bklitui/ui/charts";

const data = [
  { date: new Date("2025-01-01"), revenue: 12000, costs: 8500 },
  { date: new Date("2025-01-02"), revenue: 13500, costs: 9200 },
  // ... more data
];

export default function RevenueChart() {
  return (
    <AreaChart data={data}>
      <Grid horizontal />
      <Area dataKey="revenue" fill="var(--chart-line-primary)" />
      <Area dataKey="costs" fill="var(--chart-line-secondary)" />
      <XAxis />
      <ChartTooltip />
    </AreaChart>
  );
}
```

## Components

### AreaChart

The root component that provides context to all children. It shares the same props as `LineChart`.

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `data` | `Record<string, unknown>[]` | required | Array of data points |
| `xDataKey` | `string` | `"date"` | Key in data for x-axis values |
| `margin` | `Partial<Margin>` | `{ top: 40, right: 40, bottom: 40, left: 40 }` | Chart margins |
| `animationDuration` | `number` | `1100` | Clip-reveal duration in ms (`cubic-bezier(0.85, 0, 0.15, 1)`) |
| `status` | `"loading" \| "ready"` | `"ready"` | Loading ↔ ready choreography on one chart instance |
| `loadingLabel` | `string` | — | Centered shimmer label while `status="loading"` (`""` hides it) |
| `yDomainTween` | `boolean` | `true` | Animate y-domain when status or target domain changes |
| `yDomainTweenDuration` | `number` | `500` | Y-domain tween duration in ms |
| `xDomain` | `[Date, Date]` | — | Visible x-range for brush zoom |
| `xDomainSlotCount` | `number` | — | Full dataset length for x-scale padding when `xDomain` is set |
| `tweenYDomainOnXDomainChange` | `boolean` | `false` | Tween y-domain when the brush changes the visible x-range |
| `aspectRatio` | `string` | `"2 / 1"` | CSS aspect ratio |
| `className` | `string` | `""` | Additional CSS class |
| `style` | `CSSProperties` | — | Inline container styles (e.g. fixed height for a brush strip) |

### Area

Renders a filled area on the chart with a gradient fill.

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `dataKey` | `string` | required | Key in data for y values |
| `yAxisId` | `string \| number` | `"left"` | Y-scale group for biaxial charts (pair with `YAxis`) |
| `fill` | `string` | `var(--chart-line-primary)` | Gradient fill color |
| `fillOpacity` | `number` | `0.4` | Fill opacity at the top |
| `stroke` | `string` | Same as `fill` | Line stroke color |
| `strokeWidth` | `number` | `2` | Line stroke width |
| `curve` | `CurveFactory` | `curveMonotoneX` | D3 curve function |
| `animate` | `boolean` | `true` | Enable grow animation |
| `showLine` | `boolean` | `true` | Show stroke line on top |
| `showHighlight` | `boolean` | `true` | Show highlight on hover |
| `gradientToOpacity` | `number` | `0` | Opacity at bottom of gradient |
| `fadeEdges` | `boolean` | `false` | Fade area fill at left/right edges |
| `showMarkers` | `boolean` | `false` | Render scatter-style ring markers at each point |
| `loadingStroke` | `string` | `var(--foreground)` | Pulse stroke color while chart is loading |
| `loadingStrokeOpacity` | `number` | `0.5` | Pulse stroke opacity while chart is loading |
| `markers` | `SeriesPointMarkerStyle` | — | Marker styling (same options as [`Scatter`](/docs/components/scatter-chart)) |

### PatternArea

Renders a filled area using an SVG pattern (`url(#id)`). Define the pattern (e.g. `PatternLines`) as a child of `AreaChart`, then pair `PatternArea` with an `Area` that has `fillOpacity={0}` for the stroke line.

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `dataKey` | `string` | required | Key in data for y values |
| `fill` | `string` | required | Fill color or pattern URL (e.g. `url(#pattern-id)`) |
| `curve` | `CurveFactory` | `curveMonotoneX` | D3 curve function |

### Grid

Renders grid lines.

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `horizontal` | `boolean` | `true` | Show horizontal lines |
| `vertical` | `boolean` | `false` | Show vertical lines |
| `numTicksRows` | `number` | `5` | Number of horizontal lines |
| `numTicksColumns` | `number` | `10` | Number of vertical lines |
| `stroke` | `string` | `var(--chart-grid)` | Line color while ready |
| `loadingStroke` | `string` | — | Grid stroke while loading chrome is active |
| `strokeDasharray` | `string` | `"4,4"` | Dash pattern |
| `shimmer` | `boolean` | `false` | Animate a shimmer band across horizontal grid lines |
| `shimmerStroke` | `string` | `color-mix(…)` on `--foreground` at 68% | Shimmer band color and opacity |
| `shimmerLength` | `number` | `140` | Shimmer band width in pixels |
| `shimmerSpeed` | `number` | `1` | Shimmer speed multiplier when sync is off (higher = faster) |
| `shimmerSync` | `boolean` | `false` | Match shimmer timing to the line pulse (2.2s cycle + 280ms pause) |

### Background

Pattern fill for the plot area when you omit `Grid`. See the [Background utility](/docs/utility/background) and **Pattern Background** examples on the [area chart gallery](/charts/area-chart).

### YAxis

Value labels on the left or right. See [Y Axis](/docs/utility/axis/y-axis) for `yAxisId`, `orientation`, and biaxial usage.

### XAxis

Renders x-axis labels that fade when the crosshair passes.

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `numTicks` | `number` | `5` | Number of tick labels to show |
| `tickerHalfWidth` | `number` | `50` | Fade radius for labels |
| `tickMode` | `"data" \| "domain"` | `"data"` | `"data"` snaps labels to data rows (crosshair-aligned); `"domain"` for calendar-even spacing |

### ChartTooltip

Renders the tooltip with crosshair, dots, and content box.

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `showDatePill` | `boolean` | `true` | Show animated date ticker |
| `showCrosshair` | `boolean` | `true` | Show vertical crosshair |
| `showDots` | `boolean` | `true` | Show dots on series |
| `indicatorColor` | `string \| (point) => string` | — | Crosshair and dot color |
| `indicatorDasharray` | `string` | — | Dash pattern for the crosshair (e.g. `"4,4"`) |
| `indicatorFadeEdges` | `"both" \| "top" \| "bottom" \| "none"` | `"both"` | Vertical crosshair fade |
| `indicatorFadeLength` | `number` | `10` | Fade size (% of height) |
| `matchCrosshair` | `boolean` | `false` | Panel uses crosshair spring when `true` |
| `damping` | `number` | `20` | Panel follow when `matchCrosshair={false}`; `0` = instant |
| `content` | `(props) => ReactNode` | - | Custom content renderer |
| `rows` | `(point) => TooltipRow[]` | - | Custom row generator |

## Brush zoom

See the [Brush](/docs/utility/brush) utility docs for `ChartBrushLayout` and `ChartBrush` props.

Wrap the main chart in `ChartBrushLayout`, render a simplified mini chart in `brushStrip`, and add `ChartBrush` as a child of that strip. Pass `xDomain`, `xDomainSlotCount`, and `tweenYDomainOnXDomainChange` to the main `AreaChart` so the y-scale adapts as users pan and resize the brush.

<div className="not-prose mb-3 flex items-center justify-between gap-4">
  <h3 className="m-0 font-semibold text-foreground text-base tracking-tight">
    Preview
  </h3>
  <OpenInStudioButton
    href={studioChartHref("area-chart", { showBrush: true })}
    slug="area-chart"
  />
</div>

<ComponentShowcase
  code={`<ChartBrushLayout
  data={data}
  enabled
  height={72}
  brushStrip={(layout) => (
    <AreaChart data={data} animationDuration={0} status="ready">
      <Area dataKey="value" fillOpacity={0.15} animate={false} />
      <ChartBrush
        initialSelection={layout.brushSelection ?? undefined}
        onSelectionChange={layout.onBrushSelectionChange}
      />
    </AreaChart>
  )}
>
  {(layout) => (
    <AreaChart
      data={data}
      xDomain={layout.xDomain}
      xDomainSlotCount={layout.xDomainSlotCount}
      tweenYDomainOnXDomainChange
      yDomainTween
    >
      <Grid horizontal />
      <Area dataKey="value" fillOpacity={0.35} />
      <XAxis />
      <ChartTooltip />
    </AreaChart>
  )}
</ChartBrushLayout>`}
  liveChartPreview
  previewMinHeight={360}
>
  <AreaChartBrushDemo />
</ComponentShowcase>

Open [Studio with brush enabled](/studio?chart=area-chart&showBrush=true) to tune strip height, blur, and selection pattern.

## Loading state

Drive loading and ready from your data layer with a single `AreaChart` — one `Grid`, one `Area`, no component swap. Set `status="loading"` while fetching; switch to `"ready"` when data resolves.

**Loading → ready:** pulse loop on skeleton data → pulse finishes its grow, then flows out right → loading label drifts down 30px, blurs, and fades → grid y-domain tween (500ms) → clip-path reveal (`cubic-bezier(0.85, 0, 0.15, 1)`) → interaction enabled.

**Ready → loading:** ready area conceals to the right → grid y-domain tween → pulse loop and shimmer resume.

Pair `Grid` `stroke` / `loadingStroke` with shimmer props. Pair `Area` `loadingStroke` props. Use `loadingLabel` on `AreaChart` for centered shimmer text via `@bklit/shimmering-text`.

<div className="not-prose mb-3 flex items-center justify-between gap-4">
  <h3 className="m-0 font-semibold text-foreground text-base tracking-tight">
    Preview
  </h3>
  <OpenInStudioButton
    href={studioChartHref("area-chart", { areaChartState: "loading" })}
    slug="area-chart"
  />
</div>

<ComponentShowcase
  code={`const [status, setStatus] = useState<"loading" | "ready">("loading");
const [loadingStyle, setLoadingStyle] = useState<"pulse" | "sweep">("pulse");

<AreaChart
  data={data}
  status={status}
  loadingLabel="Loading revenue…"
  yDomainTween
>
  <Grid
    horizontal
    loadingStroke="color-mix(in oklch, var(--chart-grid) 50%, transparent)"
    shimmer
    shimmerSync
    stroke="var(--chart-grid)"
  />
  <Area
    dataKey="revenue"
    fadeEdges
    fill="var(--chart-line-primary)"
    fillOpacity={0.35}
    loadingStroke="var(--foreground)"
    loadingStrokeOpacity={0.5}
    loadingStyle={loadingStyle}
    strokeWidth={2}
  />
</AreaChart>`}
  liveChartPreview
  previewMinHeight={320}
>
  <AreaChartYDomainDemo />
</ComponentShowcase>

Toggle **Loading** / **Ready** in the preview to replay the transition, and **Pulse** / **Sweep** to switch the loading animation style. When target data spans a different y-range than the skeleton, `yDomainTween` morphs the scale before the area reveals.

### Studio

Open [Studio in loading mode](/studio?chart=area-chart&areaChartState=loading) and set **State** to **Loading**. In **Settings**, choose **Loading style** — **Pulse** (traveling segment) or **Sweep** (diagonal shimmer). The components tree exposes **Grid**, **Label**, and **Area**:

| Layer | Controls |
|-------|----------|
| **Settings** | **Loading style** — Pulse or Sweep (Sweep turns off grid shimmer) |
| **Grid** | Grid and shimmer color pickers, shimmer toggle, band length, **Animation** (sync with pulse, speed when unsynced) |
| **Label** | Shimmer label text |
| **Area** | Pulse stroke color and opacity |

Data and animation panels stay collapsed in loading mode; scramble data is disabled. See the [area chart gallery](/charts/area-chart) (**Loading** example).

Installing `@bklit/area-chart` pulls in `@bklit/shimmering-text` automatically.

### Loading style: pulse or sweep

The loading state has two animation styles, set with `loadingStyle` on the `Area`: the default `"pulse"` (a segment travels along the skeleton stroke) or `"sweep"` (a soft diagonal shimmer sweeps across the whole area). Set it on the `Area` inside a `status="loading"` chart, or on the `AreaChartLoading` wrapper:

```tsx
<AreaChart data={data} status="loading">
  <Grid horizontal shimmer />
  <Area dataKey="revenue" loadingStyle="sweep" />
</AreaChart>

// or, with the turnkey wrapper:
<AreaChartLoading loadingStyle="sweep" />;
```

The sweep masks over the real skeleton stroke, so it follows whatever `curve` the `Area` uses and respects `prefers-reduced-motion`. The sweep is used only during steady loading; the pulse still drives the exit transition. See the **Loading (Sweep)** example on the [area chart gallery](/charts/area-chart).

## Dashed tail

Set `dashFromIndex` on `Area` to draw a solid stroke through one data point, then a dashed segment through the end of the series. Useful when the final period is still in progress (e.g. yesterday → today).

`dashFromIndex` is **inclusive** — dashing starts at that row and continues through the last point. The dashed segment follows the same curved path as the solid stroke and respects the stroke gradient fade from `fadeEdges`.

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `dashFromIndex` | `number` | — | Inclusive data index where the dashed tail begins |
| `dashArray` | `string` | `"6,4"` | SVG `stroke-dasharray` pattern for the tail segment |

```tsx
<Area
  dataKey="visitors"
  dashFromIndex={5}
  dashArray="6,4"
  fill="var(--chart-line-primary)"
  fillOpacity={0.35}
/>
```

## Markers

Add markers to annotate specific dates on the chart:

```tsx
import {
  AreaChart,
  Area,
  ChartTooltip,
  ChartMarkers,
  MarkerTooltipContent,
  useActiveMarkers,
  type ChartMarker,
} from "@bklitui/ui/charts";

const markers: ChartMarker[] = [
  {
    date: new Date("2025-01-05"),
    icon: "🚀",
    title: "v1.2.0 Released",
    description: "New chart animations",
  },
];

function MyChart({ data }) {
  return (
    <AreaChart data={data}>
      <Area dataKey="revenue" fill="var(--chart-line-primary)" />
      <ChartMarkers items={markers} />
      <ChartTooltip>
        <MarkerContent markers={markers} />
      </ChartTooltip>
    </AreaChart>
  );
}

function MarkerContent({ markers }) {
  const activeMarkers = useActiveMarkers(markers);
  if (activeMarkers.length === 0) return null;
  return <MarkerTooltipContent markers={activeMarkers} />;
}
```

### ChartMarker Interface

```ts
interface ChartMarker {
  date: Date;
  icon: React.ReactNode;
  title: string;
  description?: string;
  content?: React.ReactNode;
  color?: string;
  onClick?: () => void;
  href?: string;
  target?: "_blank" | "_self";
}
```

### ChartMarkers Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `items` | `ChartMarker[]` | required | Array of markers |
| `size` | `number` | `28` | Marker circle size |
| `showLines` | `boolean` | `true` | Show vertical guide lines |
| `animate` | `boolean` | `true` | Animate markers on entrance |

## Segment Selection

Add click-drag and touch segment selection with composable components. The area highlight automatically shows the selected path segment.

### Basic Usage

```tsx
import {
  AreaChart,
  Area,
  Grid,
  XAxis,
  ChartTooltip,
  SegmentBackground,
  SegmentLineFrom,
  SegmentLineTo,
} from "@bklitui/ui/charts";

<AreaChart data={data}>
  <Grid horizontal />
  <Area dataKey="revenue" fill="var(--chart-line-primary)" />
  <SegmentBackground />
  <SegmentLineFrom />
  <SegmentLineTo />
  <XAxis />
  <ChartTooltip />
</AreaChart>
```

Use `SegmentBackground`, `SegmentLineFrom`, and `SegmentLineTo` independently — you do not need all three. Boundary lines support `variant="dashed" | "solid" | "gradient"`.

### Reading Selection Data

Use the `useChart` hook inside a child component to read the active selection:

```tsx
import { useChart } from "@bklitui/ui/charts";

function SelectionStats({ onSelectionChange }) {
  const { selection, data, xAccessor } = useChart();

  useEffect(() => {
    if (!selection?.active) {
      onSelectionChange(null);
      return;
    }

    const startPoint = data[selection.startIndex];
    const endPoint = data[selection.endIndex];
    onSelectionChange({ startPoint, endPoint });
  }, [selection, data, xAccessor, onSelectionChange]);

  return null;
}
```

### SegmentBackground

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `fill` | `string` | `var(--chart-segment-background)` | Fill color for the selected region |

### SegmentLineFrom / SegmentLineTo

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `stroke` | `string` | `var(--chart-segment-line)` | Line color |
| `strokeWidth` | `number` | `1` | Line width |
| `variant` | `"dashed" \| "solid" \| "gradient"` | `"dashed"` | Line style |

## Theming

The Area Chart uses the same CSS variables as the Line Chart:

```css
:root {
  --chart-background: oklch(1 0 0);
  --chart-foreground: oklch(0.145 0.004 285);
  --chart-foreground-muted: oklch(0.55 0.014 260);
  --chart-line-primary: oklch(0.623 0.214 255);
  --chart-line-secondary: oklch(0.705 0.015 265);
  --chart-crosshair: oklch(0.4 0.1828 274.34);
  --chart-grid: oklch(0.9 0 0);
  --chart-tooltip-foreground: oklch(0.985 0 0);
  --chart-tooltip-muted: oklch(0.65 0.01 260);
  --chart-marker-background: oklch(0.97 0.005 260);
  --chart-marker-border: oklch(0.85 0.01 260);
  --chart-marker-foreground: oklch(0.3 0.01 260);
  --chart-marker-badge-background: oklch(0 0 0);
  --chart-marker-badge-foreground: oklch(1 0 0);
  --chart-segment-background: oklch(0.5 0 0 / 0.06);
  --chart-segment-line: oklch(0.5 0 0 / 0.25);
}

.dark {
  --chart-background: oklch(0.145 0 0);
  --chart-foreground: oklch(0.45 0 0);
  --chart-crosshair: oklch(0.45 0 0);
  --chart-grid: oklch(0.25 0 0);
  --chart-marker-background: oklch(0.25 0.01 260);
  --chart-marker-border: oklch(0.4 0.01 260);
  --chart-marker-foreground: oklch(0.9 0 0);
  --chart-marker-badge-background: oklch(1 0 0);
  --chart-marker-badge-foreground: oklch(0.15 0 0);
  --chart-segment-background: oklch(1 0 0 / 0.06);
  --chart-segment-line: oklch(1 0 0 / 0.25);
}
```

## Dependencies

This component requires the same packages as the Line Chart:

```bash
pnpm add @visx/shape @visx/curve @visx/scale @visx/gradient @visx/responsive @visx/event @visx/grid d3-array motion react-use-measure
```

---
title: Bar Chart
description: A composable bar chart with spring animations, stacked bars, horizontal orientation, and grouped series support
---

import {
  BarChart,
  Bar,
  BarXAxis,
  Grid,
  ChartTooltip,
} from "@bklitui/ui/charts";
import { BarChartLoadingDemo } from "@/components/docs/bar-chart-loading-demo";
import { Icon } from "@bklitui/icons";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export const chartData = [
  { month: "Jan", revenue: 12000, profit: 4500 },
  { month: "Feb", revenue: 15500, profit: 5200 },
  { month: "Mar", revenue: 11000, profit: 3800 },
  { month: "Apr", revenue: 18500, profit: 7100 },
  { month: "May", revenue: 16800, profit: 5400 },
  { month: "Jun", revenue: 21200, profit: 8800 },
];

<ComponentPreview registryName="bar-chart">
  <div className="w-full">
    <BarChart data={chartData} xDataKey="month">
      <Grid horizontal />
      <Bar dataKey="revenue" fill="var(--chart-line-primary)" lineCap="round" />
      <Bar
        dataKey="profit"
        fill="var(--chart-line-secondary)"
        lineCap="round"
      />
      <BarXAxis />
      <ChartTooltip />
    </BarChart>
  </div>
</ComponentPreview>

## Installation

<InstallationTabs
  name="bar-chart"
  dependencies={["@visx/gradient", "@visx/pattern", "@visx/shape", "motion"]}
/>

## Usage

The Bar Chart uses the same composable API as the Line and Area charts. Build charts by combining components:

```tsx
import {
  BarChart,
  Bar,
  BarXAxis,
  Grid,
  ChartTooltip,
} from "@bklitui/ui/charts";

const data = [
  { month: "Jan", revenue: 12000, profit: 4500 },
  { month: "Feb", revenue: 15500, profit: 5200 },
  // ... more data
];

export default function RevenueChart() {
  return (
    <BarChart data={data} xDataKey="month">
      <Grid horizontal />
      <Bar dataKey="revenue" fill="var(--chart-line-primary)" lineCap="round" />
      <Bar
        dataKey="profit"
        fill="var(--chart-line-secondary)"
        lineCap="round"
      />
      <BarXAxis />
      <ChartTooltip />
    </BarChart>
  );
}
```

See the [charts gallery](/charts/bar-chart) for stacked bars, horizontal layouts, gradients, patterns, the **Shape** square-column variant, and more.

## Components

### BarChart

The root component that provides context to all children.

| Prop                | Type                         | Default                                        | Description                                         |
| ------------------- | ---------------------------- | ---------------------------------------------- | --------------------------------------------------- |
| `data`              | `Record<string, unknown>[]`  | required                                       | Array of data points                                |
| `xDataKey`          | `string`                     | `"name"`                                       | Key in data for categorical axis values             |
| `margin`            | `Partial<Margin>`            | `{ top: 40, right: 40, bottom: 40, left: 40 }` | Chart margins                                       |
| `animationDuration` | `number`                     | `1100`                                         | Animation duration in ms                            |
| `aspectRatio`       | `string`                     | `"2 / 1"`                                      | CSS aspect ratio                                    |
| `barGap`            | `number`                     | `0.2`                                          | Gap between bar groups (0-1 fraction of band width) |
| `barWidth`          | `number`                     | -                                              | Fixed bar width in pixels (auto-sizes if not set)   |
| `orientation`       | `"vertical" \| "horizontal"` | `"vertical"`                                   | Bar chart orientation                               |
| `stacked`           | `boolean`                    | `false`                                        | Stack bars instead of grouping them                 |
| `stackGap`          | `number`                     | `0`                                            | Gap between stacked bar segments in pixels          |
| `squareSnap`        | `{ squareGap: number; groupGap?: number; fit?: boolean }` | — | Enables square-column tooltip snapping when using `<BarSquares>` |
| `className`         | `string`                     | `""`                                           | Additional CSS class                                |

### Bar

Renders a bar for each data point with configurable styling and animations.

| Prop            | Type                          | Default                     | Description                                             |
| --------------- | ----------------------------- | --------------------------- | ------------------------------------------------------- |
| `dataKey`       | `string`                      | required                    | Key in data for values                                  |
| `yAxisId`       | `string \| number`            | `"left"`                    | Y-scale group for vertical biaxial charts (pair with `YAxis`) |
| `fill`          | `string`                      | `var(--chart-line-primary)` | Bar fill color (can be gradient/pattern url)            |
| `stroke`        | `string`                      | -                           | Tooltip dot color. Use when fill is a gradient/pattern  |
| `lineCap`       | `"round" \| "butt" \| number` | `"round"`                   | Bar end cap style or custom radius                      |
| `animate`       | `boolean`                     | `true`                      | Enable animation                                        |
| `animationType` | `"grow" \| "fade"`            | `"grow"`                    | Animation style                                         |
| `fadedOpacity`  | `number`                      | `0.3`                       | Opacity when another bar is hovered                     |
| `staggerDelay`  | `number`                      | auto                        | Delay between bars (auto-calculated based on bar count) |
| `stackGap`      | `number`                      | `0`                         | Gap between stacked bars in pixels                      |
| `perspective` | `boolean`              | `false`                     | Make this a 3D depth bar: trims the front-face top to meet the lid and forces a flat top. Pass `true` when pairing with `BarDepthBack`/`BarDepthFront` (see [3D Depth](#3d-depth--glass-surfaces)) |
| `minBarHeight`  | `number`                      | `0`                         | Minimum rendered height in px (non-stacked, vertical) — floors short/zero bars so they stay visible. Pair with `<BarDepthProvider minBarHeight>` |

### BarSquares

Renders a **Shape** bar as a vertical stack of discrete squares instead of a continuous `<Bar>`. Use one `<BarSquares>` per series (grouped, vertical charts only). Squares cascade upward on enter; supports solid fills, bar-spanning gradients, and pattern presets.

| Prop            | Type                          | Default                     | Description                                             |
| --------------- | ----------------------------- | --------------------------- | ------------------------------------------------------- |
| `dataKey`       | `string`                      | required                    | Key in data for values                                  |
| `yAxisId`       | `string \| number`            | series default              | Y-scale group for biaxial charts                        |
| `fill`          | `string`                      | `var(--chart-line-primary)` | Solid color or pattern `url(#…)`                        |
| `stroke`        | `string`                      | —                           | Tooltip ring/dot color when fill is gradient/pattern    |
| `squareGap`     | `number`                      | `3`                         | Gap between stacked squares in pixels                   |
| `squareRadius`  | `number`                      | `0.25`                      | Corner radius as a fraction of square size (0–0.5)    |
| `squareFit`     | `boolean`                     | `false`                     | Redistribute gap so columns fit bar height exactly      |
| `useGradient`   | `boolean`                     | `false`                     | Apply a bar-spanning gradient from `gradientStops`      |
| `gradientStops` | `{ offset: number; color: string }[]` | —                 | Gradient stops (0–100) when `useGradient` is true     |
| `patternPreset` | pattern preset id             | —                           | Pattern preset when `fill` is a pattern url             |
| `groupGap`      | `number`                      | `4`                         | Gap between grouped series columns in pixels            |
| `fadedOpacity`  | `number`                      | `0.3`                       | Opacity when another bar is hovered                     |
| `animate`       | `boolean`                     | `true`                      | Enable enter animation                                  |
| `staggerDelay`  | `number`                      | auto                        | Override per-column stagger delay                       |

Pass **`squareSnap`** on `<BarChart>` with the same `squareGap`, `groupGap`, and `squareFit` so tooltip ring indicators align with square columns:

```tsx
<BarChart
  data={data}
  xDataKey="month"
  squareSnap={{ squareGap: 3, groupGap: 4 }}
>
  <BarSquares dataKey="desktop" fill="url(#desktop-pattern)" stroke="var(--chart-5)" squareGap={3} groupGap={4} />
  <BarSquares
    dataKey="mobile"
    fill="var(--chart-1)"
    useGradient
    gradientStops={[
      { offset: 0, color: "var(--chart-1)" },
      { offset: 25, color: "var(--chart-2)" },
      { offset: 50, color: "var(--chart-3)" },
      { offset: 75, color: "var(--chart-4)" },
      { offset: 100, color: "var(--chart-5)" },
    ]}
    stroke="var(--chart-5)"
    squareGap={3}
    groupGap={4}
  />
  <BarXAxis />
  <ChartTooltip showCrosshair={false} dotVariant="ring" dotScale={1.05} />
</BarChart>
```

See the **Shape & Gradient** and **Shape Squircle Ring** examples on the [bar chart gallery](/charts/bar-chart).

### BarColumnTrack

Optional underlay for Shape bars: patterned or solid fill in the **empty space above** each square column (not behind the bars). Place before `<BarSquares>`.

| Prop           | Type     | Default            | Description                                      |
| -------------- | -------- | ------------------ | ------------------------------------------------ |
| `fill`         | `string` | `var(--chart-grid)` | Solid color or pattern `url(#…)`                |
| `opacity`      | `number` | `0.3`              | Track opacity                                    |
| `squareGap`    | `number` | `3`                | Match `<BarSquares squareGap>`                   |
| `squareRadius` | `number` | `0.25`             | Match `<BarSquares squareRadius>`                |
| `squareFit`    | `boolean`| `false`            | Match `<BarSquares squareFit>`                   |
| `groupGap`     | `number` | `4`                | Match `<BarSquares groupGap>`                      |

Tracks animate from full column height on enter and shrink in sync as squares stack upward.

### BarXAxis

Displays categorical labels along the x-axis (for vertical bar charts).

| Prop              | Type      | Default | Description                          |
| ----------------- | --------- | ------- | ------------------------------------ |
| `tickerHalfWidth` | `number`  | `50`    | Width of ticker for fade calculation |
| `showAllLabels`   | `boolean` | `false` | Show all labels (may crowd)          |
| `maxLabels`       | `number`  | `12`    | Maximum labels to show               |

### BarYAxis

Displays categorical labels along the y-axis (for horizontal bar charts).

| Prop            | Type      | Default | Description            |
| --------------- | --------- | ------- | ---------------------- |
| `showAllLabels` | `boolean` | `true`  | Show all labels        |
| `maxLabels`     | `number`  | `20`    | Maximum labels to show |

### Grid

The Grid component now supports `fadeVertical` for vertical grid lines.

| Prop             | Type      | Default | Description                               |
| ---------------- | --------- | ------- | ----------------------------------------- |
| `horizontal`     | `boolean` | `true`  | Show horizontal grid lines                |
| `vertical`       | `boolean` | `false` | Show vertical grid lines                  |
| `fadeHorizontal` | `boolean` | `true`  | Fade horizontal lines at left/right edges |
| `fadeVertical`   | `boolean` | `false` | Fade vertical lines at top/bottom edges   |

### Background

Pattern fill for the plot area when you omit `Grid`. See the [Background utility](/docs/utility/background) and **Pattern Background** examples on the [bar chart gallery](/charts/bar-chart).

### BarDepthBack

Renders the 3D side + top faces. Place **before** `<Bar>` so the bar's front face occludes depth that would extend into the next column.

| Prop            | Type                              | Default                     | Description                                              |
| --------------- | --------------------------------- | --------------------------- | ------------------------------------------------------- |
| `dataKey`       | `string`                          | required                    | Key in data for the bar value (match the sibling `<Bar dataKey>`) |
| `color`         | `string`                          | `var(--chart-line-primary)` | Solid color for the side + top faces                    |
| `colorAccessor` | `(datum, index) => string`        | -                           | Per-bar color override; takes precedence over `color`   |

### BarDepthFront

Renders the glossy glass sheen over the bar's fill. Place **after** `<Bar>`.

| Prop      | Type     | Default  | Description                                              |
| --------- | -------- | -------- | ------------------------------------------------------- |
| `dataKey` | `string` | required | Key in data for the bar value (match the sibling `<Bar dataKey>`) |

### BarPulse

Optional looping vertical sweep over a single active bar (e.g. a live value). Place **after** `<BarDepthFront>`.

| Prop          | Type      | Default | Description                                          |
| ------------- | --------- | ------- | ---------------------------------------------------- |
| `dataKey`     | `string`  | required| Key in data for the bar value                       |
| `activeIndex` | `number`  | -       | Index (in the data array) of the bar to pulse       |
| `pulsePaused` | `boolean` | `false` | Freeze the sweep while keeping the 3D/glass treatment |

### BarDepthProvider

Optional wrapper supplying shared depth config to every layer beneath it. Wrap it **around** `<BarChart>`, not inside it. Use it to split **stacked** bars (`segmentsAccessor`) and/or tune the baseline contact shadow (`groundShadow`).

| Prop               | Type                                          | Default | Description                                          |
| ------------------ | --------------------------------------------- | ------- | ---------------------------------------------------- |
| `segmentsAccessor` | `(datum) => { value: number; color: string }[]` | -     | Stacked segments (bottom→top) for each datum         |
| `groundShadow`     | `number`                                        | `0.26`  | Opacity (0–1) of the dark "contact shadow" that grounds each bar at the baseline. Set `0` to remove it (e.g. on bright fills). |
| `minBarHeight`     | `number`                                        | `0`     | Floors short/zero bars to a min px height so they stay visible. Pass the **same** value to `<Bar minBarHeight>`. |

## 3D Depth & Glass Surfaces

Give bars a head-on 3D perspective and a glass-block sheen by layering `BarDepthBack` (side + top faces, before `Bar`) and `BarDepthFront` (front glass, after `Bar`). The layers read geometry from the chart context, so the only required prop is the matching `dataKey`.

Add **`perspective`** to the `Bar` and you're done — it shrinks the front face's top so the lid sits flush on the bar (instead of floating above it) and forces a flat top so the lid meets it with no gap. **Always pass it when using the depth layers.**

```tsx
import {
  BarChart,
  Bar,
  BarDepthBack,
  BarDepthFront,
  BarXAxis,
  Grid,
  ChartTooltip,
} from "@bklitui/ui/charts";

<BarChart data={data} xDataKey="month">
  <Grid horizontal />
  <BarDepthBack dataKey="revenue" color="var(--chart-1)" />
  <Bar dataKey="revenue" fill="var(--chart-1)" perspective />
  <BarDepthFront dataKey="revenue" />
  <BarXAxis />
  <ChartTooltip />
</BarChart>;
```

### Custom indicator (optional)

The [3D Depth gallery example](/charts/bar-chart) pairs depth bars with a rising line indicator. Disable the default crosshair and dots on `ChartTooltip`, then render your own overlay via `useChart` and a portal — see [Custom Indicator](/docs/utility/custom-indicator).

Color bars individually with `colorAccessor`:

```tsx
<BarDepthBack
  dataKey="revenue"
  colorAccessor={(d) =>
    (d.revenue as number) >= 15000 ? "var(--chart-1)" : "var(--chart-3)"
  }
/>
```

Highlight a live / in-progress bar with `BarPulse` (render it after `BarDepthFront`):

```tsx
<BarPulse dataKey="revenue" activeIndex={data.length - 1} />
```

### Stacked bars (multiple data sources)

To give a **stacked** bar 3D depth, wrap the chart in `BarDepthProvider` with a `segmentsAccessor` returning one `{ value, color }` per data source (bottom→top). The side face splits into a matching parallelogram per segment, and the lid takes the topmost segment's color. The depth's height is the **sum of the segments**, so you don't need a separate total column — just stack a `<Bar>` per source (each with `perspective`) in the same order:

```tsx
<BarDepthProvider
  segmentsAccessor={(d) => [
    { value: d.desktop as number, color: "var(--chart-1)" },
    { value: d.mobile as number, color: "var(--chart-3)" },
  ]}
>
  <BarChart data={data} xDataKey="month" stacked>
    <BarDepthBack dataKey="desktop" />
    <Bar dataKey="desktop" fill="var(--chart-1)" perspective />
    <Bar dataKey="mobile" fill="var(--chart-3)" perspective />
    <BarDepthFront dataKey="desktop" />
    <BarXAxis />
    <ChartTooltip showCrosshair={false} showDots={false} />
  </BarChart>
</BarDepthProvider>;
```

Each bar gets a subtle dark "contact shadow" at the baseline so it reads as sitting on the axis. Tune or remove it with `groundShadow` on the provider (it reads strongest over bright fills):

```tsx
<BarDepthProvider groundShadow={0.12}>
  {/* ...BarChart with depth layers... */}
</BarDepthProvider>
```

To keep **zero or very short** bars visible as a tiny bar instead of vanishing, set `minBarHeight` on **both** the `<Bar>` (floors the front face) and `<BarDepthProvider>` (floors the 3D surfaces) — they must match:

```tsx
<BarDepthProvider minBarHeight={6}>
  <BarChart data={data} xDataKey="month">
    <BarDepthBack dataKey="value" color="var(--chart-1)" />
    <Bar dataKey="value" fill="var(--chart-1)" perspective minBarHeight={6} />
    <BarDepthFront dataKey="value" />
  </BarChart>
</BarDepthProvider>
```

Negative values are supported (bars grow downward from the baseline) as long as the chart's value scale includes negatives. See the [charts gallery](/charts/bar-chart) for a live 3D depth example.

## Loading state

<Alert className="not-prose mb-6">
  <Icon className="size-4" name="IconCircleInfo" />
  <AlertTitle>Loading state is experimental</AlertTitle>
  <AlertDescription>
    Bar chart loading is still in development. APIs, Studio controls, and docs
    may change before release — use with caution in production.
  </AlertDescription>
</Alert>

`BarChart` accepts a `status` prop. While `status="loading"`, it replaces the bars with a shimmer skeleton: placeholder bars with a soft diagonal shimmer sweeping across them on a loop. On `status="ready"` it switches to the real bars. No chart data is required during loading. Bar heights come from a deterministic seed (SSR-safe, no `Math.random()`), and it respects `prefers-reduced-motion` by rendering a calm, static skeleton.

<div className="not-prose mb-3 flex items-center justify-between gap-4">
  <h3 className="m-0 font-semibold text-foreground text-base tracking-tight">
    Preview
  </h3>
</div>

<ComponentShowcase
  code={`const [status, setStatus] = useState<"loading" | "ready">("loading");

<BarChart data={data} status={status} xDataKey="month">
  <Grid horizontal />
  <Bar dataKey="revenue" />
  <BarXAxis />
</BarChart>`}
  liveChartPreview
  previewMinHeight={320}
>
  <BarChartLoadingDemo />
</ComponentShowcase>

Toggle **Loading** / **Ready** in the preview to swap the shimmer skeleton for the real bars.

```tsx
import { BarChart, Bar, BarXAxis } from "@bklitui/ui/charts";

function RevenueChart({ data, isLoading }) {
  return (
    <BarChart data={data} xDataKey="month" status={isLoading ? "loading" : "ready"}>
      <Bar dataKey="revenue" />
      <BarXAxis />
    </BarChart>
  );
}
```

For the common "render a placeholder until data arrives" case, `BarChartLoading` is a turnkey shortcut for `<BarChart status="loading" />`:

```tsx
import { BarChartLoading } from "@bklitui/ui/charts";

<BarChartLoading />;
```

| Prop          | Type                          | Default  | Description                                                  |
| ------------- | ----------------------------- | -------- | ------------------------------------------------------------ |
| `status`      | `"loading" \| "ready"`        | `"ready"` | On `BarChart`. `"loading"` shows the shimmer skeleton        |
| `margin`      | `Partial<Margin>`             | -        | On `BarChartLoading`. Chart margins                          |
| `aspectRatio` | `string`                      | `"2 / 1"` | On `BarChartLoading`. Container aspect ratio                |
| `className`   | `string`                      | -        | On `BarChartLoading`. Additional container class            |

## Animation

Bars animate with the same easing as Line charts (`cubic-bezier(0.85, 0, 0.15, 1)`) for a smooth, organic feel. The stagger delay is automatically calculated based on the number of bars to ensure all animations complete within the total animation duration (~1.2s).

### Grow Animation (Default)

Bars grow from zero to their final size:

```tsx
<Bar dataKey="revenue" animationType="grow" />
```

### Fade Animation

Bars fade in with a blur effect:

```tsx
<Bar dataKey="revenue" animationType="fade" />
```

### Custom Stagger

Stagger is calculated automatically, but you can override it:

```tsx
// Override automatic stagger with custom delay
<Bar dataKey="revenue" staggerDelay={0.02} />

// No stagger (all bars animate together)
<Bar dataKey="revenue" staggerDelay={0} />
```

## Line Cap Styles

Control the bar end style:

```tsx
// Rounded caps (default) - full rounding
<Bar dataKey="revenue" lineCap="round" />

// Square caps - no rounding
<Bar dataKey="revenue" lineCap="butt" />

// Custom radius in pixels
<Bar dataKey="revenue" lineCap={4} />
<Bar dataKey="revenue" lineCap={8} />
```

## Theming

The Bar Chart uses the same CSS variables as other charts:

```css
:root {
  --chart-background: oklch(1 0 0);
  --chart-foreground: oklch(0.145 0.004 285);
  --chart-foreground-muted: oklch(0.55 0.014 260);
  --chart-line-primary: oklch(0.623 0.214 255);
  --chart-line-secondary: oklch(0.705 0.015 265);
  --chart-crosshair: oklch(0.4 0.1828 274.34);
  --chart-grid: oklch(0.9 0 0);
}

.dark {
  --chart-background: oklch(0.145 0 0);
  --chart-foreground: oklch(0.45 0 0);
  --chart-crosshair: oklch(0.45 0 0);
  --chart-grid: oklch(0.25 0 0);
}
```

## Dependencies

This component requires the same packages as the other charts:

```bash
pnpm add @visx/shape @visx/scale @visx/responsive @visx/event @visx/grid d3-array motion react-use-measure
```
---
title: Composed Chart
description: Mix SeriesBar, Line, and Area on one shared time axis (Recharts ComposedChart–style)
---

import { ComposedChartDocsPreview } from "@/components/docs/composed-chart-docs-preview";

<ComponentPreview registryName="composed-chart">
  <ComposedChartDocsPreview />
</ComponentPreview>

## Installation

<InstallationTabs
  name="composed-chart"
  dependencies={[
    "@visx/curve",
    "@visx/scale",
    "@visx/shape",
    "@visx/responsive",
    "d3-array",
    "motion",
  ]}
/>

## Usage

`ComposedChart` is the time-series shell for **mixing marks** on one `data` array and one pair of scales. Use **`SeriesBar`** for vertical columns aligned to dates (not the categorical `<Bar />` from `BarChart`, which uses a band scale).

- **`aspectRatio`** — wide charts (e.g. `4 / 1`) work for full-width heroes; in **narrow cards** use **`3 / 2`** or **`2 / 1`** so the plot stays tall enough to read.
- **`barSize`**, **`maxBarSize`**, **`barGap`** — parent-level layout for `SeriesBar` groups (similar to Recharts `ComposedChart` props). Use **`barGap={0}`** and a higher **`maxBarSize`** for dense daily data so columns read like the [90 days of data](/docs/components/bar-chart#90-days-of-data) bar example.
- **`stacked`** / **`stackGap`** — stack `SeriesBar` segments in child order at each x (lines and areas are not stacked).
- **`SeriesBar`** — default **`radius` is 0** (square tops). Pass **`radius={4}`** (or similar) for rounded corners.
- **`Line`** / **`Area`** — pass a **`curve`** from `@visx/curve` (e.g. **`curveCatmullRom.alpha(0.42)`**) to soften paths when you have many daily points (preview + hero use the same curve for `revenue` and `runRate`).
- **`Line`** / **`Area`** — use **`showMarkers`** for scatter-style ring markers at each point; pass **`markers={{ radius, ringGap, strokeWidth }}`** to tune styling.
- **`Line`** / **`Area`** — use **`dashFromIndex`** and **`dashArray`** for a dashed tail on incomplete periods (the dashed segment follows the same curve and edge fade).
- **`XAxis`** — default ticks snap to data rows so the crosshair aligns. Tune **`numTicks`** for dense series (e.g. daily). Use **`tickMode="domain"`** only when you want calendar-even spacing instead of data alignment.
- **`ChartTooltip`** — for bar-heavy layouts, **`showCrosshair={false}`** often looks cleaner because the hover band is already vertical columns.
- **`YAxis`** / **`yAxisId`** — `Line` and `Area` support independent left/right scales (see [Y Axis](/docs/utility/axis/y-axis)). `SeriesBar` uses the primary scale.
- **Hover dimming** — `SeriesBar` fades non-hovered columns using `tooltipData.index`, like grouped bars in `BarChart`. Tune with **`fadedOpacity`** on each `SeriesBar`.

### Basic example

```tsx
import {
  Area,
  ComposedChart,
  Grid,
  Line,
  SeriesBar,
  XAxis,
  ChartTooltip,
} from "@bklitui/ui/charts";
import { curveCatmullRom } from "@visx/curve";
import { composedDemoData } from "@/lib/composed-demo-data";

const smooth = curveCatmullRom.alpha(0.42);

export default function Example() {
  return (
    <ComposedChart
      aspectRatio="2 / 1"
      barGap={0}
      data={composedDemoData}
      maxBarSize={32}
      xDataKey="date"
    >
      <Grid horizontal />
      <Area
        curve={smooth}
        dataKey="runRate"
        fill="var(--chart-4)"
        fillOpacity={0.32}
      />
      <SeriesBar dataKey="units" fill="var(--chart-3)" radius={4} />
      <Line curve={smooth} dataKey="revenue" stroke="var(--chart-1)" />
      <ChartTooltip showCrosshair={false} />
      <XAxis numTicks={8} />
    </ComposedChart>
  );
}
```

`composedDemoData` is 30 daily rows with ISO `date` strings, one slow wave across the month plus light ripples (kept readable next to dense bars). Outside this monorepo, copy the helpers from `apps/web/lib/composed-demo-data.ts` into your app.

See the [charts gallery](/charts/composed-chart) for stacked bars, pattern fills, rounded bars, and more compositions.

### Background

Use [`Background`](/docs/utility/background) instead of `Grid` for a pattern fill behind bars and lines. See **Pattern Background** examples on the [composed chart gallery](/charts/composed-chart).

## See also

- [Line Chart](/docs/components/line-chart) — lines only
- [Area Chart](/docs/components/area-chart) — areas only
- [Bar Chart](/docs/components/bar-chart) — categorical bars with `<Bar />`


