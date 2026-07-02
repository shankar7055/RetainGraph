import { useState } from 'react';
import { Play, Database, Network } from 'lucide-react';

export default function ComparisonView() {
  const [question, setQuestion] = useState("Why is this account at risk?");
  const [naiveResponse, setNaiveResponse] = useState("");
  const [graphResponse, setGraphResponse] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);

  const runComparison = async () => {
    if (!question.trim() || isStreaming) return;
    
    setIsStreaming(true);
    setNaiveResponse("");
    setGraphResponse("");

    const fetchStream = async (endpoint: string, setter: React.Dispatch<React.SetStateAction<string>>) => {
      try {
        const res = await fetch(`http://localhost:3000${endpoint}`, {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'x-api-key': 'demo-key-456'
          },
          body: JSON.stringify({ question })
        });
        
        if (!res.ok) throw new Error('Stream failed');
        const reader = res.body?.getReader();
        const decoder = new TextDecoder();
        
        if (reader) {
          let done = false;
          while (!done) {
            const { value, done: readerDone } = await reader.read();
            done = readerDone;
            if (value) {
              setter(prev => prev + decoder.decode(value, { stream: !done }));
            }
          }
        }
      } catch {
        setter(prev => prev + "\n[Error: Failed to fetch response]");
      }
    };

    // Run both streams concurrently
    await Promise.all([
      fetchStream('/api/chat/naive', setNaiveResponse),
      fetchStream('/api/chat', setGraphResponse)
    ]);
    
    setIsStreaming(false);
  };

  return (
    <div className="w-full h-[calc(100vh-100px)] flex flex-col">
      <div className="mb-6 flex items-end justify-between bg-white p-6 rounded-xl border shadow-sm">
        <div className="flex-1 mr-6">
          <label className="block text-sm font-semibold text-slate-700 mb-2">Hardcoded Demo Question</label>
          <input 
            type="text" 
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            className="w-full px-4 py-2.5 bg-slate-50 border rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={isStreaming}
          />
        </div>
        <button 
          onClick={runComparison}
          disabled={isStreaming || !question.trim()}
          className="flex items-center px-6 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold rounded-lg transition-colors"
        >
          <Play className="w-4 h-4 mr-2" />
          {isStreaming ? 'Running...' : 'Run Comparison'}
        </button>
      </div>

      <div className="flex-1 grid grid-cols-2 gap-6 min-h-0">
        {/* Left: Naive Vector Search */}
        <div className="flex flex-col border rounded-xl overflow-hidden bg-white shadow-sm">
          <div className="bg-slate-100 px-4 py-3 border-b flex items-center justify-between">
            <div className="flex items-center">
              <Database className="w-4 h-4 text-slate-500 mr-2" />
              <h3 className="font-bold text-slate-800">Flat Search <span className="text-slate-400 font-normal">(No Memory)</span></h3>
            </div>
            <span className="text-xs font-semibold px-2 py-1 bg-slate-200 text-slate-600 rounded">/api/chat/naive</span>
          </div>
          <div className="flex-1 p-6 overflow-y-auto whitespace-pre-wrap text-sm text-slate-700 bg-slate-50">
            {naiveResponse || (
              <span className="text-slate-400 italic">Click 'Run Comparison' to stream naive vector results (uses only latest interaction).</span>
            )}
          </div>
        </div>

        {/* Right: Graph Search */}
        <div className="flex flex-col border rounded-xl overflow-hidden bg-white shadow-sm ring-1 ring-blue-500/20">
          <div className="bg-blue-50 px-4 py-3 border-b border-blue-100 flex items-center justify-between">
            <div className="flex items-center">
              <Network className="w-4 h-4 text-blue-600 mr-2" />
              <h3 className="font-bold text-blue-900">Cognee Graph Memory</h3>
            </div>
            <span className="text-xs font-semibold px-2 py-1 bg-blue-100 text-blue-700 rounded">/api/chat</span>
          </div>
          <div className="flex-1 p-6 overflow-y-auto whitespace-pre-wrap text-sm text-slate-700 bg-slate-50">
            {graphResponse || (
              <span className="text-slate-400 italic">Click 'Run Comparison' to stream graph-aware results (traverses full historical context).</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
