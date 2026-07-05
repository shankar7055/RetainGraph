import { createFileRoute } from "@tanstack/react-router";
import React, { useState, useEffect } from "react";
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
  const endAngle = endPercent * 2 * Math.PI;

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
  { day: "Mar 22", New: 6, Existing: 8 },
  { day: "Mar 23", New: 7, Existing: 7 },
  { day: "Mar 24", New: 5, Existing: 9 },
  { day: "Mar 25", New: 8, Existing: 6 },
  { day: "Mar 26", New: 4, Existing: 8 },
  { day: "Mar 27", New: 7, Existing: 5 },
  { day: "Mar 28", New: 9, Existing: 7 },
  { day: "Mar 29", New: 6, Existing: 8 },
  { day: "Mar 30", New: 5, Existing: 7 },
  { day: "Mar 31", New: 8, Existing: 9 },
  { day: "Apr 1", New: 9, Existing: 6 },
  { day: "Apr 2", New: 7, Existing: 8 },
  { day: "Apr 3", New: 6, Existing: 7 },
  { day: "Apr 4", New: 8, Existing: 5 },
  { day: "Apr 5", New: 9, Existing: 9 },
  { day: "Apr 6", New: 11, Existing: 7 },
  { day: "Apr 7", New: 6, Existing: 8 },
  { day: "Apr 8", New: 5, Existing: 7 },
  { day: "Apr 9", New: 8, Existing: 6 },
  { day: "Apr 10", New: 9, Existing: 8 },
  { day: "Apr 11", New: 6, Existing: 7 },
  { day: "Apr 12", New: 8, Existing: 9 },
  { day: "Apr 13", New: 10, Existing: 5 },
  { day: "Apr 14", New: 7, Existing: 8 },
  { day: "Apr 15", New: 6, Existing: 7 },
  { day: "Apr 16", New: 8, Existing: 6 },
  { day: "Apr 17", New: 5, Existing: 9 },
  { day: "Apr 18", New: 7, Existing: 7 },
  { day: "Apr 19", New: 6, Existing: 7 },
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

