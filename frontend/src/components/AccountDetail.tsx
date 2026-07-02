import { useEffect, useState } from 'react';
import { ArrowLeft, MessageSquare, Send, Calendar, AlertTriangle, XCircle, RotateCcw, Mail, Copy, X, Database, ActivitySquare } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function AccountDetail({ tenantId, onBack }: { tenantId: string, onBack: () => void }) {
  const [tenant, setTenant] = useState<any>(null);
  const [chatInput, setChatInput] = useState('');
  const [chatLog, setChatLog] = useState<{ role: 'user'|'ai', content: string }[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [healthHistory, setHealthHistory] = useState<any[]>([]);
  const [graphStats, setGraphStats] = useState<any>(null);
  const [isDraftingEmail, setIsDraftingEmail] = useState(false);
  const [emailDraft, setEmailDraft] = useState<{subject: string, body: string} | null>(null);
  const [ingestPayload, setIngestPayload] = useState("");
  const [isIngesting, setIsIngesting] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  useEffect(() => {
    fetchTenant();
    fetchHealthHistory();
    fetchGraphStats();
    const interval = setInterval(() => {
      fetchHealthHistory();
    }, 15000);
    return () => clearInterval(interval);
  }, [tenantId]);

  const fetchTenant = () => {
    fetch(`http://localhost:3000/api/tenants/${tenantId}`)
      .then(res => res.json())
      .then(data => setTenant(data))
      .catch(console.error);
  };

  const fetchHealthHistory = () => {
    fetch(`http://localhost:3000/api/tenants/${tenantId}/health-history`, {
      headers: { 
        'x-api-key': 'demo-key-456',
        'x-tenant-id': tenantId 
      }
    })
      .then(res => res.json())
      .then(data => setHealthHistory(data))
      .catch(console.error);
  };

  const fetchGraphStats = () => {
    fetch(`http://localhost:3000/api/tenants/${tenantId}/graph-stats`, {
      headers: { 
        'x-api-key': 'demo-key-456',
        'x-tenant-id': tenantId 
      }
    })
      .then(res => res.json())
      .then(data => setGraphStats(data))
      .catch(console.error);
  };

  const handleDismiss = async (healthRecordId: string) => {
    const reason = window.prompt("Why is this a false alarm?");
    if (!reason) return;

    try {
      const res = await fetch('http://localhost:3000/api/health/correct', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': 'demo-key-456',
          'x-tenant-id': tenantId
        },
        body: JSON.stringify({ healthRecordId, correctionReason: reason })
      });
      if (res.ok) {
        fetchTenant(); // Refresh to show dismissed status
      } else {
        alert("Failed to dismiss.");
      }
    } catch (e) {
      console.error(e);
      alert("Error dismissing record.");
    }
  };

  const handleReset = async () => {
    if (!window.confirm("Are you sure you want to completely reset this account's memory graph? This cannot be undone.")) return;

    try {
      const res = await fetch(`http://localhost:3000/api/tenants/${tenantId}/forget`, {
        method: 'POST',
        headers: {
          'x-api-key': 'demo-key-456',
          'x-tenant-id': tenantId
        }
      });
      if (res.ok) {
        fetchTenant();
      } else {
        alert("Failed to reset memory.");
      }
    } catch (e) {
      console.error(e);
      alert("Error resetting memory.");
    }
  };

  const handleGenerateEmail = async () => {
    setIsDraftingEmail(true);
    try {
      const res = await fetch(`http://localhost:3000/api/tenants/${tenantId}/generate-email`, {
        method: 'POST',
        headers: { 
          'x-api-key': 'demo-key-456',
          'x-tenant-id': tenantId
        }
      });
      if (!res.ok) throw new Error('Failed to generate email');
      const data = await res.json();
      setEmailDraft(data);
    } catch (err) {
      console.error(err);
      alert('Failed to generate email draft.');
    } finally {
      setIsDraftingEmail(false);
    }
  };

  const handleIngest = async () => {
    if (!ingestPayload.trim()) return;
    setIsIngesting(true);
    try {
      const res = await fetch('http://localhost:3000/api/interactions/ingest', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': 'demo-key-456',
          'x-tenant-id': tenantId
        },
        body: JSON.stringify({ payload: ingestPayload })
      });
      if (res.ok) {
        setIngestPayload("");
        alert('Interaction ingested — health worker will re-evaluate within 60 seconds (or run analysis now).');
        fetchTenant();
      } else {
        alert('Failed to ingest interaction.');
      }
    } catch (err) {
      console.error(err);
      alert('Failed to ingest interaction.');
    } finally {
      setIsIngesting(false);
    }
  };

  const handleAnalyze = async () => {
    setIsAnalyzing(true);
    try {
      const res = await fetch(`http://localhost:3000/api/tenants/${tenantId}/analyze`, {
        method: 'POST',
        headers: {
          'x-api-key': 'demo-key-456',
          'x-tenant-id': tenantId
        }
      });
      if (res.ok) {
        fetchHealthHistory();
        fetchTenant();
      } else {
        alert('Analysis failed.');
      }
    } catch (err) {
      console.error(err);
      alert('Analysis failed.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleCopyEmail = () => {
    if (emailDraft) {
      navigator.clipboard.writeText(`Subject: ${emailDraft.subject}\n\n${emailDraft.body}`);
      alert("Email copied to clipboard!");
    }
  };

  const handleChat = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || isStreaming) return;

    const q = chatInput;
    setChatInput('');
    setChatLog(prev => [...prev, { role: 'user', content: q }, { role: 'ai', content: '' }]);
    setIsStreaming(true);

    try {
      const res = await fetch('http://localhost:3000/api/chat', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'x-api-key': 'demo-key-456',
          'x-tenant-id': tenantId
        },
        body: JSON.stringify({ question: q })
      });

      if (!res.ok) throw new Error('Chat failed');
      
      const reader = res.body?.getReader();
      const decoder = new TextDecoder();
      
      if (reader) {
        let done = false;
        while (!done) {
          const { value, done: readerDone } = await reader.read();
          done = readerDone;
          if (value) {
            const chunk = decoder.decode(value, { stream: !done });
            setChatLog(prev => {
              const newLog = [...prev];
              newLog[newLog.length - 1].content += chunk;
              return newLog;
            });
          }
        }
      }
    } catch (err) {
      console.error(err);
      setChatLog(prev => {
        const newLog = [...prev];
        newLog[newLog.length - 1].content = 'Error: Failed to fetch response from the engine.';
        return newLog;
      });
    } finally {
      setIsStreaming(false);
    }
  };

  if (!tenant) return <div className="p-10 text-slate-500">Loading...</div>;

  const health = tenant.healthChecks?.[0];
  let rootCauses: any[] = [];
  if (health?.rootCauses) {
    try { rootCauses = JSON.parse(health.rootCauses); } catch { /* ignore */ }
  }

  return (
    <div className="flex flex-col md:flex-row gap-6 w-full h-[calc(100vh-100px)]">
      {/* Left Column: Context & Health */}
      <div className="w-full md:w-1/3 flex flex-col space-y-6 overflow-y-auto pr-2 pb-10">
        <button onClick={onBack} className="flex items-center text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors">
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Dashboard
        </button>

        <div className="bg-white p-6 rounded-xl border shadow-sm">
          <h2 className="text-2xl font-bold text-slate-900 mb-1">{tenant.name}</h2>
          <p className="text-sm text-slate-500 mb-6 capitalize">{tenant.billingTier} Tier</p>
          
          {health && health.status === 'reset' ? (
            <div className="mt-4 p-4 bg-amber-50 rounded-xl border border-amber-200 flex flex-col items-center text-center">
              <RotateCcw className="w-8 h-8 text-amber-500 mb-2" />
              <p className="text-sm font-bold text-amber-800 mb-1">Memory Reset</p>
              <p className="text-xs text-amber-700">This account's intelligence graph has been completely cleared. Waiting for new data to evaluate...</p>
            </div>
          ) : health ? (
            <div className={health.status === 'dismissed' ? 'opacity-60' : ''}>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-semibold text-slate-700">Risk Score</span>
                  {health.status === 'dismissed' && (
                    <span className="px-2 py-0.5 rounded bg-slate-200 text-slate-600 text-xs font-bold">Dismissed</span>
                  )}
                </div>
                <div className="flex items-center space-x-2">
                  <span className={`px-3 py-1 rounded-full text-sm font-bold ${health.riskScore > 70 ? 'bg-rose-100 text-rose-700' : 'bg-emerald-100 text-emerald-700'}`}>
                    {health.riskScore} / 100
                  </span>
                </div>
              </div>
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Root Causes</h3>
              <div className="space-y-4">
                {rootCauses.map((cause, i) => (
                  <div key={i} className="border-l-2 border-slate-200 pl-3">
                    <div className="flex justify-between text-sm font-semibold text-slate-800">
                      <span>{cause.category}</span>
                      <span className="text-slate-500">{cause.contribution_percent}%</span>
                    </div>
                    <p className="text-xs text-slate-600 mt-1">{cause.evidence}</p>
                  </div>
                ))}
              </div>
              <div className="mt-6 p-3 bg-blue-50 rounded-lg">
                <h4 className="text-xs font-bold text-blue-800 uppercase mb-1">Recommended Action</h4>
                <p className="text-sm text-blue-900">{health.recommendedAction}</p>
                
                {health.status === 'active' && health.riskScore > 40 && (
                  <button
                    onClick={handleGenerateEmail}
                    disabled={isDraftingEmail}
                    className="mt-3 w-full flex items-center justify-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg transition-colors disabled:opacity-50"
                  >
                    <Mail className="w-4 h-4 mr-2" />
                    {isDraftingEmail ? "Drafting Email..." : "Generate Outreach Email"}
                  </button>
                )}
              </div>
              
              {health.status !== 'dismissed' && (
                <button 
                  onClick={() => handleDismiss(health.id)}
                  className="mt-4 w-full flex items-center justify-center px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-semibold rounded-lg transition-colors"
                >
                  <XCircle className="w-4 h-4 mr-2 text-slate-500" />
                  Dismiss as False Alarm
                </button>
              )}
              {health.status === 'dismissed' && health.correctionReason && (
                <div className="mt-4 p-3 bg-slate-100 rounded-lg border border-slate-200">
                  <p className="text-xs font-bold text-slate-500 uppercase mb-1">Dismissal Reason</p>
                  <p className="text-sm text-slate-700 italic">"{health.correctionReason}"</p>
                </div>
              )}
              
              <button 
                onClick={handleReset}
                className="mt-3 w-full flex items-center justify-center px-4 py-2 bg-amber-50 hover:bg-amber-100 text-amber-700 text-sm font-semibold rounded-lg transition-colors border border-amber-200"
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                Mark as Renewed — Reset Memory
              </button>
              
              <button
                onClick={handleAnalyze}
                disabled={isAnalyzing}
                className="mt-3 w-full flex items-center justify-center px-4 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-sm font-semibold rounded-lg transition-colors border border-indigo-200 disabled:opacity-50"
              >
                <ActivitySquare className="w-4 h-4 mr-2" />
                {isAnalyzing ? "Running Analysis..." : "Run Analysis Now"}
              </button>
            </div>
          ) : (
            <p className="text-sm text-slate-500 italic">No health records generated yet.</p>
          )}
        </div>

        {/* Risk Score Over Time Chart */}
        <div className="bg-white p-6 rounded-xl border shadow-sm mt-6">
          <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center">
            Risk Score Over Time
          </h3>
          {healthHistory.length === 0 ? (
            <p className="text-sm text-slate-500 italic">No health records generated yet.</p>
          ) : healthHistory.length === 1 ? (
            <div className="h-48 flex items-center justify-center bg-slate-50 rounded-lg border border-dashed">
               <p className="text-sm text-slate-500 italic">More data points will appear as the worker runs</p>
            </div>
          ) : (
            <div className="h-48 w-full -ml-4">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={healthHistory} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis 
                    dataKey="createdAt" 
                    tickFormatter={(v) => new Date(v).toLocaleDateString(undefined, {month: 'short', day: 'numeric'})} 
                    fontSize={10} 
                    stroke="#94a3b8" 
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis 
                    domain={[0, 100]} 
                    fontSize={10} 
                    stroke="#94a3b8" 
                    tickLine={false}
                    axisLine={false}
                    width={40}
                  />
                  <Tooltip 
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload;
                        return (
                          <div className="bg-slate-900 text-white p-3 rounded-lg shadow-xl text-xs border border-slate-700">
                            <div className="font-medium text-slate-300 mb-1">{new Date(data.createdAt).toLocaleString()}</div>
                            <div className="flex items-center justify-between gap-4">
                              <span>Risk Score:</span>
                              <span className={`font-bold ${data.riskScore > 70 ? 'text-rose-400' : 'text-emerald-400'}`}>{data.riskScore}</span>
                            </div>
                            <div className="flex items-center justify-between gap-4 mt-1">
                              <span>Status:</span>
                              <span className="font-bold capitalize">{data.status}</span>
                            </div>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="riskScore" 
                    stroke="#3b82f6" 
                    strokeWidth={3} 
                    activeDot={{ r: 6, fill: '#2563eb', stroke: '#fff', strokeWidth: 2 }}
                    dot={(props: any) => {
                      const { cx, cy, payload, key } = props;
                      if (payload.status === 'dismissed') {
                        return <circle key={key} cx={cx} cy={cy} r={5} stroke="#94a3b8" strokeWidth={2} fill="white" />;
                      }
                      return <circle key={key} cx={cx} cy={cy} r={4} stroke="#3b82f6" strokeWidth={2} fill="#3b82f6" />;
                    }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        <div className="bg-white p-6 rounded-xl border shadow-sm mt-6">
          <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center">
            <Calendar className="w-4 h-4 mr-2 text-slate-400" /> Interaction Timeline
          </h3>
          <div className="space-y-4">
            {tenant.interactions?.map((int: any) => (
              <div key={int.id} className="text-sm">
                <div className="text-xs text-slate-400 mb-1">{new Date(int.createdAt).toLocaleString()}</div>
                <div className="p-3 bg-slate-50 border rounded-lg text-slate-700 whitespace-pre-wrap">
                  {int.payload}
                </div>
              </div>
            ))}
            {(!tenant.interactions || tenant.interactions.length === 0) && (
              <p className="text-sm text-slate-500">No interactions recorded.</p>
            )}
          </div>
        </div>

        {/* Simulate New Interaction Panel */}
        <div className="bg-white p-6 rounded-xl border shadow-sm mt-6">
          <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center">
            <MessageSquare className="w-4 h-4 mr-2 text-slate-400" /> Simulate New Interaction
          </h3>
          <div className="space-y-3">
            <textarea
              className="w-full text-sm p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50"
              rows={3}
              placeholder="Paste an email, support ticket, or meeting note..."
              value={ingestPayload}
              onChange={(e) => setIngestPayload(e.target.value)}
            />
            <button
              onClick={handleIngest}
              disabled={isIngesting || !ingestPayload.trim()}
              className="w-full flex items-center justify-center px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-sm font-semibold rounded-lg transition-colors disabled:opacity-50"
            >
              <Send className="w-4 h-4 mr-2" />
              {isIngesting ? "Ingesting..." : "Submit Interaction"}
            </button>
          </div>
        </div>

        {/* Memory Depth Card */}
        {graphStats && (
          <div className="bg-white p-5 rounded-xl border shadow-sm mt-6">
            <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center">
              <Database className="w-4 h-4 mr-2 text-slate-400" /> Memory Depth
            </h3>
            <div className="space-y-3 text-sm text-slate-700">
              <div className="flex justify-between items-center pb-2 border-b border-slate-100">
                <span className="text-slate-500">Interactions in memory</span>
                <span className="font-semibold">{graphStats.processedInteractions} / {graphStats.totalInteractions}</span>
              </div>
              <div className="flex justify-between items-center pb-2 border-b border-slate-100">
                <span className="text-slate-500">Tracking since</span>
                <span className="font-semibold">{graphStats.oldestMemoryDate ? new Date(graphStats.oldestMemoryDate).toLocaleDateString(undefined, {month: 'short', day: 'numeric', year: 'numeric'}) : 'N/A'}</span>
              </div>
              
              {graphStats.nodeCount !== null && (
                <div className="flex justify-between items-center pb-2 border-b border-slate-100">
                  <span className="text-slate-500">Graph complexity</span>
                  <span className="font-semibold text-blue-600">{graphStats.nodeCount} entities, {graphStats.edgeCount} relationships</span>
                </div>
              )}
              
              <div className="pt-1">
                <span className="text-[10px] text-slate-400 font-mono uppercase">Dataset ID: {graphStats.datasetId}</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Right Column: Chat Engine */}
      <div className="w-full md:w-2/3 flex flex-col bg-white border rounded-xl shadow-sm overflow-hidden h-full">
        <div className="px-6 py-4 border-b bg-slate-50 flex items-center">
          <MessageSquare className="w-5 h-5 text-blue-600 mr-2" />
          <h3 className="font-semibold text-slate-900">Zero-Latency Retrieval Engine</h3>
        </div>
        
        <div className="flex-1 p-6 overflow-y-auto space-y-6 bg-slate-50/50">
          {chatLog.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-slate-400 space-y-4">
              <AlertTriangle className="w-12 h-12 text-slate-200" />
              <p className="text-sm max-w-sm text-center">Ask questions about this account's history. The AI will traverse the Cognee graph to retrieve rich context.</p>
            </div>
          ) : (
            chatLog.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] rounded-2xl px-5 py-3 text-sm whitespace-pre-wrap ${
                  msg.role === 'user' 
                    ? 'bg-blue-600 text-white rounded-br-none' 
                    : 'bg-white border text-slate-800 shadow-sm rounded-bl-none'
                }`}>
                  {msg.content}
                </div>
              </div>
            ))
          )}
        </div>

        <form onSubmit={handleChat} className="p-4 bg-white border-t">
          <div className="relative">
            <input 
              type="text" 
              value={chatInput}
              onChange={e => setChatInput(e.target.value)}
              placeholder="E.g., Summarize the Acme Corp account risks..."
              className="w-full pl-4 pr-12 py-3 bg-slate-100 border-transparent focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200 rounded-xl text-sm transition-all outline-none"
              disabled={isStreaming}
            />
            <button 
              type="submit"
              disabled={isStreaming || !chatInput.trim()}
              className="absolute right-2 top-2 p-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg disabled:opacity-50 transition-colors"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </form>
      </div>

      {/* Email Draft Modal */}
      {emailDraft && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-6 py-4 border-b flex items-center justify-between bg-slate-50">
              <div className="flex items-center text-slate-800 font-bold">
                <Mail className="w-5 h-5 mr-2 text-blue-600" />
                Draft Outreach Email
              </div>
              <button onClick={() => setEmailDraft(null)} className="p-1 hover:bg-slate-200 rounded-md text-slate-500 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto flex-1">
              <div className="mb-4">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Subject</label>
                <div className="w-full px-4 py-2 bg-slate-50 border rounded-lg text-sm text-slate-900 font-medium">
                  {emailDraft.subject}
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Message Body</label>
                <div className="w-full px-4 py-3 bg-slate-50 border rounded-lg text-sm text-slate-800 whitespace-pre-wrap min-h-[200px]">
                  {emailDraft.body}
                </div>
              </div>
            </div>
            
            <div className="px-6 py-4 border-t bg-slate-50 flex justify-end gap-3">
              <button 
                onClick={() => setEmailDraft(null)}
                className="px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-200 rounded-lg transition-colors"
              >
                Close
              </button>
              <button 
                onClick={handleCopyEmail}
                className="flex items-center px-4 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors shadow-sm"
              >
                <Copy className="w-4 h-4 mr-2" />
                Copy to Clipboard
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
