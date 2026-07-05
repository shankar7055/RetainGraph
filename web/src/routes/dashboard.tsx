import { createFileRoute } from "@tanstack/react-router";
import React, { useState, useEffect } from "react";
import * as d3 from "d3";
import { 
  BarChart as ReBarChart, 
  Bar, 
  XAxis as ReXAxis, 
  YAxis as ReYAxis, 
  ResponsiveContainer, 
  Cell 
} from "recharts";
import { 
  LayoutDashboard, 
  LineChart as LineIcon, 
  Database, 
  Download, 
  FolderLock, 
  HelpCircle, 
  Settings, 
  Search, 
  Bell, 
  Plus, 
  ArrowUpRight, 
  ArrowDownRight,
  UserPlus,
  TrendingUp,
  ShoppingCart,
  Package,
  Users,
  Megaphone,
  Plug,
  Key,
  Activity,
  Terminal,
  Layers,
  ChevronRight,
  ChevronLeft,
  Brain,
  Network,
  FileText,
  Sparkles,
  ShieldAlert,
  MessagesSquare,
  Folder
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

// ==========================================
// FUNNEL CHART COMPONENT (FROM SPEC)
// ==========================================
interface FunnelStage {
  label: string;
  value: number;
  displayValue?: string;
  color?: string;
}

interface FunnelChartProps {
  data: FunnelStage[];
  color?: string;
  layers?: number;
  edges?: "curved" | "straight";
  gap?: number;
  showPercentage?: boolean;
  showValues?: boolean;
  showLabels?: boolean;
  orientation?: "horizontal" | "vertical";
}

export function FunnelChart({ 
  data, 
  layers = 3, 
  edges = "curved"
}: FunnelChartProps) {
  const N = data.length;
  const W = 500;
  const H = 120;
  const w = W / N;

  return (
    <div className="w-full space-y-4 py-2">
      {/* Values row */}
      <div className="flex justify-between px-2 w-full">
        {data.map((stage, idx) => (
          <div key={idx} className="flex-1 text-center font-bold text-white text-xs">
            {stage.displayValue || stage.value.toLocaleString()}
          </div>
        ))}
      </div>

      {/* SVG Funnel graphic */}
      <div className="relative h-[120px] w-full px-2">
        <svg width="100%" height="100%" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" className="overflow-visible">
          <defs>
            <linearGradient id="funnel-grad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="rgba(255,255,255,0.08)" />
              <stop offset="100%" stopColor="rgba(255,255,255,0.03)" />
            </linearGradient>
          </defs>

          {data.map((stage, idx) => {
            const maxVal = data[0]?.value || 1;
            const pctStart = (stage.value / maxVal) * 100;
            
            const nextStage = data[idx + 1];
            const pctEnd = nextStage ? (nextStage.value / maxVal) * 100 : pctStart * 0.7;

            const x_start = idx * w;
            const x_end = (idx + 1) * w;

            const h_start = (pctStart / 100) * 80;
            const y_top_start = 60 - h_start / 2;
            const y_bottom_start = 60 + h_start / 2;

            const h_end = (pctEnd / 100) * 80;
            const y_top_end = 60 - h_end / 2;
            const y_bottom_end = 60 + h_end / 2;

            const pathData = edges === "curved"
              ? `M ${x_start} ${y_top_start} 
                 C ${x_start + w/2} ${y_top_start}, ${x_end - w/2} ${y_top_end}, ${x_end} ${y_top_end}
                 L ${x_end} ${y_bottom_end}
                 C ${x_end - w/2} ${y_bottom_end}, ${x_start + w/2} ${y_bottom_start}, ${x_start} ${y_bottom_start}
                 Z`
              : `M ${x_start} ${y_top_start} L ${x_end} ${y_top_end} L ${x_end} ${y_bottom_end} L ${x_start} ${y_bottom_start} Z`;

            return (
              <g key={idx} className="group transition-all duration-300">
                {/* Layer 3 (Outer Halo Outline) */}
                {layers >= 3 && (
                  <path
                    d={pathData}
                    fill="none"
                    stroke="rgba(255,255,255,0.02)"
                    strokeWidth="4"
                  />
                )}

                {/* Layer 2 (Middle Outline) */}
                {layers >= 2 && (
                  <path
                    d={pathData}
                    fill="none"
                    stroke="rgba(255,255,255,0.04)"
                    strokeWidth="2"
                  />
                )}

                {/* Layer 1 (Main Filled Path) */}
                <path
                  d={pathData}
                  fill="url(#funnel-grad)"
                  stroke="rgba(255,255,255,0.08)"
                  strokeWidth="1"
                />

                {/* Vertical separator line between segments */}
                {idx < N - 1 && (
                  <line
                    x1={x_end}
                    y1={y_top_end - 4}
                    x2={x_end}
                    y2={y_bottom_end + 4}
                    stroke="rgba(255,255,255,0.15)"
                    strokeWidth="1.5"
                  />
                )}

                {/* Percentage Badge pill overlay */}
                <foreignObject
                  x={x_start + w/2 - 20}
                  y={60 - 9}
                  width="40"
                  height="18"
                >
                  <div className="flex items-center justify-center w-full h-full">
                    <span className="px-2 py-0.5 bg-white text-black font-bold text-[9px] rounded-full shadow-md select-none">
                      {Math.round(pctStart)}%
                    </span>
                  </div>
                </foreignObject>
              </g>
            );
          })}
        </svg>
      </div>

      {/* Labels row */}
      <div className="flex justify-between px-2 w-full">
        {data.map((stage, idx) => (
          <div key={idx} className="flex-1 text-center text-muted-foreground text-[10px] font-semibold">
            {stage.label}
          </div>
        ))}
      </div>
    </div>
  );
}

// ==========================================
// GAUGE COMPONENT (FROM SPEC)
// ==========================================
interface GaugeProps {
  orientation?: "arc" | "linear";
  value: number;
  centerValue?: number;
  totalNotches?: number;
  spacing?: number;
  notchCornerRadius?: number;
  inactiveFillOpacity?: number;
  defaultLabel?: string;
  formatOptions?: any;
}

export function Gauge({ 
  orientation = "arc", 
  value, 
  centerValue, 
  totalNotches = 40, 
  spacing = 25, 
  notchCornerRadius = 2,
  inactiveFillOpacity = 0.4,
  defaultLabel = "Total"
}: GaugeProps) {
  if (orientation === "linear") {
    return (
      <div className="w-full space-y-2">
        <div className="flex justify-between items-baseline text-xs">
          <span className="text-muted-foreground font-medium text-[10px] uppercase tracking-wider">{defaultLabel}</span>
          {centerValue !== undefined && <span className="font-bold text-white">{centerValue.toLocaleString()}</span>}
        </div>
        <div className="h-4 flex gap-0.5 w-full items-center">
          {[...Array(totalNotches)].map((_, idx) => {
            const activeThreshold = (idx / totalNotches) * 100;
            const isActive = value >= activeThreshold;
            return (
              <div 
                key={idx}
                className="h-full flex-1 transition-all duration-300"
                style={{
                  backgroundColor: isActive ? "var(--chart-1, #ffffff)" : "var(--border, #202025)",
                  opacity: isActive ? 1 : inactiveFillOpacity,
                  borderRadius: `${notchCornerRadius}px`
                }}
              />
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center p-2 relative">
      <div className="relative w-28 h-28 flex items-center justify-center">
        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
          <circle
            cx="50"
            cy="50"
            r="40"
            fill="transparent"
            stroke="var(--border, #202025)"
            strokeWidth="8"
            strokeDasharray="188.4"
            strokeDashoffset="62.8"
            className="opacity-20"
            strokeLinecap="round"
          />
          <circle
            cx="50"
            cy="50"
            r="40"
            fill="transparent"
            stroke="var(--chart-1, #ffffff)"
            strokeWidth="8"
            strokeDasharray="188.4"
            strokeDashoffset={188.4 - (188.4 - 62.8) * (value / 100)}
            strokeLinecap="round"
            className="transition-all duration-500"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <span className="text-lg font-bold text-white">{centerValue !== undefined ? centerValue.toLocaleString() : `${value}%`}</span>
          <span className="text-[9px] text-muted-foreground uppercase tracking-wider">{defaultLabel}</span>
        </div>
      </div>
    </div>
  );
}

// ==========================================
// PIE CHART COMPONENTS (FROM SPEC)
// ==========================================
interface PieData {
  label: string;
  value: number;
  color: string;
}

interface PieChartProps {
  data: PieData[];
  size?: number;
  innerRadius?: number;
  children?: React.ReactNode;
}

export function PieChart({ data, size = 180, innerRadius = 0, children }: PieChartProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const childrenWithProps = React.Children.map(children, (child) => {
    if (React.isValidElement(child)) {
      return React.cloneElement(child, {
        hoveredIndex,
        setHoveredIndex,
      } as any);
    }
    return child;
  });

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox="0 0 100 100" className="rotate-[-90deg]">
        <defs>
          {/* Diagonal hatching */}
          <pattern id="diagonalHatch" width="3" height="3" patternTransform="rotate(45 0 0)" patternUnits="userSpaceOnUse">
            <line x1="0" y1="0" x2="0" y2="3" stroke="#ffffff" strokeWidth="0.8" />
          </pattern>
          {/* Horizontal hatching */}
          <pattern id="horizontalHatch" width="3" height="3" patternUnits="userSpaceOnUse">
            <line x1="0" y1="0" x2="3" y2="0" stroke="#a3a3a3" strokeWidth="0.8" />
          </pattern>
          {/* Vertical hatching */}
          <pattern id="verticalHatch" width="3" height="3" patternUnits="userSpaceOnUse">
            <line x1="0" y1="0" x2="0" y2="3" stroke="#737373" strokeWidth="0.8" />
          </pattern>
          {/* Grid hatching */}
          <pattern id="gridHatch" width="3" height="3" patternUnits="userSpaceOnUse">
            <rect width="3" height="3" fill="none" stroke="#525252" strokeWidth="0.6" />
          </pattern>
        </defs>
        {childrenWithProps}
      </svg>
    </div>
  );
}

interface PieSliceProps {
  index: number;
  data: PieData[];
  innerRadius?: number;
  hoveredIndex?: number | null;
  setHoveredIndex?: (index: number | null) => void;
}

export function PieSlice({ index, data, innerRadius = 30, hoveredIndex, setHoveredIndex }: PieSliceProps) {
  const item = data[index];
  if (!item) return null;

  const total = data.reduce((sum, d) => sum + d.value, 0);
  let accumulated = 0;
  for (let i = 0; i < index; i++) {
    accumulated += data[i].value;
  }

  const startPercent = accumulated / total;
  const endPercent = (accumulated + item.value) / total;

  const startAngle = startPercent * 2 * Math.PI;
  let endAngle = endPercent * 2 * Math.PI;
  if (endAngle - startAngle >= 2 * Math.PI * 0.999) {
    endAngle = startAngle + 2 * Math.PI * 0.999;
  }

  const getCoordinates = (angle: number, radius: number) => {
    return {
      x: 50 + radius * Math.cos(angle),
      y: 50 + radius * Math.sin(angle)
    };
  };

  const outerRadius = 45;
  const p1 = getCoordinates(startAngle, outerRadius);
  const p2 = getCoordinates(endAngle, outerRadius);
  const p3 = getCoordinates(endAngle, innerRadius);
  const p4 = getCoordinates(startAngle, innerRadius);

  const largeArcFlag = endAngle - startAngle > Math.PI ? 1 : 0;

  const pathData = [
    `M ${p1.x} ${p1.y}`,
    `A ${outerRadius} ${outerRadius} 0 ${largeArcFlag} 1 ${p2.x} ${p2.y}`,
    `L ${p3.x} ${p3.y}`,
    `A ${innerRadius} ${innerRadius} 0 ${largeArcFlag} 0 ${p4.x} ${p4.y}`,
    "Z"
  ].join(" ");

  const isAnyHovered = hoveredIndex !== null && hoveredIndex !== undefined;
  const isSelfHovered = hoveredIndex === index;
  const opacity = isAnyHovered ? (isSelfHovered ? 1.0 : 0.35) : 1.0;

  return (
    <path
      d={pathData}
      fill={item.color}
      className="transition-all duration-300 ease-out hover:scale-[1.06] cursor-pointer"
      style={{ 
        transformOrigin: "50px 50px",
        opacity: opacity
      }}
      onMouseEnter={() => setHoveredIndex?.(index)}
      onMouseLeave={() => setHoveredIndex?.(null)}
    />
  );
}

export function PieCenter({ defaultLabel, value }: { defaultLabel: string; value: string | number }) {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
      <span className="text-base font-bold text-white">{value}</span>
      <span className="text-[9px] text-muted-foreground uppercase">{defaultLabel}</span>
    </div>
  );
}

const CornerBrackets = () => (
  <>
    <div className="absolute w-1.5 h-1.5 border-t border-l border-neutral-500 pointer-events-none" style={{ top: "-1px", left: "-1px" }} />
    <div className="absolute w-1.5 h-1.5 border-t border-r border-neutral-500 pointer-events-none" style={{ top: "-1px", right: "-1px" }} />
    <div className="absolute w-1.5 h-1.5 border-b border-l border-neutral-500 pointer-events-none" style={{ bottom: "-1px", left: "-1px" }} />
    <div className="absolute w-1.5 h-1.5 border-b border-r border-neutral-500 pointer-events-none" style={{ bottom: "-1px", right: "-1px" }} />
  </>
);

export const Route = createFileRoute("/dashboard")({
  component: Dashboard,
  head: () => ({
    meta: [
      { title: "Workspace Overview — RetainGraph" },
      { name: "description", content: "Interactive analytics dashboard for RetainGraph" },
    ],
  }),
});

// Mock data for main sales stacked bar chart
const salesData = [
  { day: "Jul 1", New: 6, Existing: 8 },
  { day: "Jul 2", New: 7, Existing: 7 },
  { day: "Jul 3", New: 5, Existing: 9 },
  { day: "Jul 4", New: 8, Existing: 6 },
  { day: "Jul 5", New: 4, Existing: 8 },
  { day: "Jul 6", New: 7, Existing: 5 },
  { day: "Jul 7", New: 8, Existing: 7 },
  { day: "Jul 8", New: 6, Existing: 9 },
  { day: "Jul 9", New: 9, Existing: 6 },
  { day: "Jul 10", New: 5, Existing: 8 },
  { day: "Jul 11", New: 7, Existing: 7 },
  { day: "Jul 12", New: 6, Existing: 8 },
  { day: "Jul 13", New: 8, Existing: 5 },
  { day: "Jul 14", New: 7, Existing: 9 },
];

// Mock data for campaign bar chart
const campaignData = [
  { name: "Jan", val: 50 },
  { name: "Feb", val: 65 },
  { name: "Mar", val: 40 },
  { name: "Apr", val: 55 },
  { name: "May", val: 75 },
  { name: "Jun", val: 60 },
  { name: "Jul", val: 45 },
  { name: "Aug", val: 92.5, highlight: true },
  { name: "Sep", val: 70 },
  { name: "Oct", val: 50 },
  { name: "Nov", val: 60 },
  { name: "Dec", val: 45 },
];

// Custom custom segmented bar shape to match the segmented tick mockup
const SegmentedBar = (props: any) => {
  const { x, y, width, height, fill } = props;
  if (!width || !height) return null;
  const segments = Math.max(1, Math.floor(height / 6));
  const segmentList = [];
  for (let i = 0; i < segments; i++) {
    segmentList.push(
      <rect
        key={i}
        x={x}
        y={y + height - (i + 1) * 6}
        width={width}
        height={4}
        fill={fill}
        rx={1}
      />
    );
  }
  return <g>{segmentList}</g>;
};

interface CopilotMessage {
  sender: string;
  text: string;
  confidence?: string;
  reasoning?: string;
  citations?: string[];
  graphNodes?: string[];
  linkedTimelines?: string[];
}

function Dashboard() {
  const [activeTab, setActiveTab] = useState("1M");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [activeView, setActiveView] = useState<"Overview" | "Accounts" | "Detail" | "Copilot" | "Graph" | "Insights" | "Analytics" | "Briefs" | "Settings" | "Notifications">("Overview");
  const [selectedCompany, setSelectedCompany] = useState("Acme Corp");

  // State for AI Copilot Chat
  const [copilotInput, setCopilotInput] = useState("");
  const [copilotMessages, setCopilotMessages] = useState<CopilotMessage[]>([
    {
      sender: "ai",
      text: "I am RetainGraph's cognitive copilot. Ask me anything about this customer's graph, sentiment trends, or support interactions."
    }
  ]);
  const [comparisonMode, setComparisonMode] = useState(false);

  // State for Knowledge Graph Filters
  const [graphFilterType, setGraphFilterType] = useState("all");
  const [graphSearchQuery, setGraphSearchQuery] = useState("");

  // State for Accounts Filters
  const [accountSearch, setAccountSearch] = useState("");
  const [healthFilter, setHealthFilter] = useState("all");

  // State for Settings Config
  const [groqKey, setGroqKey] = useState("gsk_yA98...3x9K");
  const [cogneeConfig, setCogneeConfig] = useState("VectorDB + Neo4j");

  // API Integrated States
  const [loading, setLoading] = useState(false);
  const [overviewData, setOverviewData] = useState<any>(null);
  const [realAccounts, setRealAccounts] = useState<any[]>([]);
  const [activeBrief, setActiveBrief] = useState<any>(null);
  const [isBriefLoading, setIsBriefLoading] = useState(false);
  const [selectedTenantId, setSelectedTenantId] = useState("demo-tenant-123");
  const [selectedAccountDetails, setSelectedAccountDetails] = useState<any>(null);
  const [graphData, setGraphData] = useState<any>(null);
  const [simulationNodes, setSimulationNodes] = useState<any[]>([]);
  const [simulationLinks, setSimulationLinks] = useState<any[]>([]);
  const [selectedNode, setSelectedNode] = useState<any>(null);
  const [zoomScale, setZoomScale] = useState(1);
  const [zoomTranslation, setZoomTranslation] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });

  // Seeding correction modal state
  const [showCorrectionModal, setShowCorrectionModal] = useState(false);
  const [correctionTargetId, setCorrectionTargetId] = useState("");
  const [correctionReasonInput, setCorrectionReasonInput] = useState("");
  const [insights, setInsights] = useState<any[]>([]);

  // Developer Playground Handlers
  const [ingestInput, setIngestInput] = useState("");
  const [playgroundLogs, setPlaygroundLogs] = useState<string[]>([]);

  const handleIngestPlayground = async () => {
    if (!ingestInput.trim()) return;
    try {
      const res = await fetch(`http://localhost:3000/api/interactions/ingest`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "x-api-key": "demo-key-456",
          "x-tenant-id": "demo-tenant-123"
        },
        body: JSON.stringify({ payload: ingestInput })
      });
      if (res.ok) {
        const data = await res.json();
        setPlaygroundLogs(prev => [`[Ingest Success] ID: ${data.interaction?.id || "Success"}`, ...prev]);
        setIngestInput("");
      } else {
        setPlaygroundLogs(prev => [`[Ingest Error] Status: ${res.status}`, ...prev]);
      }
    } catch (e) {
      setPlaygroundLogs(prev => [`[Ingest Connection Failed]`, ...prev]);
    }
  };

  const handleTriggerHealthAudit = async () => {
    try {
      const res = await fetch(`http://localhost:3000/api/v1/accounts/${selectedTenantId}/health`);
      if (res.ok) {
        const data = await res.json();
        setPlaygroundLogs(prev => [`[Audit Success] Calculated Churn Risk: ${data.riskScore}`, ...prev]);
        const ovRes = await fetch(`http://localhost:3000/api/v1/dashboard/overview?tenantId=${selectedTenantId}`);
        if (ovRes.ok) {
          setOverviewData(await ovRes.json());
        }
        const insRes = await fetch(`http://localhost:3000/api/v1/insights`);
        if (insRes.ok) {
          setInsights(await insRes.json());
        }
      } else {
        setPlaygroundLogs(prev => [`[Audit Error] Status: ${res.status}`, ...prev]);
      }
    } catch (e) {
      setPlaygroundLogs(prev => [`[Audit Connection Failed]`, ...prev]);
    }
  };

  const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:3000/api/v1";

  // Fetch Overview and Accounts list
  useEffect(() => {
    async function loadInitialData() {
      setLoading(true);
      try {
        const ovRes = await fetch(`${API_BASE}/dashboard/overview?tenantId=${selectedTenantId}`);
        if (ovRes.ok) {
          const data = await ovRes.json();
          setOverviewData(data);
        }
        
        const accRes = await fetch(`${API_BASE}/accounts`);
        if (accRes.ok) {
          const list = await accRes.json();
          setRealAccounts(list.map((a: any) => ({
            id: a.id,
            name: a.company || a.id,
            logo: a.logo || "AC",
            owner: a.owner || "Unassigned",
            health: a.healthScore ?? 50,
            risk: a.risk === "HIGH" ? "Critical" : a.risk === "MEDIUM" ? "Needs Attention" : "Low",
            arr: typeof a.arr === "number" ? `$${a.arr.toLocaleString()}` : (a.arr || "$120,000"),
            renewal: a.renewalDate || "Oct 12, 2026",
            lastInt: a.lastInteraction ? new Date(a.lastInteraction).toLocaleDateString() : "Recent",
            tickets: a.activeInsights || 0,
            insights: a.activeInsights || 0,
            graphStatus: "Synced",
            rawAccount: a
          })));
        }
        const insRes = await fetch(`${API_BASE}/insights`);
        if (insRes.ok) {
          setInsights(await insRes.json());
        }
      } catch (e) {
        console.error("Failed to load backend dashboard API data:", e);
      } finally {
        setLoading(false);
      }
    }
    loadInitialData();
  }, [activeView, selectedTenantId]);

  // Fetch details for the selected tenant
  useEffect(() => {
    async function loadDetails() {
      if (activeView !== "Detail" || !selectedTenantId) return;
      try {
        const res = await fetch(`${API_BASE}/accounts/${selectedTenantId}`);
        if (res.ok) {
          const data = await res.json();
          setSelectedAccountDetails(data);
        }
      } catch (e) {
        console.error("Failed to fetch account details:", e);
      }
    }
    loadDetails();
  }, [selectedTenantId, activeView, API_BASE]);

  // Fetch graph data for the selected tenant
  useEffect(() => {
    async function loadGraph() {
      if ((activeView !== "Graph" && activeView !== "Copilot") || !selectedTenantId) return;
      try {
        const res = await fetch(`${API_BASE}/accounts/${selectedTenantId}/graph`);
        if (res.ok) {
          const data = await res.json();
          setGraphData(data);
          // Auto-select the first node (customer node) initially
          if (data && data.nodes && data.nodes.length > 0) {
            setSelectedNode(data.nodes[0]);
          }
        }
      } catch (e) {
        console.error("Failed to fetch graph data:", e);
      }
    }
    loadGraph();
  }, [selectedTenantId, activeView, API_BASE]);

  // Fetch pre-call briefing data
  useEffect(() => {
    async function loadBrief() {
      if (activeView !== "Briefs" || !selectedTenantId) return;
      console.log("[Dashboard] Loading brief for tenant ID:", selectedTenantId);
      setActiveBrief(null); // Clear stale brief
      try {
        const res = await fetch(`${API_BASE}/accounts/${selectedTenantId}/brief`);
        if (res.ok) {
          const data = await res.json();
          console.log("[Dashboard] Loaded brief details:", data);
          setActiveBrief(data);
        } else {
          console.error("[Dashboard] Failed to load brief. Status:", res.status);
        }
      } catch (e) {
        console.error("Failed to fetch pre-call brief:", e);
      }
    }
    loadBrief();
  }, [selectedTenantId, activeView, API_BASE]);
  // Reset Copilot chat history on tenant switch
  useEffect(() => {
    const activeName = realAccounts.find(a => a.id === selectedTenantId)?.name || selectedCompany;
    setCopilotMessages([
      {
        sender: "ai",
        text: `I am RetainGraph's cognitive copilot. Ask me anything about ${activeName}'s graph database relationships, sentiment history, or active churn warning alerts.`
      }
    ]);
  }, [selectedTenantId, realAccounts]);
  const simulationRef = React.useRef<any>(null);
  const [draggedNode, setDraggedNode] = useState<any>(null);

  // Run D3 force simulation when graphData, filters, or search updates
  useEffect(() => {
    if (!graphData || !graphData.nodes || graphData.nodes.length === 0) {
      setSimulationNodes([]);
      setSimulationLinks([]);
      return;
    }

    let nodes = graphData.nodes.map((n: any) => ({ ...n }));
    
    if (graphFilterType !== "all") {
      nodes = nodes.filter((n: any) => {
        const typeLower = (n.type || "").toLowerCase();
        const labelLower = (n.label || "").toLowerCase();

        if (graphFilterType === "Customer") {
          return typeLower === "customer" || 
                 labelLower === selectedCompany.toLowerCase() ||
                 labelLower.includes("corp") || 
                 labelLower.includes("company") || 
                 labelLower.includes("client");
        }
        if (graphFilterType === "Competitor") {
          return typeLower.includes("competit") || 
                 labelLower === "relategraph" ||
                 labelLower.includes("competitor");
        }
        if (graphFilterType === "Ticket") {
          return typeLower.includes("ticket") || 
                 typeLower.includes("support") || 
                 typeLower.includes("issue") || 
                 labelLower.includes("ticket") || 
                 labelLower.includes("issue") ||
                 labelLower.includes("bug") ||
                 labelLower.includes("timeout") ||
                 labelLower.includes("latency") ||
                 labelLower.includes("crash");
        }
        return true;
      });
    }

    if (graphSearchQuery.trim()) {
      const q = graphSearchQuery.toLowerCase();
      nodes = nodes.filter((n: any) => n.label.toLowerCase().includes(q) || (n.type && n.type.toLowerCase().includes(q)));
    }

    const nodeIds = new Set(nodes.map((n: any) => n.id));
    const links = graphData.edges
      .filter((e: any) => nodeIds.has(e.source) && nodeIds.has(e.target))
      .map((e: any) => ({
        ...e,
        source: e.source,
        target: e.target
      }));

    const width = 800;
    const height = 500;

    if (nodes.length > 0) {
      nodes[0].fx = width / 2;
      nodes[0].fy = height / 2;
    }

    const simulation = d3.forceSimulation(nodes)
      .force("link", d3.forceLink(links).id((d: any) => d.id).distance(130))
      .force("charge", d3.forceManyBody().strength(-350))
      .force("center", d3.forceCenter(width / 2, height / 2))
      .force("x", d3.forceX(width / 2).strength(0.08))
      .force("y", d3.forceY(height / 2).strength(0.08))
      .force("collision", d3.forceCollide().radius(45));

    simulationRef.current = simulation;

    simulation.on("tick", () => {
      setSimulationNodes([...nodes]);
      setSimulationLinks([...links]);
    });

    return () => {
      simulation.stop();
    };
  }, [graphData, graphFilterType, graphSearchQuery]);

  // Fetch Pre-call Brief on demand
  const handleGenerateBrief = async (tenantId: string) => {
    setIsBriefLoading(true);
    try {
      const briefRes = await fetch(`${API_BASE}/accounts/${tenantId}/brief`, {
        method: "POST"
      });
      if (briefRes.ok) {
        const data = await briefRes.json();
        setActiveBrief(data);
        setActiveView("Briefs");
      }
    } catch (e) {
      console.error("Failed to generate meeting brief:", e);
    } finally {
      setIsBriefLoading(false);
    }
  };

  // Copilot Grounded Chat Query handler
  const handleSendCopilotQuery = async (queryText: string) => {
    if (!queryText.trim()) return;
    const userMsg = { sender: "user", text: queryText };
    setCopilotMessages(prev => [...prev, userMsg]);
    setCopilotInput("");

    try {
      const response = await fetch(`${API_BASE}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: queryText, tenantId: "demo-tenant-123" })
      });
      if (response.ok) {
        const answer = await response.json();
        setCopilotMessages(prev => [
          ...prev,
          {
            sender: "ai",
            text: answer.answer,
            confidence: "85%",
            reasoning: "Traversed Cognee semantic memory graph and correlated recent support transcripts.",
            citations: answer.citations?.map((c: any) => `${c.source}: ${c.excerpt.substring(0, 40)}...`) || [],
            graphNodes: answer.graphEntities || []
          }
        ]);
      }
    } catch (e) {
      console.error("Copilot RAG error:", e);
    }
  };

  // Dismiss / Correction submission
  const handleSubmitCorrection = async () => {
    if (!correctionReasonInput.trim()) return;
    setShowCorrectionModal(false);
    const reason = correctionReasonInput;
    setCorrectionReasonInput("");
    try {
      const res = await fetch(`${API_BASE}/health/${correctionTargetId}/correct`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ correctionReason: reason })
      });
      // Reload dashboard overview
      const ovRes = await fetch(`${API_BASE}/dashboard/overview?tenantId=demo-tenant-123`);
      if (ovRes.ok) {
        setOverviewData(await ovRes.json());
      }
    } catch (e) {
      console.error("Failed to log procedural memory correction:", e);
    }
  };

  const accountsData = realAccounts.length > 0 ? realAccounts : [
    { name: "Acme Corp", logo: "AC", owner: "Sarah Jenkins", health: 32, risk: "Critical", arr: "$145,000", renewal: "Oct 12, 2026", lastInt: "2 hours ago", tickets: 9, insights: 4, graphStatus: "Synced" },
    { name: "Globex Inc", logo: "GL", owner: "Alex Rivera", health: 78, risk: "Low", arr: "$98,000", renewal: "Dec 05, 2026", lastInt: "1 day ago", tickets: 2, insights: 1, graphStatus: "Synced" },
    { name: "Initech Corp", logo: "IN", owner: "Sarah Jenkins", health: 54, risk: "Needs Attention", arr: "$120,000", renewal: "Feb 18, 2027", lastInt: "3 days ago", tickets: 5, insights: 2, graphStatus: "Syncing" },
    { name: "Umbrella Corp", logo: "UM", owner: "Marcus Chen", health: 88, risk: "Low", arr: "$310,000", renewal: "Nov 22, 2026", lastInt: "4 hours ago", tickets: 1, insights: 0, graphStatus: "Synced" },
    { name: "Soylent Corp", logo: "SO", owner: "Alex Rivera", health: 45, risk: "Needs Attention", arr: "$85,000", renewal: "Jan 15, 2027", lastInt: "1 week ago", tickets: 6, insights: 3, graphStatus: "Synced" },
    { name: "Hooli", logo: "HO", owner: "Marcus Chen", health: 95, risk: "Low", arr: "$420,000", renewal: "Mar 30, 2027", lastInt: "30 mins ago", tickets: 0, insights: 0, graphStatus: "Synced" },
  ];

  const handleSendMessage = () => {
    if (!copilotInput.trim()) return;
    const newMsgs = [...copilotMessages, { sender: "user", text: copilotInput }];
    setCopilotMessages(newMsgs);
    setCopilotInput("");
    setTimeout(() => {
      setCopilotMessages([
        ...newMsgs,
        {
          sender: "ai",
          text: `Here is the AI search result for "${copilotInput}". RetainGraph has retrieved relevant customer signals and mapped them to the AI Knowledge Graph for full customer context.`,
          confidence: "91%",
          reasoning: "Retrieved nodes connected to the user request query via hybrid cognitive search.",
          citations: ["CS Sync Notes - June 2026", "Customer health database record"],
          graphNodes: ["Customer Entity", "Support Entity"]
        }
      ]);
    }, 1000);
  };

  return (
    <div className="flex min-h-screen bg-[#070708] text-foreground font-sans antialiased">
      {/* SIDEBAR */}
      <aside className={`flex flex-col justify-between py-4 ${
        sidebarCollapsed ? "w-16 px-2" : "w-60 px-4"
      } border-r border-[#1a1a1f] bg-[#070708] shrink-0 h-screen sticky top-0 transition-all duration-300 z-40`}>
        <div className="space-y-3.5">
          {/* Logo element */}
          <div className={`flex items-center ${sidebarCollapsed ? "justify-center" : "gap-2.5 px-3"} py-1`}>
            <div className="w-6 h-6 rounded bg-primary/10 flex items-center justify-center text-primary shrink-0">
              <span className="font-display font-black text-sm tracking-tighter">RG</span>
            </div>
            {!sidebarCollapsed && (
              <span className="font-display font-bold text-sm tracking-tight text-white transition-opacity duration-300">
                RetainGraph
              </span>
            )}
          </div>

          <hr className="border-[#1a1a1f]" />

          {/* Navigation group 1: Core Portal */}
          <div className="space-y-0.5">
            {[
              { icon: LayoutDashboard, label: "Overview", view: "Overview" },
              { icon: Folder, label: "Accounts", view: "Accounts" },
              { icon: Sparkles, label: "AI Copilot", view: "Copilot" },
              { icon: Network, label: "Knowledge Graph", view: "Graph" },
            ].map((item, idx) => (
              <button
                key={idx}
                onClick={() => setActiveView(item.view as any)}
                title={sidebarCollapsed ? item.label : undefined}
                className={`w-full flex items-center ${
                  sidebarCollapsed ? "justify-center px-0 py-1.5" : "gap-3 px-3 py-1.5"
                } text-sm font-semibold rounded-lg transition-colors hover:bg-secondary/40 ${
                  activeView === item.view ? "text-white bg-secondary/30" : "text-muted-foreground"
                }`}
              >
                <item.icon className="w-[18px] h-[18px] shrink-0" />
                {!sidebarCollapsed && <span>{item.label}</span>}
              </button>
            ))}
          </div>

          {/* Navigation group 2: CS Insights */}
          <div className="space-y-0.5">
            {[
              { icon: ShieldAlert, label: "Insights", view: "Insights" },
              { icon: FileText, label: "Pre-Call Briefs", view: "Briefs" },
              { icon: LineIcon, label: "Analytics", view: "Analytics" },
            ].map((item, idx) => (
              <button
                key={idx}
                onClick={() => setActiveView(item.view as any)}
                title={sidebarCollapsed ? item.label : undefined}
                className={`w-full flex items-center ${
                  sidebarCollapsed ? "justify-center px-0 py-1.5" : "gap-3 px-3 py-1.5"
                } text-sm font-semibold rounded-lg transition-colors hover:bg-secondary/40 ${
                  activeView === item.view ? "text-white bg-secondary/30" : "text-muted-foreground"
                }`}
              >
                <item.icon className="w-[18px] h-[18px] shrink-0" />
                {!sidebarCollapsed && <span>{item.label}</span>}
              </button>
            ))}
          </div>
        </div>

        {/* Footer & Toggle Group */}
        <div className="space-y-0.5 pt-4 border-t border-[#1a1a1f]">
          {[
            { icon: Bell, label: "Notifications", view: "Notifications" },
            { icon: Settings, label: "Settings", view: "Settings" },
          ].map((item, idx) => (
            <button
              key={idx}
              onClick={() => setActiveView(item.view as any)}
              title={sidebarCollapsed ? item.label : undefined}
              className={`w-full flex items-center ${
                sidebarCollapsed ? "justify-center px-0 py-1.5" : "gap-3 px-3 py-1.5"
              } text-sm font-semibold rounded-lg transition-colors hover:bg-secondary/40 ${
                activeView === item.view ? "text-white bg-secondary/30" : "text-muted-foreground"
              }`}
            >
              <item.icon className="w-[18px] h-[18px] shrink-0" />
              {!sidebarCollapsed && <span>{item.label}</span>}
            </button>
          ))}

          {/* Toggle Expand/Collapse Sidebar button */}
          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            title={sidebarCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
            className={`w-full flex items-center ${
              sidebarCollapsed ? "justify-center px-0 py-1.5" : "gap-3 px-3 py-1.5"
            } text-sm font-semibold rounded-lg transition-colors text-muted-foreground hover:bg-secondary/40 hover:text-white mt-1`}
          >
            {sidebarCollapsed ? (
              <ChevronRight className="w-[18px] h-[18px] shrink-0" />
            ) : (
              <>
                <ChevronLeft className="w-[18px] h-[18px] shrink-0" />
                <span>Collapse</span>
              </>
            )}
          </button>
        </div>
      </aside>

      {/* MAIN CONTAINER */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* TOP BAR */}
        <header className="h-14 border-b border-[#1a1a1f] flex items-center justify-between px-8 bg-[#070708]/80 backdrop-blur-md sticky top-0 z-30 shrink-0">
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span className="font-semibold text-white tracking-wide">{activeView}</span>
            {realAccounts.length > 0 && (
              <select
                value={selectedTenantId}
                onChange={(e) => {
                  const val = e.target.value;
                  setSelectedTenantId(val);
                  setSelectedCompany(realAccounts.find(a => a.id === val)?.name || val);
                }}
                className="bg-[#121216]/50 border border-[#1a1a1f] text-xs text-white rounded px-2.5 py-1 outline-none focus:border-primary/50 font-semibold"
              >
                {realAccounts.map((acc) => (
                  <option key={acc.id} value={acc.id}>
                    {acc.name}
                  </option>
                ))}
              </select>
            )}
          </div>

          <div className="flex items-center gap-4">
            {/* Search Input Box */}
            <div className="relative w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Global Search (Stakeholders, Insights, Nodes)..."
                className="w-full bg-secondary/20 border border-[#1a1a1f] rounded-lg pl-9 pr-8 py-1.5 text-xs outline-none focus:border-primary/50 text-foreground"
              />
              <span className="absolute right-2 top-1/2 -translate-y-1/2 px-1 py-0.5 bg-secondary/50 rounded text-[9px] text-muted-foreground font-mono">
                ⌘ K
              </span>
            </div>

            <button onClick={() => setActiveView("Notifications")} className="p-2 text-muted-foreground hover:text-foreground relative">
              <Bell className="w-4 h-4" />
              <span className="absolute top-1 right-1 w-1.5 h-1.5 bg-destructive rounded-full" />
            </button>

            <button onClick={() => setActiveView("Settings")} className="p-2 text-muted-foreground hover:text-foreground">
              <Settings className="w-4 h-4" />
            </button>

            <Avatar className="w-7 h-7">
              <AvatarImage src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80&fit=crop&q=80" />
              <AvatarFallback>SB</AvatarFallback>
            </Avatar>
          </div>
        </header>

        {/* VIEW AREA */}
        <div className="flex-1 overflow-y-auto">
          {activeView === "Overview" && (
            <div className="px-8 py-8 space-y-6">
              {/* WELCOME SECTION */}
              <div className="flex justify-between items-center">
                <div>
                  <h1 className="text-2xl font-bold tracking-tight text-white">RetainGraph Health Dashboard</h1>
                  <p className="text-xs text-muted-foreground mt-0.5">Realtime AI churn detection & graph database synchronization</p>
                </div>
                <button 
                  onClick={() => setActiveView("Briefs")} 
                  className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-white text-black font-semibold rounded-lg text-xs hover:bg-neutral-200 transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" /> Generate Pre-Call Brief
                </button>
              </div>

              {/* KPI CARDS GRID */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {[
                  { 
                    title: "Total Customers", 
                    value: overviewData?.portfolio ? `${overviewData.portfolio.totalAccounts} Accounts` : "142 Accounts", 
                    pct: "12.4%", 
                    inc: true, 
                    desc: "vs prior 30 days" 
                  },
                  { 
                    title: "Healthy Accounts", 
                    value: overviewData?.portfolio ? `${overviewData.portfolio.healthyAccounts} Active` : "118 Active", 
                    pct: "3.2%", 
                    inc: true, 
                    desc: "vs prior 30 days" 
                  },
                  { 
                    title: "Accounts at Risk", 
                    value: overviewData?.portfolio ? `${overviewData.portfolio.criticalAccounts + overviewData.portfolio.warningAccounts} Flagged` : "8 Critical", 
                    pct: "40.0%", 
                    inc: false, 
                    desc: "vs prior 30 days" 
                  },
                  { 
                    title: "Knowledge Graph Nodes", 
                    value: overviewData?.statistics ? `${overviewData.statistics.graphNodes.toLocaleString()} Nodes` : "2,842 Nodes", 
                    pct: "18.2%", 
                    inc: true, 
                    desc: "since yesterday" 
                  },
                ].map((kpi, idx) => (
                  <div
                    key={idx}
                    className="bg-card/45 border border-[#1a1a1f] rounded-none p-5 flex justify-between items-end relative group hover:border-[#2b2b35] transition-all h-full"
                  >
                    <CornerBrackets />
                    <div className="space-y-2">
                      <div className="text-[11px] text-muted-foreground uppercase font-semibold tracking-wider">
                        {kpi.title}
                      </div>
                      <div className="text-xl font-bold tracking-tight text-white">{kpi.value}</div>
                      <div className="flex items-center gap-1.5 text-[11px]">
                        <span className={`flex items-center font-medium ${kpi.inc ? "text-emerald-500" : "text-rose-500"}`}>
                          {kpi.inc ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
                          {kpi.pct}
                        </span>
                        <span className="text-muted-foreground">{kpi.desc}</span>
                      </div>
                    </div>

                    {/* Micro Spark-bars indicator */}
                    <div className="flex items-end gap-0.5 h-10 pb-1">
                      {[20, 45, 30, 60, 40, 80, 50].map((h, i) => (
                        <div
                          key={i}
                          className="w-1 bg-[#1a1a1f] group-hover:bg-neutral-600 transition-colors"
                          style={{ height: `${h}%` }}
                        />
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              {/* MAIN CHARTS GRID */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Total Sales stack bar */}
                <div className="lg:col-span-2 bg-card/45 border border-[#1a1a1f] rounded-none p-6 flex flex-col justify-between relative">
                  <CornerBrackets />
                  <div className="flex justify-between items-start">
                    <div className="space-y-1">
                      <div className="text-2xl font-bold tracking-tight text-white">Portfolio Sentiment Health</div>
                      <div className="text-xs text-muted-foreground">Historical customer health score index</div>
                    </div>
                  </div>

                  <div className="h-[260px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <ReBarChart data={overviewData?.healthHistory || salesData} barGap={0} barCategoryGap="40%">
                        <ReXAxis dataKey="day" stroke="#454545" fontSize={10} tickLine={false} axisLine={false} interval="preserveStartEnd" dy={4} />
                        <ReYAxis stroke="#454545" fontSize={10} tickLine={false} axisLine={false} domain={[0, 100]} />
                        <Bar dataKey="Existing" stackId="a" fill="#303036" shape={<SegmentedBar />} />
                        <Bar dataKey="New" stackId="a" fill="#ffffff" shape={<SegmentedBar />} />
                      </ReBarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Campaign Revenue Bar */}
                <div className="bg-card/45 border border-[#1a1a1f] rounded-none p-6 flex flex-col justify-between relative">
                  <CornerBrackets />
                  <div className="flex justify-between items-start">
                    <div className="space-y-1">
                      <div className="text-2xl font-bold tracking-tight text-white">Copilot Activity</div>
                      <div className="text-xs text-muted-foreground">Cognitive graph queries processed</div>
                    </div>
                  </div>

                  <div className="h-[260px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <ReBarChart data={overviewData?.campaignData || campaignData} barSize={6}>
                        <ReXAxis dataKey="name" stroke="#454545" fontSize={10} tickLine={false} axisLine={false} />
                        <Bar dataKey="val">
                          {(overviewData?.campaignData || campaignData).map((entry: any, index: number) => (
                            <Cell key={`cell-${index}`} fill={entry.highlight ? "#ffffff" : "#202025"} />
                          ))}
                        </Bar>
                      </ReBarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>

              {/* MIDDLE ROW (FUNNEL & PIE CHART) */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Funnel Chart Panel */}
                <div className="bg-card/45 border border-[#1a1a1f] rounded-none p-6 flex flex-col justify-between relative">
                  <CornerBrackets />
                  <div className="flex justify-between items-start">
                    <div className="space-y-1">
                      <div className="text-2xl font-bold tracking-tight text-white">Portfolio Churn Funnel</div>
                      <div className="text-xs text-muted-foreground">Success milestones conversion over last 30 days</div>
                    </div>
                  </div>

                  <FunnelChart
                    data={[
                      { label: "Interactions Ingested", value: overviewData?.statistics ? overviewData.statistics.interactionsToday * 10 : 720, displayValue: overviewData?.statistics ? `${overviewData.statistics.interactionsToday * 10}` : "720" },
                      { label: "Knowledge Graph Nodes", value: overviewData?.statistics ? overviewData.statistics.graphNodes : 2842, displayValue: overviewData?.statistics ? `${overviewData.statistics.graphNodes}` : "2.8K" },
                      { label: "Extracted Entities", value: overviewData?.statistics ? overviewData.statistics.entitiesExtracted : 1136, displayValue: overviewData?.statistics ? `${overviewData.statistics.entitiesExtracted}` : "1.1K" },
                      { label: "Health Assessments", value: overviewData?.portfolio ? overviewData.portfolio.totalAccounts : 6, displayValue: overviewData?.portfolio ? `${overviewData.portfolio.totalAccounts}` : "6" },
                    ]}
                    layers={3}
                    edges="curved"
                  />
                </div>

                {/* Circular Pie Chart panel */}
                <div className="bg-card/45 border border-[#1a1a1f] rounded-none p-6 flex flex-col justify-between relative">
                  <CornerBrackets />
                  <div className="flex justify-between items-start">
                    <div className="space-y-1">
                      <div className="text-2xl font-bold tracking-tight text-white">
                        {overviewData?.statistics ? overviewData.statistics.interactionsToday * 4 : 242}
                      </div>
                      <div className="text-xs text-muted-foreground">Total Ingested Interactions</div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-5 gap-6 items-center">
                    {(() => {
                      const bd = overviewData?.statistics?.breakdown || { emails: 98, tickets: 72, meetings: 30, other: 42, total: 242 };
                      const totalInteractions = bd.total || 242;
                      const pieData = [
                        { label: "Email Syncs", value: bd.emails || 1, color: "url(#diagonalHatch)" },
                        { label: "Zendesk Tickets", value: bd.tickets || 1, color: "url(#horizontalHatch)" },
                        { label: "Slack Activity", value: bd.other || 1, color: "url(#verticalHatch)" },
                        { label: "Meeting Audits", value: bd.meetings || 1, color: "url(#gridHatch)" },
                      ];
                      
                      const getPct = (val: number) => {
                        return totalInteractions > 0 ? `${((val / totalInteractions) * 100).toFixed(1)}%` : "0.0%";
                      };

                      return (
                        <>
                          <div className="md:col-span-2 flex justify-center relative">
                            <PieChart data={pieData} size={160}>
                              {pieData.map((_, idx) => (
                                <PieSlice
                                  key={idx}
                                  index={idx}
                                  data={pieData}
                                  innerRadius={0}
                                />
                              ))}
                            </PieChart>
                          </div>

                          <div className="md:col-span-3 space-y-3.5 pr-2">
                            {[
                              { label: "Email Syncs", value: String(bd.emails), pct: getPct(bd.emails), color: "url(#diagonalHatch)", isPattern: true },
                              { label: "Zendesk Tickets", value: String(bd.tickets), pct: getPct(bd.tickets), color: "url(#horizontalHatch)", isPattern: true },
                              { label: "Slack Activity", value: String(bd.other), pct: getPct(bd.other), color: "url(#verticalHatch)", isPattern: true },
                              { label: "Meeting Audits", value: String(bd.meetings), pct: getPct(bd.meetings), color: "url(#gridHatch)", isPattern: true },
                            ].map((item, idx) => (
                              <div key={idx} className="flex items-center justify-between border-b border-[#121216] pb-2">
                                <div className="flex items-center gap-2">
                                  <span 
                                    className="w-3.5 h-3.5 border border-[#1a1a1f] shrink-0" 
                                    style={{ 
                                      background: item.color 
                                    }}
                                  />
                                  <span className="text-xs font-semibold text-white">{item.label}</span>
                                </div>
                                <div className="text-right flex items-center gap-4">
                                  <div className="text-xs text-muted-foreground">{item.pct}</div>
                                  <div className="text-xs font-bold text-white w-8 text-right">{item.value}</div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </>
                      );
                    })()}
                  </div>
                </div>
              </div>

              {/* BOTTOM ROW (TRAFFIC, TEAM, DENSITY HEATMAP, QUICK ACTIONS) */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {/* Traffic Sources */}
                <div className="bg-card/45 border border-[#1a1a1f] rounded-none p-5 flex flex-col justify-between relative">
                  <CornerBrackets />
                  <div className="text-xs text-muted-foreground font-semibold uppercase tracking-wider flex justify-between">
                    <span>Active CS Workload</span>
                    <span>Realtime</span>
                  </div>
                  <div className="space-y-3.5 pt-2">
                    {[
                      { label: "Active Alerts", val: `${overviewData?.portfolio ? (overviewData.portfolio.criticalAccounts + overviewData.portfolio.warningAccounts) : 8} events`, pct: overviewData?.portfolio ? Math.min(100, Math.round((overviewData.portfolio.criticalAccounts + overviewData.portfolio.warningAccounts) * 12.5)) : 75 },
                      { label: "Evaluated Tenants", val: `${overviewData?.portfolio?.totalAccounts || 6} accounts`, pct: overviewData?.portfolio ? Math.min(100, Math.round(overviewData.portfolio.totalAccounts * 15)) : 60 },
                      { label: "Graph Sync Status", val: overviewData?.workers?.ingestion?.status === "running" ? "Online" : "Syncing", pct: overviewData?.workers?.ingestion?.status === "running" ? 100 : 75 },
                    ].map((item, idx) => (
                      <div key={idx} className="space-y-1.5">
                        <div className="flex justify-between text-xs font-semibold">
                          <span className="text-white">{item.label}</span>
                          <span className="text-muted-foreground">{item.val}</span>
                        </div>
                        <div className="h-1 flex gap-0.5 w-full">
                          {[...Array(20)].map((_, i) => (
                            <div
                              key={i}
                              className={`h-full flex-1 rounded-sm ${
                                i < (item.pct / 5) ? "bg-white" : "bg-neutral-900"
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Team Members */}
                 <div className="bg-card/45 border border-[#1a1a1f] rounded-none p-5 flex flex-col justify-between items-center text-center relative">
                  <CornerBrackets />
                  <div className="text-xs text-muted-foreground font-semibold uppercase tracking-wider self-start">
                    Team Members
                  </div>

                  <div className="space-y-4 my-6">
                    <div className="flex items-center justify-center -space-x-3">
                      <Avatar className="w-10 h-10 border-2 border-[#070708]">
                        <AvatarImage src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80&fit=crop&q=80" />
                      </Avatar>
                      <Avatar className="w-10 h-10 border-2 border-[#070708]">
                        <AvatarImage src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&fit=crop&q=80" />
                      </Avatar>
                      <Avatar className="w-10 h-10 border-2 border-[#070708]">
                        <AvatarImage src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&fit=crop&q=80" />
                      </Avatar>
                    </div>

                    <div className="space-y-1">
                      <div className="text-sm font-semibold text-white">4 CS Managers</div>
                      <p className="text-[11px] text-muted-foreground max-w-[160px] mx-auto">
                        Managing {overviewData?.portfolio?.totalAccounts || 6} active tenants
                      </p>
                    </div>
                  </div>

                  <button className="inline-flex items-center gap-1.5 px-4 py-1.5 border border-[#1a1a1f] hover:bg-secondary/40 text-white rounded-lg text-xs transition-colors">
                    <UserPlus className="w-3.5 h-3.5" /> Invite Members
                  </button>
                </div>

                {/* Sales by Hour density Grid Heatmap */}
                <div className="bg-card/45 border border-[#1a1a1f] rounded-none p-5 flex flex-col justify-between relative">
                  <CornerBrackets />
                  <div className="flex justify-between items-center text-xs text-muted-foreground font-semibold uppercase tracking-wider">
                    <span>Log Sync Frequency</span>
                    <span>Last 7 days</span>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between items-baseline">
                      <span className="text-2xl font-bold tracking-tight text-white">124k</span>
                      <span className="text-xs font-semibold text-white">Sync logs/hr</span>
                    </div>
                  </div>

                  {/* Heatmap grid */}
                  <div className="grid grid-cols-8 gap-0.5 pt-2">
                    <div className="col-span-1 text-[8px] text-muted-foreground space-y-3.5 pt-1">
                      <div>Mon</div>
                      <div>Wed</div>
                      <div>Fri</div>
                      <div>Sun</div>
                    </div>

                    <div className="col-span-7 grid grid-cols-6 gap-0.5 h-24">
                      {[
                        [1, 1, 2, 2, 3, 4],
                        [1, 2, 2, 3, 2, 4],
                        [2, 2, 3, 4, 3, 5],
                        [1, 2, 3, 3, 4, 5],
                        [2, 3, 4, 4, 5, 6],
                        [3, 4, 5, 5, 6, 7],
                        [2, 3, 4, 5, 6, 7],
                      ].map((row, rIdx) => 
                        row.map((val, cIdx) => (
                          <div
                            key={`${rIdx}-${cIdx}`}
                            className="rounded-sm"
                            style={{
                              backgroundColor: 
                                val === 1 ? "#0f0f11" :
                                val === 2 ? "#17171d" :
                                val === 3 ? "#24242d" :
                                val === 4 ? "#3b3b49" :
                                val === 5 ? "#56566b" :
                                val === 6 ? "#7d7d9a" : "#ffffff"
                            }}
                          />
                        ))
                      )}
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center text-[8px] text-muted-foreground pt-1.5">
                    <span>12a</span>
                    <span>6a</span>
                    <span>12p</span>
                    <span>6p</span>
                    <span>12a</span>
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="bg-card/45 border border-[#1a1a1f] rounded-none p-5 flex flex-col justify-between relative">
                  <CornerBrackets />
                  <div className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">
                    Quick actions
                  </div>

                  <div className="space-y-2 pt-1">
                    {[
                      { title: "Run Groq Prompt", desc: "Query Graph Copilot." },
                      { title: "Review at Risk", desc: overviewData?.portfolio ? `${overviewData.portfolio.criticalAccounts + overviewData.portfolio.warningAccounts} active alerts open.` : "8 critical alerts open." },
                      { title: "Tenant configuration", desc: "Manage Cognee pipelines." },
                    ].map((action, idx) => (
                      <button
                        key={idx}
                        onClick={() => {
                          if (idx === 0) setActiveView("Copilot");
                          if (idx === 1) setActiveView("Insights");
                          if (idx === 2) setActiveView("Settings");
                        }}
                        className="w-full text-left p-2.5 rounded-lg border border-[#1a1a1f] hover:bg-secondary/40 transition-colors flex items-center justify-between group"
                      >
                        <div>
                          <div className="text-xs font-semibold text-white">{action.title}</div>
                          <div className="text-[10px] text-muted-foreground">{action.desc}</div>
                        </div>
                        <ArrowUpRight className="w-4 h-4 text-muted-foreground group-hover:text-white transition-colors" />
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* AI RECOMMENDATIONS FEED */}
              <div className="bg-card/45 border border-[#1a1a1f] rounded-none p-6 relative mt-6">
                <CornerBrackets />
                <div className="space-y-1 mb-4">
                  <h2 className="text-xl font-bold tracking-tight text-white font-display">AI Churn Risk Alerts</h2>
                  <p className="text-xs text-muted-foreground">Actionable warnings generated by the Health Engine audit scans</p>
                </div>
                {loading ? (
                  <div className="text-xs text-muted-foreground">Loading alerts feed...</div>
                ) : overviewData?.recommendations?.length > 0 ? (
                  <div className="space-y-3">
                    {overviewData.recommendations.map((rec: any, idx: number) => (
                       <div key={idx} className="bg-[#121216]/50 p-4 border border-[#1a1a1f] flex flex-col md:flex-row justify-between items-start gap-4 relative">
                        <CornerBrackets />
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="px-2 py-0.5 bg-rose-500/10 text-rose-500 border border-rose-500/20 text-[9px] font-bold rounded whitespace-nowrap">
                              {rec.impact || "High"} Impact
                            </span>
                            <span className="text-xs font-bold text-white">{rec.title}</span>
                          </div>
                          <p className="text-xs text-muted-foreground leading-relaxed pt-0.5">{rec.reason}</p>
                        </div>
                        <div className="flex gap-2 shrink-0">
                          <button
                            onClick={() => {
                              setCorrectionTargetId(rec.id);
                              setShowCorrectionModal(true);
                            }}
                            className="px-3 py-1.5 bg-neutral-900 border border-[#1a1a1f] hover:bg-neutral-800 text-white rounded-lg text-xs font-semibold transition-colors"
                          >
                            Dismiss alert
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-xs text-muted-foreground">No active health alert recommendations logged. Account is stable.</div>
                )}
              </div>
            </div>
          )}

          {activeView === "Accounts" && (
            <div className="px-8 py-8 space-y-6">
              <div className="flex justify-between items-center">
                <div>
                  <h1 className="text-2xl font-bold tracking-tight text-white">Enterprise Customers</h1>
                  <p className="text-xs text-muted-foreground">Monitor and filter account health index scores</p>
                </div>
                <div className="flex items-center gap-3">
                  <input
                    type="text"
                    value={accountSearch}
                    onChange={(e) => setAccountSearch(e.target.value)}
                    placeholder="Search accounts..."
                    className="bg-card border border-[#1a1a1f] rounded-lg px-3 py-1.5 text-xs text-white outline-none focus:border-primary/50"
                  />
                  <select
                    value={healthFilter}
                    onChange={(e) => setHealthFilter(e.target.value)}
                    className="bg-card border border-[#1a1a1f] rounded-lg px-3 py-1.5 text-xs text-white outline-none"
                  >
                    <option value="all">All Risk Levels</option>
                    <option value="Low">Low Risk</option>
                    <option value="Needs Attention">Needs Attention</option>
                    <option value="Critical">Critical Risk</option>
                  </select>
                </div>
              </div>

              {/* Data Table */}
              <div className="bg-card/45 border border-[#1a1a1f] rounded-none relative overflow-hidden">
                <CornerBrackets />
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-[#1a1a1f] bg-secondary/10 text-muted-foreground">
                      <th className="p-4 font-semibold">Company</th>
                      <th className="p-4 font-semibold">Owner</th>
                      <th className="p-4 font-semibold">Health Score</th>
                      <th className="p-4 font-semibold">Risk State</th>
                      <th className="p-4 font-semibold">ARR</th>
                      <th className="p-4 font-semibold">Renewal Date</th>
                      <th className="p-4 font-semibold">Last Interaction</th>
                      <th className="p-4 font-semibold">Tickets</th>
                      <th className="p-4 font-semibold text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {accountsData
                      .filter((acc) => {
                        if (accountSearch && !acc.name.toLowerCase().includes(accountSearch.toLowerCase())) return false;
                        if (healthFilter !== "all" && acc.risk !== healthFilter) return false;
                        return true;
                      })
                      .map((acc, idx) => (
                        <tr key={idx} className="border-b border-[#1a1a1f] hover:bg-secondary/20 transition-colors">
                          <td className="p-4 font-bold text-white flex items-center gap-2">
                            <span className="w-6 h-6 rounded bg-neutral-800 flex items-center justify-center text-[10px] text-neutral-400">
                              {acc.logo}
                            </span>
                            <button 
                              onClick={() => {
                                setSelectedCompany(acc.name);
                                setSelectedTenantId(acc.id);
                                setActiveView("Detail");
                              }}
                              className="hover:underline text-left"
                            >
                              {acc.name}
                            </button>
                          </td>
                          <td className="p-4 text-muted-foreground">{acc.owner}</td>
                          <td className="p-4">
                            <div className="flex items-center gap-2">
                              <div className="w-16 bg-neutral-900 h-1.5 rounded-full overflow-hidden">
                                <div 
                                  className={`h-full ${
                                    acc.health > 70 ? "bg-emerald-500" : acc.health > 45 ? "bg-amber-500" : "bg-rose-500"
                                  }`}
                                  style={{ width: `${acc.health}%` }}
                                />
                              </div>
                              <span className="font-bold text-white">{acc.health}%</span>
                            </div>
                          </td>
                          <td className="p-4">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              acc.risk === "Low" ? "bg-emerald-500/10 text-emerald-500" :
                              acc.risk === "Needs Attention" ? "bg-amber-500/10 text-amber-500" :
                              "bg-rose-500/10 text-rose-500"
                            }`}>
                              {acc.risk}
                            </span>
                          </td>
                          <td className="p-4 font-semibold text-white">{acc.arr}</td>
                          <td className="p-4 text-muted-foreground">{acc.renewal}</td>
                          <td className="p-4 text-muted-foreground">{acc.lastInt}</td>
                          <td className="p-4 text-white font-bold">{acc.tickets}</td>
                          <td className="p-4 text-right">
                            <div className="flex justify-end gap-2">
                              <button 
                                onClick={() => {
                                  setSelectedCompany(acc.name);
                                  setActiveView("Detail");
                                }}
                                className="px-2 py-1 bg-neutral-850 hover:bg-neutral-800 rounded border border-[#1a1a1f] text-[10px] text-white"
                              >
                                View Detail
                              </button>
                              <button 
                                onClick={() => {
                                  setActiveView("Copilot");
                                }}
                                className="px-2 py-1 bg-white text-black hover:bg-neutral-200 rounded text-[10px] font-semibold"
                              >
                                Ask Copilot
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeView === "Detail" && (
            <div className="px-8 py-8 space-y-6">
              <div className="flex justify-between items-start border-b border-[#1a1a1f] pb-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-neutral-800 text-white rounded flex items-center justify-center text-xl font-bold font-display">
                    {selectedCompany.substring(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <h1 className="text-3xl font-extrabold text-white tracking-tight">{selectedCompany}</h1>
                    <p className="text-xs text-muted-foreground mt-1">
                      Account Owner: {selectedAccountDetails?.summary?.owner || "Sarah Jenkins"} • ARR: {selectedAccountDetails?.summary?.arr ? `$${selectedAccountDetails.summary.arr.toLocaleString()}` : "$145,000"} • Customer Since: {selectedAccountDetails?.summary?.customerSince || "2023"}
                    </p>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button onClick={() => setActiveView("Briefs")} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-white border border-[#1a1a1f] rounded-lg text-xs transition-colors">
                    <FileText className="w-3.5 h-3.5" /> Generate Brief
                  </button>
                  <button onClick={() => setActiveView("Copilot")} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white text-black font-semibold rounded-lg text-xs hover:bg-neutral-200 transition-colors">
                    <Sparkles className="w-3.5 h-3.5" /> Ask AI Copilot
                  </button>
                  <button onClick={() => setActiveView("Graph")} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-neutral-900 border border-[#1a1a1f] hover:bg-secondary/40 text-white rounded-lg text-xs transition-colors">
                    <Network className="w-3.5 h-3.5" /> Open Knowledge Graph
                  </button>
                </div>
              </div>

              {/* Grid cards info */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Executive Summary */}
                <div className="bg-card/45 border border-[#1a1a1f] rounded-none p-5 flex flex-col justify-between relative">
                  <CornerBrackets />
                  <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Executive Summary</div>
                  <div className="space-y-3.5">
                    <div className="bg-[#121216]/50 p-3 border border-[#1a1a1f]">
                      <div className="text-[10px] text-rose-400 uppercase font-bold">Primary churn risk</div>
                      <p className="text-xs text-white mt-1">
                        {selectedAccountDetails?.insights?.[0]?.summary || "40% adoption drop in core modules and key contact transition last month."}
                      </p>
                    </div>
                    <div className="bg-[#121216]/50 p-3 border border-[#1a1a1f]">
                      <div className="text-[10px] text-emerald-400 uppercase font-bold">Growth opportunity</div>
                      <p className="text-xs text-white mt-1">Expressed interest in cognitive graph indexing for their support department.</p>
                    </div>
                    <div className="flex justify-between items-center text-xs pt-2">
                      <span className="text-muted-foreground">AI Confidence Score</span>
                      <span className="font-bold text-white bg-emerald-500/10 text-emerald-500 px-2 py-0.5 rounded">
                        {selectedAccountDetails?.summary?.confidence ? `${selectedAccountDetails.summary.confidence.toUpperCase()}` : "94%"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Health radar simulator */}
                <div className="bg-card/45 border border-[#1a1a1f] rounded-none p-5 flex flex-col justify-between relative">
                  <CornerBrackets />
                  <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Adoption Health radar</div>
                  <div className="space-y-2.5">
                    {[
                      { label: "Product usage", score: selectedAccountDetails?.summary?.healthScore || 85, color: "bg-emerald-500" },
                      { label: "Support history", score: selectedAccountDetails?.summary?.healthScore ? Math.round(selectedAccountDetails.summary.healthScore * 0.9) : 40, color: "bg-rose-500" },
                      { label: "Sentiment Index", score: selectedAccountDetails?.summary?.overallSentiment === "Positive" ? 80 : 30, color: "bg-amber-500" },
                      { label: "Contract Renewal", score: 90, color: "bg-emerald-500" },
                    ].map((radar, i) => (
                      <div key={i} className="space-y-1">
                        <div className="flex justify-between text-xs">
                          <span className="text-white">{radar.label}</span>
                          <span className="font-bold text-muted-foreground">{radar.score}%</span>
                        </div>
                        <div className="h-1.5 w-full bg-neutral-900 rounded-full overflow-hidden">
                          <div className={`h-full ${radar.color}`} style={{ width: `${radar.score}%` }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Stakeholders Profile */}
                <div className="bg-card/45 border border-[#1a1a1f] rounded-none p-5 flex flex-col justify-between relative">
                  <CornerBrackets />
                  <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Key Stakeholders</div>
                  <div className="space-y-2.5">
                    {(selectedAccountDetails?.stakeholders || [
                      { name: "Johnathan Wick", role: "Decision Maker (CTO)", sentiment: "Positive", strength: 80 },
                      { name: "Helen Cho", role: "Technical Sponsor", sentiment: "Neutral", strength: 65 },
                      { name: "Marcus Brody", role: "CS Champion", sentiment: "Negative", strength: 30 },
                    ]).map((stake: any, i: number) => (
                      <div key={i} className="flex justify-between items-center border-b border-[#121216] pb-2">
                        <div>
                          <div className="text-xs font-bold text-white">{stake.name}</div>
                          <div className="text-[10px] text-muted-foreground">{stake.role}</div>
                        </div>
                        <div className="text-right">
                          <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                            stake.sentiment === "Positive" ? "bg-emerald-500/10 text-emerald-500" :
                            stake.sentiment === "Neutral" ? "bg-amber-500/10 text-amber-500" :
                            "bg-rose-500/10 text-rose-500"
                          }`}>
                            {stake.sentiment}
                          </span>
                          <div className="text-[9px] text-muted-foreground mt-0.5">Strength: {stake.strength || 75}%</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Interactive Timeline of Events */}
              <div className="bg-card/45 border border-[#1a1a1f] rounded-none p-6 relative space-y-4">
                <CornerBrackets />
                <div className="text-sm font-semibold text-white">AI Health & Interaction Timeline</div>
                <div className="relative border-l border-[#1a1a1f] pl-6 ml-4 space-y-6">
                  {(selectedAccountDetails?.timeline || [
                    { type: "Meeting Transcript", title: "CS Executive Alignment Call", desc: "Pricing and expansion concerns raised by Wick. Mentioned budget freezes in their tech org.", date: "Today, 10:14 AM", sentiment: "Negative", source: "Zoom processed" },
                    { type: "Support Ticket", title: "API Endpoint Timeout Error #40921", desc: "Database lock contention triggered 504 gateway response on staging. Handed over to engineer team.", date: "Yesterday, 3:42 PM", sentiment: "Critical", source: "Zendesk sync" },
                    { type: "AI Insight Event", title: "Competitor mention detected", desc: "Copilot extracted relation: Wick mentioned 'RelateGraph pricing model seems more elastic' during conversation.", date: "June 28, 2026", sentiment: "Warning", source: "Cognitive extractor" },
                  ]).map((evt: any, i: number) => (
                    <div key={i} className="relative">
                      {/* Timeline dot */}
                      <span className="absolute -left-[31px] top-1 w-2.5 h-2.5 rounded-full bg-white border-4 border-[#070708]" />
                      <div className="space-y-1">
                        <div className="flex justify-between items-center text-xs">
                          <span className="font-semibold text-white">{evt.type || "Interaction"} — {evt.title || "Log Entry"}</span>
                          <span className="text-[10px] text-muted-foreground">{evt.timestamp ? new Date(evt.timestamp).toLocaleString() : (evt.date || "Recent")}</span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1 max-w-2xl">{evt.summary || evt.desc}</p>
                        <div className="flex items-center gap-3 text-[10px] text-muted-foreground pt-1.5">
                          <span className="px-2 py-0.5 bg-neutral-900 border border-[#121216] rounded-full">{evt.source || "System Log"}</span>
                          <span className={`font-bold ${
                            evt.sentiment === "Negative" || evt.sentiment === "Critical" ? "text-rose-400" : "text-amber-400"
                          }`}>
                            Sentiment: {evt.sentiment}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeView === "Copilot" && (
            <div className="px-8 py-8 flex flex-col h-[calc(100vh-3.5rem)]">
              <div className="flex-1 grid grid-cols-1 lg:grid-cols-4 gap-6 overflow-hidden">
                {/* Chat window panel */}
                <div className={`bg-card/45 border border-[#1a1a1f] rounded-none p-6 relative flex flex-col justify-between overflow-hidden ${
                  comparisonMode ? "lg:col-span-3" : "lg:col-span-3"
                }`}>
                  <CornerBrackets />

                  {/* Header */}
                  <div className="flex justify-between items-center border-b border-[#1a1a1f] pb-3 shrink-0">
                    <div>
                      <h2 className="text-sm font-bold text-white flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-primary" /> Graph RAG Copilot
                      </h2>
                      <p className="text-[10px] text-muted-foreground mt-0.5">Understands cognitive graph relationships and entities</p>
                    </div>

                    {/* Comparison mode toggle */}
                    <button 
                      onClick={() => setComparisonMode(!comparisonMode)}
                      className={`px-3 py-1 text-[10px] font-semibold border rounded-md transition-colors ${
                        comparisonMode ? "bg-white text-black" : "border-[#1a1a1f] text-white hover:bg-secondary/40"
                      }`}
                    >
                      {comparisonMode ? "Close Comparison" : "Comparison Mode"}
                    </button>
                  </div>

                  {/* Chat messages */}
                  <div className="flex-1 overflow-y-auto space-y-4 py-4 pr-1">
                    {comparisonMode ? (
                      <div className="grid grid-cols-2 gap-4 h-full">
                        {/* Left: Traditional RAG */}
                        <div className="border-r border-[#1a1a1f] pr-4 space-y-3">
                          <div className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider pb-1 border-b border-[#1a1a1f]">
                            Traditional Vector RAG
                          </div>
                          <div className="bg-secondary/10 p-3 rounded text-xs text-muted-foreground space-y-2">
                            <p><strong>Retrieved Docs:</strong> 3 customer sync logs containing 'risk' or 'Acme'.</p>
                            <p><strong>Answer:</strong> Acme Corp is at risk due to ticket counts and renewal date approaching.</p>
                          </div>
                        </div>

                        {/* Right: Knowledge Graph RAG */}
                        <div className="space-y-3">
                          <div className="text-[10px] font-bold text-primary uppercase tracking-wider pb-1 border-b border-[#1a1a1f]">
                            RetainGraph Cognitive RAG
                          </div>
                          <div className="bg-primary/5 p-3 rounded border border-primary/20 text-xs text-white space-y-2">
                            <p><strong>Retrieved Relations:</strong> Wick (CTO) {"->"} promised {"->"} Feature X {"->"} blocked by {"->"} API Bug #202.</p>
                            <p><strong>Answer:</strong> Acme is critical because CTO Johnathan Wick is blocked by API Bug #202, which prevents feature adoption.</p>
                          </div>
                        </div>
                      </div>
                    ) : (
                      copilotMessages.map((msg, idx) => (
                        <div key={idx} className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}>
                          <div className={`max-w-[80%] rounded-lg p-3 text-xs space-y-2.5 ${
                            msg.sender === "user" ? "bg-white text-black font-semibold" : "bg-[#121216] border border-[#1a1a1f] text-white"
                          }`}>
                            <p>{msg.text}</p>
                            {msg.confidence && (
                              <div className="border-t border-[#202028] pt-2 mt-2 space-y-1.5 text-[10px] text-muted-foreground">
                                <div className="flex justify-between">
                                  <span>Confidence</span>
                                  <span className="text-emerald-500 font-semibold">{msg.confidence}</span>
                                </div>
                                <div>
                                  <strong>AI Reasoning:</strong> {msg.reasoning}
                                </div>
                                <div className="flex flex-wrap gap-1 mt-1">
                                  {msg.citations?.map((c: string, i: number) => (
                                    <span key={i} className="px-1.5 py-0.5 bg-neutral-900 border border-[#202028] text-[9px] rounded text-white">
                                      {c}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                  {/* Input container */}
                  <div className="pt-3 border-t border-[#1a1a1f] flex gap-2 shrink-0">
                    <input
                      type="text"
                      value={copilotInput}
                      onChange={(e) => setCopilotInput(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleSendCopilotQuery(copilotInput)}
                      placeholder="Ask copilot about customer health, support ticket logs, or graph context..."
                      className="flex-1 bg-secondary/20 border border-[#1a1a1f] rounded-lg px-3 py-2 text-xs outline-none focus:border-primary/50 text-white"
                    />
                    <button 
                      onClick={() => handleSendCopilotQuery(copilotInput)}
                      className="px-4 py-2 bg-white text-black hover:bg-neutral-200 font-semibold rounded-lg text-xs transition-colors shrink-0"
                    >
                      Send Query
                    </button>
                  </div>
                </div>

                {/* Sidebar context panel */}
                {(() => {
                  const lastAiMsg = [...copilotMessages].reverse().find(m => m.sender === "ai");
                  const activeName = realAccounts.find(a => a.id === selectedTenantId)?.name || selectedCompany || "Acme Corp";
                  const graphNodesUsed = lastAiMsg?.graphNodes || [
                    `Customer: ${activeName}`,
                    ...((activeBrief?.keyStakeholders && activeBrief.keyStakeholders.length > 0)
                      ? activeBrief.keyStakeholders.map((s: any) => `${s.role || "Stakeholder"}: ${s.name}`)
                      : ["Stakeholder: Johnathan Wick"])
                  ];
                  const linkedTimelines = lastAiMsg?.linkedTimelines || [
                    ...((activeBrief?.commitments && activeBrief.commitments.length > 0)
                      ? activeBrief.commitments
                      : ["Zendesk interaction check", "Zoom Sync Call"])
                  ];
                  const accuracy = lastAiMsg?.confidence || (activeBrief ? `${Math.round(activeBrief.briefConfidence * 100)}%` : "94%");

                  return (
                    <div className="bg-card/45 border border-[#1a1a1f] rounded-none p-5 relative space-y-4">
                      <CornerBrackets />
                      <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Retrieved Context</div>
                      <div className="space-y-3 text-xs">
                        <div className="p-3 bg-[#121216]/50 border border-[#1a1a1f] rounded space-y-1">
                          <div className="text-[10px] text-neutral-400 font-bold uppercase">Graph Entities Used</div>
                          <div className="text-white text-[11px] font-mono">
                            {graphNodesUsed.map((node: string, idx: number) => (
                              <div key={idx}>- {node}</div>
                            ))}
                          </div>
                        </div>

                        <div className="p-3 bg-[#121216]/50 border border-[#1a1a1f] rounded space-y-1">
                          <div className="text-[10px] text-neutral-400 font-bold uppercase">Linked Timelines</div>
                          <div className="text-white text-[11px]">
                            {linkedTimelines.map((time: string, idx: number) => (
                              <div key={idx}>- {time}</div>
                            ))}
                          </div>
                        </div>

                        <div className="p-3 bg-[#121216]/50 border border-[#1a1a1f] rounded space-y-1">
                          <div className="text-[10px] text-neutral-400 font-bold uppercase">Cognitive Confidence</div>
                          <div className="text-emerald-500 font-bold text-sm">
                            {accuracy.includes("%") ? accuracy : `${accuracy}%`} ACCURACY
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })()}
              </div>
            </div>
          )}

          {activeView === "Graph" && (
            <div className="px-8 py-8 flex flex-col h-[calc(100vh-3.5rem)]">
              {/* Controls */}
              <div className="flex justify-between items-center mb-4 shrink-0">
                <div>
                  <h1 className="text-xl font-bold text-white flex items-center gap-2">
                    <Network className="w-5 h-5 text-primary" /> Cognitive Customer Knowledge Graph
                  </h1>
                  <p className="text-xs text-muted-foreground">Interactive visualization of multi-dimensional CS relationships</p>
                </div>

                <div className="flex gap-2 items-center">
                  <div className="flex border border-[#1a1a1f] bg-card rounded overflow-hidden mr-2">
                    <button
                      onClick={() => setZoomScale(s => Math.min(s * 1.2, 4))}
                      className="px-2.5 py-1 text-xs text-white border-r border-[#1a1a1f] hover:bg-neutral-800"
                      title="Zoom In"
                    >
                      ＋
                    </button>
                    <button
                      onClick={() => setZoomScale(s => Math.max(s / 1.2, 0.3))}
                      className="px-2.5 py-1 text-xs text-white border-r border-[#1a1a1f] hover:bg-neutral-800"
                      title="Zoom Out"
                    >
                      －
                    </button>
                    <button
                      onClick={() => {
                        setZoomScale(1);
                        setZoomTranslation({ x: 0, y: 0 });
                      }}
                      className="px-2.5 py-1 text-xs text-white hover:bg-neutral-800"
                      title="Reset Zoom"
                    >
                      Reset
                    </button>
                  </div>
                  <select 
                    value={graphFilterType}
                    onChange={(e) => setGraphFilterType(e.target.value)}
                    className="bg-card border border-[#1a1a1f] rounded px-2.5 py-1 text-xs text-white"
                  >
                    <option value="all">All Nodes</option>
                    <option value="Customer">Customers Only</option>
                    <option value="Competitor">Competitors Only</option>
                    <option value="Ticket">Support Tickets</option>
                  </select>
                  <input
                    type="text"
                    placeholder="Search node..."
                    value={graphSearchQuery}
                    onChange={(e) => setGraphSearchQuery(e.target.value)}
                    className="bg-card border border-[#1a1a1f] rounded px-2.5 py-1 text-xs text-white"
                  />
                </div>
              </div>

              {/* Force directed Canvas screen */}
              <div className="flex-1 bg-card/25 border border-[#1a1a1f] rounded-none relative overflow-hidden flex items-center justify-center">
                <CornerBrackets />

                {/* Graph Visualization Canvas Simulator */}
                {(() => {
                  const rawNodes = graphData ? simulationNodes : [
                    { id: "1", label: selectedCompany, type: "Customer", x: 400, y: 250 },
                    { id: "2", label: "Johnathan Wick", type: "CTO", x: 500, y: 150 },
                    { id: "3", label: "RelateGraph", type: "Competitor", x: 300, y: 150 },
                    { id: "4", label: "API Timeout issue", type: "Support", x: 400, y: 380 },
                  ];

                  const rawEdges = graphData ? simulationLinks : [
                    { source: { id: "1", x: 400, y: 250 }, target: { id: "2", x: 500, y: 150 }, relation: "has_cto" },
                    { source: { id: "1", x: 400, y: 250 }, target: { id: "3", x: 300, y: 150 }, relation: "competing_with" },
                    { source: { id: "2", x: 500, y: 150 }, target: { id: "4", x: 400, y: 380 }, relation: "reported" },
                  ];

                  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
                    if (isPanning) {
                      setZoomTranslation({
                        x: e.clientX - panStart.x,
                        y: e.clientY - panStart.y
                      });
                    } else if (draggedNode) {
                      const rect = e.currentTarget.getBoundingClientRect();
                      const x = (e.clientX - rect.left - zoomTranslation.x) / zoomScale;
                      const y = (e.clientY - rect.top - zoomTranslation.y) / zoomScale;
                      
                      const node = rawNodes.find((n: any) => n.id === draggedNode.id);
                      if (node) {
                        node.fx = x;
                        node.fy = y;
                        if (simulationRef.current) {
                          simulationRef.current.alpha(0.15).restart();
                        }
                      }
                    }
                  };

                  const handleWheel = (e: React.WheelEvent<SVGSVGElement>) => {
                    const zoomFactor = 1.05;
                    const nextScale = e.deltaY < 0 ? zoomScale * zoomFactor : zoomScale / zoomFactor;
                    setZoomScale(Math.min(Math.max(nextScale, 0.3), 4));
                  };

                  const handleSvgMouseDown = (e: React.MouseEvent<SVGSVGElement>) => {
                    const target = e.target as SVGElement;
                    if (target.tagName === "svg" || target.tagName === "line") {
                      setIsPanning(true);
                      setPanStart({ x: e.clientX - zoomTranslation.x, y: e.clientY - zoomTranslation.y });
                    }
                  };

                  const handleMouseUp = () => {
                    if (isPanning) {
                      setIsPanning(false);
                    }
                    if (draggedNode) {
                      const node = rawNodes.find((n: any) => n.id === draggedNode.id);
                      if (node && node.id !== rawNodes[0]?.id) {
                        node.fx = null;
                        node.fy = null;
                      }
                      setDraggedNode(null);
                    }
                  };

                  return (
                    <div className="absolute inset-0 w-full h-full">
                      <svg 
                        className="w-full h-full cursor-grab active:cursor-grabbing" 
                        xmlns="http://www.w3.org/2000/svg"
                        onMouseDown={handleSvgMouseDown}
                        onMouseMove={handleMouseMove}
                        onMouseUp={handleMouseUp}
                        onMouseLeave={handleMouseUp}
                        onWheel={handleWheel}
                      >
                        <g transform={`translate(${zoomTranslation.x}, ${zoomTranslation.y}) scale(${zoomScale})`}>
                          {rawEdges.map((e: any, idx: number) => {
                            const sourceX = typeof e.source === "object" ? e.source.x : rawNodes.find(n => n.id === e.source)?.x || 0;
                            const sourceY = typeof e.source === "object" ? e.source.y : rawNodes.find(n => n.id === e.source)?.y || 0;
                            const targetX = typeof e.target === "object" ? e.target.x : rawNodes.find(n => n.id === e.target)?.x || 0;
                            const targetY = typeof e.target === "object" ? e.target.y : rawNodes.find(n => n.id === e.target)?.y || 0;
                            
                            return (
                              <g key={idx}>
                                <line
                                  x1={sourceX}
                                  y1={sourceY}
                                  x2={targetX}
                                  y2={targetY}
                                  stroke="#3f3f46"
                                  strokeWidth="1.5"
                                />
                                <rect
                                  x={(sourceX + targetX) / 2 - 25}
                                  y={(sourceY + targetY) / 2 - 8}
                                  width="50"
                                  height="11"
                                  fill="#09090b"
                                  rx="2"
                                />
                                <text
                                  x={(sourceX + targetX) / 2}
                                  y={(sourceY + targetY) / 2}
                                  fill="#a1a1aa"
                                  fontSize="7"
                                  className="select-none pointer-events-none font-mono"
                                  textAnchor="middle"
                                >
                                  {e.relation}
                                </text>
                              </g>
                            );
                          })}

                          {rawNodes.map((n: any, idx: number) => {
                            const typeLower = (n.type || "").toLowerCase();
                            const labelLower = (n.label || "").toLowerCase();

                            const isCustomer = typeLower === "customer" || 
                                               labelLower === selectedCompany.toLowerCase() ||
                                               labelLower.includes("corp") || 
                                               labelLower.includes("company") || 
                                               labelLower.includes("client");
                                               
                            const isCompetitor = typeLower.includes("competit") || 
                                                 labelLower === "relategraph" ||
                                                 labelLower.includes("competitor");

                            const isStakeholder = ["cto", "sponsor", "stakeholder", "person", "csm"].includes(typeLower) || 
                                                  ["johnathan wick", "helen cho", "john wick"].includes(labelLower) ||
                                                  labelLower.includes("champion") ||
                                                  labelLower.includes("cto");

                            const isTicket = typeLower.includes("ticket") || 
                                             typeLower.includes("support") || 
                                             typeLower.includes("issue") || 
                                             labelLower.includes("ticket") || 
                                             labelLower.includes("issue") ||
                                             labelLower.includes("bug") ||
                                             labelLower.includes("timeout") ||
                                             labelLower.includes("latency") ||
                                             labelLower.includes("crash");

                            const isProduct = typeLower.includes("product") || 
                                              typeLower.includes("feature") || 
                                              labelLower.includes("dashboard") ||
                                              labelLower.includes("api") ||
                                              labelLower.includes("feature") ||
                                              labelLower.includes("integration");

                            const isInteraction = labelLower.includes("email") ||
                                                   labelLower.includes("call") ||
                                                   labelLower.includes("qbr") ||
                                                   labelLower.includes("meeting") ||
                                                   labelLower.includes("discussion") ||
                                                   labelLower.includes("sync");

                            let color = "rgba(59, 130, 246, 0.15)";
                            let stroke = "#3b82f6";
                            let typeLabel = "ENT";

                            if (isCustomer) {
                              color = "rgba(255, 255, 255, 0.1)";
                              stroke = "#ffffff";
                              typeLabel = "CUST";
                            } else if (isCompetitor) {
                              color = "rgba(239, 68, 68, 0.15)";
                              stroke = "#ef4444";
                              typeLabel = "COMP";
                            } else if (isStakeholder) {
                              color = "rgba(16, 185, 129, 0.15)";
                              stroke = "#10b981";
                              typeLabel = "STAK";
                            } else if (isTicket) {
                              color = "rgba(245, 158, 11, 0.15)";
                              stroke = "#f59e0b";
                              typeLabel = "WARN";
                            } else if (isProduct) {
                              color = "rgba(139, 92, 246, 0.15)";
                              stroke = "#8b5cf6";
                              typeLabel = "PROD";
                            } else if (isInteraction) {
                              color = "rgba(20, 184, 166, 0.15)";
                              stroke = "#14b8a6";
                              typeLabel = "COMM";
                            }

                            const displayLabel = n.label && n.label.length > 18 
                              ? n.label.substring(0, 15) + "..." 
                              : (n.label || "");

                            return (
                              <g 
                                key={idx} 
                                className="group cursor-pointer select-none"
                                onClick={() => setSelectedNode(n)}
                                onMouseDown={(e) => {
                                  e.preventDefault();
                                  setDraggedNode(n);
                                  n.fx = n.x;
                                  n.fy = n.y;
                                }}
                              >
                                <circle
                                  cx={n.x}
                                  cy={n.y}
                                  r={isCustomer ? 28 : 20}
                                  fill={color}
                                  stroke={stroke}
                                  strokeWidth="2"
                                />
                                <text
                                  x={n.x}
                                  y={n.y + 3}
                                  fill={stroke}
                                  fontSize="9"
                                  fontWeight="bold"
                                  textAnchor="middle"
                                >
                                  {typeLabel}
                                </text>
                                
                                <rect
                                  x={n.x - 50}
                                  y={n.y - (isCustomer ? 42 : 34)}
                                  width="100"
                                  height="10"
                                  fill="#09090b"
                                  fillOpacity="0.75"
                                  rx="2"
                                  className="group-hover:fill-opacity-95"
                                />
                                
                                <text
                                  x={n.x}
                                  y={n.y - (isCustomer ? 34 : 26)}
                                  fill="#ffffff"
                                  fontSize="9"
                                  fontWeight="semibold"
                                  textAnchor="middle"
                                >
                                  {displayLabel}
                                </text>
                              </g>
                            );
                          })}
                        </g>
                      </svg>

                      {/* Legend overlay */}
                      <div className="absolute bottom-5 left-5 bg-card/90 border border-[#1a1a1f] p-3 text-[10px] space-y-1.5 z-10">
                        <div className="font-bold text-white uppercase tracking-wider mb-1">Graph Legend</div>
                        {Array.from(new Set(rawNodes.map((n: any) => n.type || "Entity"))).map((type: any, idx: number) => {
                          const typeLower = String(type).toLowerCase();
                          const isCustomer = typeLower === "customer";
                          const isCompetitor = typeLower.includes("competit");
                          const isStakeholder = ["cto", "sponsor", "stakeholder", "person", "csm"].includes(typeLower);
                          const isTicket = typeLower.includes("ticket") || typeLower.includes("support") || typeLower.includes("issue");
                          const isProduct = typeLower.includes("product") || typeLower.includes("feature");
                          const isInteraction = ["email", "call", "qbr", "meeting", "discussion", "sync", "communication"].includes(typeLower);

                          let colorClass = "bg-blue-500";
                          let label = type;
                          
                          if (isCustomer) {
                            colorClass = "bg-white";
                            label = "Customer Accounts";
                          } else if (isCompetitor) {
                            colorClass = "bg-rose-500";
                            label = "Competitors";
                          } else if (isStakeholder) {
                            colorClass = "bg-emerald-500";
                            label = "Stakeholders";
                          } else if (isTicket) {
                            colorClass = "bg-amber-500";
                            label = "Support / Tickets";
                          } else if (isProduct) {
                            colorClass = "bg-purple-500";
                            label = "Product Features";
                          } else if (isInteraction) {
                            colorClass = "bg-teal-500";
                            label = "Communications";
                          }

                          return (
                            <div key={idx} className="flex items-center gap-2">
                              <span className={`w-2 h-2 rounded-full ${colorClass}`} />
                              <span className="text-muted-foreground capitalize">{label}</span>
                            </div>
                          );
                        })}
                      </div>

                      {/* Floating properties sidebar detail */}
                      <div className="absolute top-5 right-5 w-64 bg-card/90 border border-[#1a1a1f] p-4 text-xs space-y-3 z-10">
                        <div className="font-bold text-white pb-1 border-b border-[#1a1a1f]">Node Inspector</div>
                        <div className="space-y-2">
                          <div>
                            <span className="text-muted-foreground block text-[9px] uppercase font-bold">Selected Node</span>
                            <span className="text-white font-bold text-sm">{selectedNode?.label || rawNodes[0]?.label || selectedCompany}</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground block text-[9px] uppercase font-bold">Type</span>
                            <span className="text-white">{selectedNode?.type || "Entity"}</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground block text-[9px] uppercase font-bold">Degree Centrality</span>
                            <span className="text-white font-mono">Connected via Cognee edges</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground block text-[9px] uppercase font-bold">Synchronized</span>
                            <span className="text-emerald-500 font-semibold">Active Cognee Sync</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })()}
              </div>
            </div>
          )}

          {activeView === "Insights" && (
            <div className="px-8 py-8 space-y-6">
              <div className="flex justify-between items-center">
                <div>
                  <h1 className="text-2xl font-bold tracking-tight text-white">AI-Generated Insights</h1>
                  <p className="text-xs text-muted-foreground">Active anomaly triggers and proactive customer alerts</p>
                </div>
                <div className="flex gap-2">
                  <span className="px-3 py-1 bg-rose-500/10 text-rose-500 border border-rose-500/20 text-xs font-semibold rounded-full">
                    {insights.length} Active Events
                  </span>
                </div>
              </div>

              {/* Insights list */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {insights.map((ins, i) => {
                  const priority = ins.severity === "critical" ? "Critical" : "High";
                  const confDisplay = ins.confidence === "high" ? "94%" : ins.confidence === "medium" ? "85%" : ins.confidence;

                  return (
                    <div key={i} className="bg-card/45 border border-[#1a1a1f] rounded-none p-5 space-y-3.5 relative">
                      <CornerBrackets />
                      <div className="flex justify-between items-center border-b border-[#1a1a1f] pb-2">
                        <span className="text-[10px] text-primary uppercase font-bold tracking-wider">{ins.category}</span>
                        <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${
                          priority === "Critical" ? "bg-rose-500/10 text-rose-500" :
                          priority === "High" ? "bg-amber-500/10 text-amber-500" : "bg-neutral-600/10 text-muted-foreground"
                        }`}>
                          {priority} Priority
                        </span>
                      </div>

                      <div className="space-y-1">
                        <h3 className="text-sm font-semibold text-white">{ins.summary}</h3>
                        <p className="text-xs text-muted-foreground mt-1">{ins.recommendation}</p>
                      </div>

                      <div className="flex justify-between items-center pt-2 text-[10px]">
                        <div className="flex gap-2">
                          <span className="text-muted-foreground">Confidence: <strong>{confDisplay}</strong></span>
                        </div>
                        <button 
                          onClick={() => {
                            const recordId = ins.id.split("-cause-")[0];
                            setCorrectionTargetId(recordId);
                            setCorrectionReasonInput("");
                            setShowCorrectionModal(true);
                          }}
                          className="px-2.5 py-1 bg-white text-black hover:bg-neutral-200 rounded font-semibold text-[10px]"
                        >
                          Resolve Insight
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {activeView === "Analytics" && (
            <div className="px-8 py-8 space-y-6">
              <div>
                <h1 className="text-2xl font-bold tracking-tight text-white">Executive CS Analytics</h1>
                <p className="text-xs text-muted-foreground">Aggregated trends, churn prediction index, and sentiment trends</p>
              </div>

              {/* Big Charts grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Revenue at Risk */}
                <div className="bg-card/45 border border-[#1a1a1f] rounded-none p-6 flex flex-col justify-between relative">
                  <CornerBrackets />
                  <div className="space-y-1">
                    <h3 className="text-sm font-semibold text-white">ARR Churn Exposure</h3>
                    <p className="text-xs text-muted-foreground">Contract value exposed to health risks</p>
                  </div>
                  <div className="h-[220px] w-full flex items-end justify-between gap-2 pt-2">
                    {[
                      { name: "Healthy ARR (Low)", val: realAccounts.filter(a => a.health < 40).reduce((sum, a) => sum + (a.rawAccount?.arr || 120000), 0) },
                      { name: "Warning ARR (Med)", val: realAccounts.filter(a => a.health >= 40 && a.health < 70).reduce((sum, a) => sum + (a.rawAccount?.arr || 120000), 0) },
                      { name: "Critical ARR (High)", val: realAccounts.filter(a => a.health >= 70).reduce((sum, a) => sum + (a.rawAccount?.arr || 120000), 0) },
                    ].map((exposure, i) => {
                      const maxVal = Math.max(1, realAccounts.reduce((sum, a) => sum + (a.rawAccount?.arr || 120000), 0));
                      return (
                        <div key={i} className="flex-1 flex flex-col items-center gap-2">
                          <span className="text-[10px] text-white font-bold">${(exposure.val / 1000).toFixed(0)}K</span>
                          <div className="w-full bg-[#1c1c22] rounded-none transition-all duration-500" style={{ height: `${(exposure.val / maxVal) * 150}px` }} />
                          <span className="text-[10px] text-muted-foreground font-semibold text-center">{exposure.name}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Sentiment Trend */}
                <div className="bg-card/45 border border-[#1a1a1f] rounded-none p-6 flex flex-col justify-between relative">
                  <CornerBrackets />
                  <div className="space-y-1">
                    <h3 className="text-sm font-semibold text-white">Portfolio Sentiment Index</h3>
                    <p className="text-xs text-muted-foreground">Average customer satisfaction metrics</p>
                  </div>
                  <div className="h-[220px] w-full flex items-end justify-between gap-2 pt-2">
                    {realAccounts.map((acc, i) => {
                      const safetyScore = 100 - acc.health;
                      const isSelected = acc.id === selectedTenantId;
                      return (
                        <div key={i} className={`flex-1 flex flex-col items-center gap-2 transition-all duration-300 ${isSelected ? 'scale-105' : 'opacity-50 hover:opacity-85'}`}>
                          <span className={`text-[10px] font-bold ${isSelected ? 'text-primary' : 'text-white'}`}>{safetyScore}%</span>
                          <div className={`w-full rounded-none transition-all duration-500 ${isSelected ? 'bg-primary shadow-[0_0_10px_rgba(59,130,246,0.5)]' : 'bg-neutral-800'}`} style={{ height: `${(safetyScore / 100) * 150}px` }} />
                          <span className={`text-[10px] font-semibold truncate max-w-[80px] text-center ${isSelected ? 'text-primary font-bold' : 'text-muted-foreground'}`}>{acc.name}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeView === "Briefs" && (
            <div className="px-8 py-8 space-y-6">
              <div className="flex justify-between items-center">
                <div>
                  <h1 className="text-2xl font-bold tracking-tight text-white">Pre-Call Brief Generator</h1>
                  <p className="text-xs text-muted-foreground">Compile meeting briefing packets with cognitive graph context</p>
                </div>
                <button 
                  onClick={() => alert("Copied Pre-Call Brief PDF Export link to clipboard.")}
                  className="px-4 py-1.5 bg-white text-black font-semibold rounded-lg text-xs hover:bg-neutral-200"
                >
                  Export Brief (PDF)
                </button>
              </div>

              {/* Brief layout */}
              <div className="bg-card/45 border border-[#1a1a1f] rounded-none p-6 relative flex flex-col justify-between max-w-3xl">
                <CornerBrackets />

                <div className="border-b border-[#1a1a1f] pb-4 flex justify-between items-start">
                  <div>
                    <h2 className="text-xl font-bold text-white">CS Meeting Prep Briefing</h2>
                    <p className="text-xs text-primary font-semibold mt-0.5">
                      Subject Account: {activeBrief ? (realAccounts.find(a => a.id === selectedTenantId)?.name || selectedTenantId) : "Acme Corp"} • Prepared by RetainGraph AI
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-muted-foreground block">Prep Score</span>
                    <span className="text-lg font-black text-emerald-500">
                      {activeBrief ? Math.round(activeBrief.briefConfidence * 100) : 92} / 100
                    </span>
                  </div>
                </div>

                <div className="space-y-4 text-xs text-muted-foreground">
                  <div className="space-y-1">
                    <h3 className="text-xs font-bold text-white uppercase tracking-wider">Executive Summary</h3>
                    <p>{activeBrief?.executiveSummary || "Acme Corp is presenting high risk due to API Key authorization failures and support backlogs. Johnathan Wick has scheduled this call to alignment pricing concerns and expansion potential."}</p>
                  </div>

                  <div className="space-y-1">
                    <h3 className="text-xs font-bold text-white uppercase tracking-wider">Key Talking Points</h3>
                    <ul className="list-disc pl-5 space-y-1.5">
                      {activeBrief?.recommendedTalkingPoints && activeBrief.recommendedTalkingPoints.length > 0 ? (
                        activeBrief.recommendedTalkingPoints.map((point: string, i: number) => (
                          <li key={i}>{point}</li>
                        ))
                      ) : (
                        <>
                          <li>Highlight engineers resolving the API gateway timeouts.</li>
                          <li>Address the competitive comparison with *RelateGraph* directly with Wick.</li>
                          <li>Offer a dedicated architect to sync their Neo4j/Cognee data pipelines.</li>
                        </>
                      )}
                    </ul>
                  </div>

                  <div className="space-y-1">
                    <h3 className="text-xs font-bold text-white uppercase tracking-wider">Open Commitments</h3>
                    <p>
                      {activeBrief?.commitments && activeBrief.commitments.length > 0
                        ? activeBrief.commitments.join(", ")
                        : "Deliver the custom webhook connector module requested by Cho on Support Ticket #40921 by next Wednesday."}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeView === "Settings" && (
            <div className="px-8 py-8 space-y-6">
              <div>
                <h1 className="text-2xl font-bold tracking-tight text-white">Workspace Configuration</h1>
                <p className="text-xs text-muted-foreground">Configure AI engines, Cognee graph parameters, and API integration keys</p>
              </div>

              {/* Forms */}
              <div className="bg-card/45 border border-[#1a1a1f] rounded-none p-6 relative max-w-2xl flex flex-col justify-between">
                <CornerBrackets />

                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-white block">Groq API Key</label>
                    <input
                      type="password"
                      value={groqKey}
                      onChange={(e) => setGroqKey(e.target.value)}
                      className="w-full bg-secondary/20 border border-[#1a1a1f] rounded px-3 py-1.5 text-xs text-white outline-none focus:border-primary/50"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-white block">Cognee Database Sync Pipeline</label>
                    <input
                      type="text"
                      value={cogneeConfig}
                      onChange={(e) => setCogneeConfig(e.target.value)}
                      className="w-full bg-secondary/20 border border-[#1a1a1f] rounded px-3 py-1.5 text-xs text-white outline-none focus:border-primary/50"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-white block">Workspace Branding Name</label>
                    <input
                      type="text"
                      defaultValue="RetainGraph SaaS Portal"
                      className="w-full bg-secondary/20 border border-[#1a1a1f] rounded px-3 py-1.5 text-xs text-white outline-none focus:border-primary/50"
                    />
                  </div>
                </div>

                <div className="pt-2">
                  <button 
                    onClick={() => alert("Settings saved and database synchronization triggered.")}
                    className="px-4 py-1.5 bg-white text-black hover:bg-neutral-200 font-semibold rounded text-xs transition-colors"
                  >
                    Save Changes
                  </button>
                </div>
              </div>

              {/* DEVELOPER PLAYGROUND & CONTROLS */}
              <div className="bg-card/45 border border-[#1a1a1f] rounded-none p-6 relative max-w-2xl mt-6">
                <CornerBrackets />
                <div className="space-y-1 mb-4">
                  <h2 className="text-sm font-bold text-white uppercase tracking-wider font-display">Developer Operations Playground</h2>
                  <p className="text-xs text-muted-foreground">Test the ingestion and risk evaluation pipelines directly from the user interface</p>
                </div>

                <div className="space-y-4">
                  {/* Ingestion Panel */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-white block">Simulate Raw Customer Objection / Signal</label>
                    <textarea
                      value={ingestInput}
                      onChange={(e) => setIngestInput(e.target.value)}
                      placeholder="E.g., objection: We are considering competitor RelateGraph because the support response delay is too high."
                      rows={3}
                      className="w-full bg-[#121216]/50 border border-[#1a1a1f] rounded-lg p-2.5 text-xs text-white outline-none focus:border-primary/50 resize-none"
                    />
                    <button
                      onClick={handleIngestPlayground}
                      className="px-3 py-1.5 bg-white text-black hover:bg-neutral-200 rounded font-semibold text-xs transition-colors"
                    >
                      Ingest Client Interaction
                    </button>
                  </div>

                  {/* Health Worker Panel */}
                  <div className="pt-2 border-t border-[#1a1a1f] flex items-center justify-between">
                    <div>
                      <h3 className="text-xs font-bold text-white">Trigger Health evaluation Pass</h3>
                      <p className="text-[11px] text-muted-foreground">Runs the Health Evaluation worker for demo-tenant-123</p>
                    </div>
                    <button
                      onClick={handleTriggerHealthAudit}
                      className="px-3 py-1.5 bg-neutral-900 border border-[#1a1a1f] hover:bg-neutral-800 text-white rounded font-semibold text-xs transition-colors"
                    >
                      Trigger Health Audit Pass
                    </button>
                  </div>

                  {/* Logs Screen */}
                  {playgroundLogs.length > 0 && (
                    <div className="pt-2 border-t border-[#1a1a1f] space-y-1.5">
                      <div className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Playground execution log</div>
                      <div className="bg-[#050506] border border-[#1a1a1f] p-3 rounded font-mono text-[10px] text-emerald-400 space-y-1 max-h-24 overflow-y-auto">
                        {playgroundLogs.map((log, idx) => (
                          <div key={idx}>{log}</div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeView === "Notifications" && (
            <div className="px-8 py-8 space-y-6">
              <div>
                <h1 className="text-2xl font-bold tracking-tight text-white">Notifications Feed</h1>
                <p className="text-xs text-muted-foreground">Historical alert logs from your Cognee customer success pipelines</p>
              </div>

              {/* Feed lists */}
              <div className="bg-card/45 border border-[#1a1a1f] rounded-none relative overflow-hidden max-w-3xl">
                <CornerBrackets />
                <div className="divide-y divide-[#1a1a1f] text-xs">
                  {[
                    { title: "Critical Alert: Churn risk Acme Corp", desc: "Groq sentiment index detected pricing objection mentions from Johnathan Wick.", date: "2 hours ago", type: "AI Insight" },
                    { title: "Knowledge Graph Synced", desc: "Cognee pipeline successfully processed 200 nodes and 400 edges from Slack history.", date: "1 day ago", type: "Graph Pipeline" },
                    { title: "Support Ticket Escalated: #40921", desc: "Acme Corp reported timeout issue blocking staging deployment.", date: "1 day ago", type: "Zendesk" },
                    { title: "Competitor mentioned by Globex", desc: "competitor 'RelateGraph' mentioned in support chat history.", date: "3 days ago", type: "AI Insight" },
                  ].map((notif, i) => (
                    <div key={i} className="p-4 hover:bg-secondary/10 transition-colors flex justify-between items-start gap-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-white">{notif.title}</span>
                          <span className="text-[9px] bg-[#1c1c22] px-1.5 py-0.5 rounded text-muted-foreground">{notif.type}</span>
                        </div>
                        <p className="text-muted-foreground">{notif.desc}</p>
                      </div>
                      <span className="text-[10px] text-muted-foreground shrink-0">{notif.date}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* CSM SEED PROCEDURAL MEMORY MODAL */}
      {showCorrectionModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#0c0c0e] border border-[#1a1a1f] max-w-md w-full p-6 space-y-4 relative">
            <CornerBrackets />
            <div className="space-y-1">
              <h3 className="text-base font-bold text-white">Seed CSM Procedural Memory</h3>
              <p className="text-xs text-muted-foreground">Dismissing this active churn alert will register your feedback as authoritative background knowledge for future health scans.</p>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-semibold text-white block">Correction Explanation / Reason</label>
              <textarea
                value={correctionReasonInput}
                onChange={(e) => setCorrectionReasonInput(e.target.value)}
                placeholder="E.g., Salesforce mention was a standard competitor intelligence benchmark check, not an active procurement cycle. API fixes deployed."
                rows={4}
                className="w-full bg-[#121216]/50 border border-[#1a1a1f] rounded-lg p-2.5 text-xs text-white outline-none focus:border-primary/50 resize-none"
              />
            </div>
            <div className="flex justify-end gap-2 text-xs font-semibold">
              <button
                onClick={() => {
                  setShowCorrectionModal(false);
                  setCorrectionReasonInput("");
                }}
                className="px-4 py-2 border border-[#1a1a1f] hover:bg-neutral-800 text-white rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmitCorrection}
                className="px-4 py-2 bg-white text-black hover:bg-neutral-200 rounded-lg transition-colors"
              >
                Seed Memory & Dismiss
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