function Dashboard() {
  const [activeTab, setActiveTab] = useState("1M");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [activeView, setActiveView] = useState<"Overview" | "Accounts" | "Detail" | "Copilot" | "Graph" | "Insights" | "Analytics" | "Briefs" | "Settings" | "Notifications">("Overview");
  const [selectedCompany, setSelectedCompany] = useState("Acme Corp");

  // State for AI Copilot Chat
  const [copilotInput, setCopilotInput] = useState("");
  const [copilotMessages, setCopilotMessages] = useState([
    {
      sender: "user",
      text: "Why is Acme Corp marked as Critical Risk?"
    },
    {
      sender: "ai",
      text: "Acme Corp is currently at critical risk (Health Score: 32%) due to a **40% drop in product adoption** over the past 30 days and **2 unresolved critical API issues** blocking their engineers. Additionally, competitor *RelateGraph* was mentioned twice in support transcripts last week.",
      confidence: "94%",
      reasoning: "Correlated 6 support tickets, 14 API error logs, and sentiment analysis from 3 emails.",
      citations: ["Slack thread: #acme-sync L45", "Support ticket #40921", "Call recording: CS Check-in (June 28)"],
      graphNodes: ["Acme Corp (Customer)", "API Issue #202 (Node)", "RelateGraph (Competitor)"]
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

  // Seeding correction modal state
  const [showCorrectionModal, setShowCorrectionModal] = useState(false);
  const [correctionTargetId, setCorrectionTargetId] = useState("");
  const [correctionReasonInput, setCorrectionReasonInput] = useState("");

  const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:3000/api/v1";

  // Fetch Overview and Accounts list
  useEffect(() => {
    async function loadInitialData() {
      setLoading(true);
      try {
        const ovRes = await fetch(`${API_BASE}/dashboard/overview?tenantId=demo-tenant-123`);
        if (ovRes.ok) {
          const data = await ovRes.json();
          setOverviewData(data);
        }
        
        const accRes = await fetch(`${API_BASE}/accounts`);
        if (accRes.ok) {
          const list = await accRes.json();
          setRealAccounts(list.map((a: any) => ({
            name: a.name || a.id,
            logo: a.name ? a.name.substring(0, 2).toUpperCase() : "AC",
            owner: a.csOwner || "Unassigned",
            health: a.healthChecks?.[0] ? (100 - a.healthChecks[0].riskScore) : 50,
            risk: a.healthChecks?.[0] ? (a.healthChecks[0].riskScore > 70 ? "Critical" : a.healthChecks[0].riskScore > 40 ? "Needs Attention" : "Low") : "Low",
            arr: a.arrValue || "$120,000",
            renewal: a.renewalDate ? new Date(a.renewalDate).toLocaleDateString() : "2026-12-15",
            lastInt: "Recent",
            tickets: a.clientInteractions?.length || 0,
            insights: a.healthChecks?.[0] ? JSON.parse(a.healthChecks[0].rootCauses || "[]").length : 0,
            graphStatus: "Synced",
            rawAccount: a
          })));
        }
      } catch (e) {
        console.error("Failed to load backend dashboard API data:", e);
      } finally {
        setLoading(false);
      }
    }
    loadInitialData();
  }, [activeView]);

  // Fetch Pre-call Brief on demand
  const handleGenerateBrief = async (tenantId: string) => {
    setIsBriefLoading(true);
    try {
      const briefRes = await fetch(`${API_BASE}/accounts/${tenantId}/brief`);
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
      const response = await fetch(`${API_BASE}/accounts/demo-tenant-123/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: queryText })
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
    try {
      const res = await fetch(`${API_BASE}/health/${correctionTargetId}/correct`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ correctionReason: correctionReasonInput })
      });
      if (res.ok) {
        setShowCorrectionModal(false);
        setCorrectionReasonInput("");
        // Reload dashboard overview
        const ovRes = await fetch(`${API_BASE}/dashboard/overview?tenantId=demo-tenant-123`);
        if (ovRes.ok) {
          setOverviewData(await ovRes.json());
        }
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
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span className="font-semibold text-white tracking-wide">{activeView}</span>
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
                      <ReBarChart data={salesData} barGap={0} barCategoryGap="40%">
                        <ReXAxis dataKey="day" stroke="#454545" fontSize={10} tickLine={false} axisLine={false} interval="preserveStartEnd" dy={4} />
                        <ReYAxis stroke="#454545" fontSize={10} tickLine={false} axisLine={false} domain={[0, 20]} />
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
                      <ReBarChart data={campaignData} barSize={6}>
                        <ReXAxis dataKey="name" stroke="#454545" fontSize={10} tickLine={false} axisLine={false} />
                        <Bar dataKey="val">
                          {campaignData.map((entry, index) => (
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
                      { label: "Product views", value: 72000, displayValue: "72K" },
                      { label: "Add to cart", value: 38200, displayValue: "38.2K" },
                      { label: "Checkout", value: 16800, displayValue: "16.8K" },
                      { label: "Purchase", value: 5600, displayValue: "5.6K" },
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
                      <div className="text-2xl font-bold tracking-tight text-white">1,842</div>
                      <div className="text-xs text-muted-foreground">Total orders in last 30 days</div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-5 gap-6 items-center">
                    <div className="md:col-span-2 flex justify-center relative">
                      <PieChart
                        data={[
                          { label: "Organic search", value: 698, color: "url(#diagonalHatch)" },
                          { label: "Direct", value: 516, color: "url(#horizontalHatch)" },
                          { label: "Referral", value: 276, color: "url(#verticalHatch)" },
                          { label: "Paid social", value: 221, color: "url(#gridHatch)" },
                          { label: "Others", value: 131, color: "#17171d" },
                        ]}
                        size={160}
                      >
                        {[...Array(5)].map((_, idx) => (
                          <PieSlice
                            key={idx}
                            index={idx}
                            data={[
                              { label: "Organic search", value: 698, color: "url(#diagonalHatch)" },
                              { label: "Direct", value: 516, color: "url(#horizontalHatch)" },
                              { label: "Referral", value: 276, color: "url(#verticalHatch)" },
                              { label: "Paid social", value: 221, color: "url(#gridHatch)" },
                              { label: "Others", value: 131, color: "#17171d" },
                            ]}
                            innerRadius={0}
                          />
                        ))}
                      </PieChart>
                    </div>

                    <div className="md:col-span-3 space-y-3.5 pr-2">
                      {[
                        { label: "Organic search", value: "698", pct: "37.9%", color: "url(#diagonalHatch)", isPattern: true },
                        { label: "Direct", value: "516", pct: "28.0%", color: "url(#horizontalHatch)", isPattern: true },
                        { label: "Referral", value: "276", pct: "15.0%", color: "url(#verticalHatch)", isPattern: true },
                        { label: "Paid social", value: "221", pct: "12.0%", color: "url(#gridHatch)", isPattern: true },
                        { label: "Others", value: "131", pct: "7.1%", color: "#17171d", isPattern: false },
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
                    <span>12 months</span>
                  </div>
                  <div className="space-y-3.5 pt-2">
                    {[
                      { label: "Review Tickets", val: "41 tasks", pct: 75 },
                      { label: "Renewals Due", val: "9 contracts", pct: 60 },
                      { label: "Health Audits", val: "12 checks", pct: 40 },
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
                        Managing 142 enterprise customers
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
                      { title: "Review at Risk", desc: "8 critical alerts open." },
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
                      <div key={idx} className="bg-[#121216]/50 p-4 border border-[#1a1a1f] flex flex-col md:flex-row justify-between items-start md:items-center gap-4 relative">
                        <CornerBrackets />
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="px-2 py-0.5 bg-rose-500/10 text-rose-500 border border-rose-500/20 text-[9px] font-bold rounded">
                              {rec.impact || "High"} Impact
                            </span>
                            <span className="text-xs font-bold text-white">{rec.title}</span>
                          </div>
                          <p className="text-xs text-muted-foreground">{rec.reason}</p>
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
                      Account Owner: Sarah Jenkins • ARR: $145,000 • Renewal Date: Oct 12, 2026
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
                      <p className="text-xs text-white mt-1">40% adoption drop in core modules and key contact transition last month.</p>
                    </div>
                    <div className="bg-[#121216]/50 p-3 border border-[#1a1a1f]">
                      <div className="text-[10px] text-emerald-400 uppercase font-bold">Growth opportunity</div>
                      <p className="text-xs text-white mt-1">Expressed interest in cognitive graph indexing for their support department.</p>
                    </div>
                    <div className="flex justify-between items-center text-xs pt-2">
                      <span className="text-muted-foreground">AI Confidence Score</span>
                      <span className="font-bold text-white bg-emerald-500/10 text-emerald-500 px-2 py-0.5 rounded">94%</span>
                    </div>
                  </div>
                </div>

                {/* Health radar simulator */}
                <div className="bg-card/45 border border-[#1a1a1f] rounded-none p-5 flex flex-col justify-between relative">
                  <CornerBrackets />
                  <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Adoption Health radar</div>
                  <div className="space-y-2.5">
                    {[
                      { label: "Product usage", score: 85, color: "bg-emerald-500" },
                      { label: "Support history", score: 40, color: "bg-rose-500" },
                      { label: "Sentiment Index", score: 55, color: "bg-amber-500" },
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
                    {[
                      { name: "Johnathan Wick", role: "Decision Maker (CTO)", sentiment: "Positive", strength: 80 },
                      { name: "Helen Cho", role: "Technical Sponsor", sentiment: "Neutral", strength: 65 },
                      { name: "Marcus Brody", role: "CS Champion", sentiment: "Negative", strength: 30 },
                    ].map((stake, i) => (
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
                          <div className="text-[9px] text-muted-foreground mt-0.5">Strength: {stake.strength}%</div>
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
                  {[
                    { type: "Meeting Transcript", title: "CS Executive Alignment Call", desc: "Pricing and expansion concerns raised by Wick. Mentioned budget freezes in their tech org.", date: "Today, 10:14 AM", sentiment: "Negative", source: "Zoom processed" },
                    { type: "Support Ticket", title: "API Endpoint Timeout Error #40921", desc: "Database lock contention triggered 504 gateway response on staging. Handed over to engineer team.", date: "Yesterday, 3:42 PM", sentiment: "Critical", source: "Zendesk sync" },
                    { type: "AI Insight Event", title: "Competitor mention detected", desc: "Copilot extracted relation: Wick mentioned 'RelateGraph pricing model seems more elastic' during conversation.", date: "June 28, 2026", sentiment: "Warning", source: "Cognitive extractor" },
                  ].map((evt, i) => (
                    <div key={i} className="relative">
                      {/* Timeline dot */}
                      <span className="absolute -left-[31px] top-1 w-2.5 h-2.5 rounded-full bg-white border-4 border-[#070708]" />
                      <div className="space-y-1">
                        <div className="flex justify-between items-center text-xs">
                          <span className="font-semibold text-white">{evt.type} — {evt.title}</span>
                          <span className="text-[10px] text-muted-foreground">{evt.date}</span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1 max-w-2xl">{evt.desc}</p>
                        <div className="flex items-center gap-3 text-[10px] text-muted-foreground pt-1.5">
                          <span className="px-2 py-0.5 bg-neutral-900 border border-[#121216] rounded-full">{evt.source}</span>
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
                                  {msg.citations?.map((c, i) => (
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
                      onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                      placeholder="Ask copilot about customer health, support ticket logs, or graph context..."
                      className="flex-1 bg-secondary/20 border border-[#1a1a1f] rounded-lg px-3 py-2 text-xs outline-none focus:border-primary/50 text-white"
                    />
                    <button 
                      onClick={handleSendMessage}
                      className="px-4 py-2 bg-white text-black hover:bg-neutral-200 font-semibold rounded-lg text-xs transition-colors shrink-0"
                    >
                      Send Query
                    </button>
                  </div>
                </div>

                {/* Sidebar context panel */}
                <div className="bg-card/45 border border-[#1a1a1f] rounded-none p-5 relative space-y-4">
                  <CornerBrackets />
                  <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Retrieved Context</div>
                  <div className="space-y-3 text-xs">
                    <div className="p-3 bg-[#121216]/50 border border-[#1a1a1f] rounded space-y-1">
                      <div className="text-[10px] text-neutral-400 font-bold uppercase">Graph Entities Used</div>
                      <div className="text-white text-[11px] font-mono">
                        - Customer: Acme Corp<br />
                        - CTO: Johnathan Wick<br />
                        - Competitor: RelateGraph
                      </div>
                    </div>

                    <div className="p-3 bg-[#121216]/50 border border-[#1a1a1f] rounded space-y-1">
                      <div className="text-[10px] text-neutral-400 font-bold uppercase">Linked Timelines</div>
                      <div className="text-white text-[11px]">
                        - Zoom Alignment Call (July 04)<br />
                        - Zendesk support #40921 (July 03)
                      </div>
                    </div>

                    <div className="p-3 bg-[#121216]/50 border border-[#1a1a1f] rounded space-y-1">
                      <div className="text-[10px] text-neutral-400 font-bold uppercase">Cognitive Confidence</div>
                      <div className="text-emerald-500 font-bold text-sm">96.4% ACCURACY</div>
                    </div>
                  </div>
                </div>
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

                <div className="flex gap-2">
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
                <svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg">
                  {/* Nodes Connections Edges lines */}
                  <line x1="200" y1="150" x2="350" y2="250" stroke="#1a1a1f" strokeWidth="2" />
                  <line x1="350" y1="250" x2="500" y2="150" stroke="#1a1a1f" strokeWidth="2" />
                  <line x1="350" y1="250" x2="350" y2="400" stroke="#1a1a1f" strokeWidth="2" strokeDasharray="4 4" />
                  <line x1="500" y1="150" x2="650" y2="200" stroke="#1a1a1f" strokeWidth="2" />
                  
                  {/* Left Node: Competitor */}
                  <circle cx="200" cy="150" r="18" fill="#301515" stroke="#ef4444" strokeWidth="2" />
                  <text x="200" y="154" fill="#ef4444" fontSize="9" fontWeight="bold" textAnchor="middle">COMP</text>
                  <text x="200" y="125" fill="#a3a3a3" fontSize="10" fontWeight="semibold" textAnchor="middle">RelateGraph</text>

                  {/* Center Node: Customer */}
                  <circle cx="350" cy="250" r="28" fill="#1b1b22" stroke="#ffffff" strokeWidth="2" />
                  <text x="350" y="254" fill="#ffffff" fontSize="11" fontWeight="bold" textAnchor="middle">ACME</text>
                  <text x="350" y="210" fill="#ffffff" fontSize="12" fontWeight="bold" textAnchor="middle">Acme Corp</text>

                  {/* Right Node: Stakeholder CTO */}
                  <circle cx="500" cy="150" r="22" fill="#152815" stroke="#10b981" strokeWidth="2" />
                  <text x="500" y="154" fill="#10b981" fontSize="10" fontWeight="bold" textAnchor="middle">CTO</text>
                  <text x="500" y="120" fill="#a3a3a3" fontSize="10" fontWeight="semibold" textAnchor="middle">John Wick</text>

                  {/* Bottom Node: Feature Request */}
                  <circle cx="350" cy="400" r="20" fill="#2b2010" stroke="#f59e0b" strokeWidth="2" />
                  <text x="350" y="404" fill="#f59e0b" fontSize="10" fontWeight="bold" textAnchor="middle">FEAT</text>
                  <text x="350" y="435" fill="#a3a3a3" fontSize="10" fontWeight="semibold" textAnchor="middle">Feature X</text>
                </svg>

                {/* Legend overlay */}
                <div className="absolute bottom-5 left-5 bg-card/90 border border-[#1a1a1f] p-3 text-[10px] space-y-1.5">
                  <div className="font-bold text-white uppercase tracking-wider mb-1">Graph Legend</div>
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-white" />
                    <span className="text-muted-foreground">Customer accounts</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    <span className="text-muted-foreground">Stakeholders</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-rose-500" />
                    <span className="text-muted-foreground">Competitors</span>
                  </div>
                </div>

                {/* Floating properties sidebar detail */}
                <div className="absolute top-5 right-5 w-64 bg-card/90 border border-[#1a1a1f] p-4 text-xs space-y-3">
                  <div className="font-bold text-white pb-1 border-b border-[#1a1a1f]">Node Inspector</div>
                  <div className="space-y-2">
                    <div>
                      <span className="text-muted-foreground block text-[9px] uppercase font-bold">Selected Node</span>
                      <span className="text-white font-bold text-sm">Acme Corp</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground block text-[9px] uppercase font-bold">Type</span>
                      <span className="text-white">Customer Account</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground block text-[9px] uppercase font-bold">Degree Centrality</span>
                      <span className="text-white font-mono">14 connected edges</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground block text-[9px] uppercase font-bold">Synchronized</span>
                      <span className="text-emerald-500 font-semibold">Active Cognee Sync</span>
                    </div>
                  </div>
                </div>
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
                    8 Critical Risk Events
                  </span>
                </div>
              </div>

              {/* Insights list */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[
                  { cat: "Pricing Concerns", title: "Acme Corp: Pricing friction detected in transcripts", desc: "Wick mentioned 'budget cuts are forcing us to look at cheaper solutions like RelateGraph'.", priority: "High", conf: "94%" },
                  { cat: "Product Adoption", title: "Globex Inc: Core feature adoption dropped by 20%", desc: "Significant drop in storage usage metrics. Users didn't trigger 'Graph build' in 14 days.", priority: "Medium", conf: "88%" },
                  { cat: "Technical Issue", title: "Umbrella Corp: Critical support ticket escalation", desc: "Ticket #41920 escalated to L3 engineering regarding API Keys validation delays.", priority: "Critical", conf: "97%" },
                  { cat: "Executive Stakeholder", title: "Initech Corp: Sponsor transition alert", desc: "CTO Johnathan Wick announced departure. New sponsor onboarding strategy recommended.", priority: "High", conf: "91%" },
                ].map((ins, i) => (
                  <div key={i} className="bg-card/45 border border-[#1a1a1f] rounded-none p-5 space-y-3.5 relative">
                    <CornerBrackets />
                    <div className="flex justify-between items-center border-b border-[#1a1a1f] pb-2">
                      <span className="text-[10px] text-primary uppercase font-bold tracking-wider">{ins.cat}</span>
                      <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${
                        ins.priority === "Critical" ? "bg-rose-500/10 text-rose-500" :
                        ins.priority === "High" ? "bg-amber-500/10 text-amber-500" : "bg-neutral-600/10 text-muted-foreground"
                      }`}>
                        {ins.priority} Priority
                      </span>
                    </div>

                    <div className="space-y-1">
                      <h3 className="text-sm font-semibold text-white">{ins.title}</h3>
                      <p className="text-xs text-muted-foreground mt-1">{ins.desc}</p>
                    </div>

                    <div className="flex justify-between items-center pt-2 text-[10px]">
                      <div className="flex gap-2">
                        <span className="text-muted-foreground">Confidence: <strong>{ins.conf}</strong></span>
                      </div>
                      <button 
                        onClick={() => alert("Insight resolved and synchronized to Cognee.")}
                        className="px-2.5 py-1 bg-white text-black hover:bg-neutral-200 rounded font-semibold text-[10px]"
                      >
                        Resolve Insight
                      </button>
                    </div>
                  </div>
                ))}
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
                      { name: "Q1", val: 40000 },
                      { name: "Q2", val: 65000 },
                      { name: "Q3", val: 92500 },
                      { name: "Q4 (Est)", val: 120000 },
                    ].map((exposure, i) => (
                      <div key={i} className="flex-1 flex flex-col items-center gap-2">
                        <span className="text-[10px] text-white font-bold">${exposure.val / 1000}K</span>
                        <div className="w-full bg-[#1c1c22] rounded-none" style={{ height: `${(exposure.val / 120000) * 150}px` }} />
                        <span className="text-[10px] text-muted-foreground font-semibold">{exposure.name}</span>
                      </div>
                    ))}
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
                    {[
                      { name: "Jan", val: 80 },
                      { name: "Mar", val: 65 },
                      { name: "May", val: 78 },
                      { name: "Jul", val: 54 },
                    ].map((sent, i) => (
                      <div key={i} className="flex-1 flex flex-col items-center gap-2">
                        <span className="text-[10px] text-white font-bold">{sent.val}%</span>
                        <div className="w-full bg-white rounded-none" style={{ height: `${(sent.val / 100) * 150}px` }} />
                        <span className="text-[10px] text-muted-foreground font-semibold">{sent.name}</span>
                      </div>
                    ))}
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
                    <p className="text-xs text-primary font-semibold mt-0.5">Subject Account: Acme Corp • Prepared by RetainGraph AI</p>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-muted-foreground block">Prep Score</span>
                    <span className="text-lg font-black text-emerald-500">92 / 100</span>
                  </div>
                </div>

                <div className="space-y-4 text-xs text-muted-foreground">
                  <div className="space-y-1">
                    <h3 className="text-xs font-bold text-white uppercase tracking-wider">Executive Summary</h3>
                    <p>Acme Corp is presenting high risk due to API Key authorization failures and support backlogs. Johnathan Wick has scheduled this call to alignment pricing concerns and expansion potential.</p>
                  </div>

                  <div className="space-y-1">
                    <h3 className="text-xs font-bold text-white uppercase tracking-wider">Key Talking Points</h3>
                    <ul className="list-disc pl-5 space-y-1.5">
                      <li>Highlight engineers resolving the API gateway timeouts.</li>
                      <li>Address the competitive comparison with *RelateGraph* directly with Wick.</li>
                      <li>Offer a dedicated architect to sync their Neo4j/Cognee data pipelines.</li>
                    </ul>
                  </div>

                  <div className="space-y-1">
                    <h3 className="text-xs font-bold text-white uppercase tracking-wider">Open Commitments</h3>
                    <p>Deliver the custom webhook connector module requested by Cho on Support Ticket #40921 by next Wednesday.</p>
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
