import { useState } from 'react';
import { Search, Loader2, Network } from 'lucide-react';

export default function PatternDetection() {
  const [query, setQuery] = useState('Which accounts are reporting API reliability issues?');
  const [isScanning, setIsScanning] = useState(false);
  const [results, setResults] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const handleScan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setIsScanning(true);
    setError(null);

    try {
      const res = await fetch(`http://localhost:3000/api/patterns?query=${encodeURIComponent(query)}`, {
        headers: {
          'x-api-key': 'demo-key-456'
        }
      });
      if (!res.ok) throw new Error('Failed to scan patterns');
      const data = await res.json();
      setResults(data);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'An error occurred during scan.');
    } finally {
      setIsScanning(false);
    }
  };

  return (
    <div className="w-full flex flex-col space-y-6">
      <div className="bg-white p-6 rounded-xl border shadow-sm">
        <div className="flex items-center space-x-3 mb-4">
          <Network className="w-6 h-6 text-purple-600" />
          <h2 className="text-xl font-bold text-slate-800">Cross-Account Pattern Detection</h2>
        </div>
        <p className="text-sm text-slate-600 mb-6">
          Query the entire customer intelligence graph to identify systemic product issues, feature requests, or churn risks shared across multiple tenants.
        </p>

        <form onSubmit={handleScan} className="flex space-x-3">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input 
              type="text" 
              value={query}
              onChange={e => setQuery(e.target.value)}
              className="w-full pl-11 pr-4 py-3 bg-slate-50 border focus:bg-white focus:border-purple-500 focus:ring-2 focus:ring-purple-200 rounded-xl text-sm transition-all outline-none"
              placeholder="e.g., Which accounts are frustrated with the new UI update?"
            />
          </div>
          <button 
            type="submit"
            disabled={isScanning || !query.trim()}
            className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-xl disabled:opacity-50 transition-colors flex items-center"
          >
            {isScanning ? (
              <><Loader2 className="w-5 h-5 mr-2 animate-spin" /> Scanning Graph...</>
            ) : (
              'Scan All Accounts'
            )}
          </button>
        </form>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-xl border border-red-200 text-sm">
          {error}
        </div>
      )}

      {results && !isScanning && (
        <div className="space-y-6 animate-in fade-in duration-300">
          <div className="bg-gradient-to-br from-purple-50 to-white p-6 rounded-xl border shadow-sm">
            <h3 className="text-xs font-bold text-purple-600 uppercase tracking-wider mb-2">Pattern Summary</h3>
            <div className="flex items-center mb-4">
              <span className="px-3 py-1 bg-purple-200 text-purple-800 rounded-full text-xs font-bold mr-3">
                {results.commonRootCause || 'Systemic Issue'}
              </span>
            </div>
            <p className="text-slate-700 leading-relaxed text-sm">
              {results.summary}
            </p>
          </div>

          <div>
            <h3 className="text-sm font-bold text-slate-800 mb-4 px-1">Affected Tenants ({results.affectedTenants?.length || 0})</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {results.affectedTenants?.map((t: any, idx: number) => (
                <div key={idx} className="bg-white p-5 rounded-xl border shadow-sm">
                  <div className="flex justify-between items-center mb-3">
                    <h4 className="font-bold text-slate-800">{t.name}</h4>
                    <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${t.riskScore > 70 ? 'bg-rose-100 text-rose-700' : 'bg-amber-100 text-amber-700'}`}>
                      Risk Score: {t.riskScore}
                    </span>
                  </div>
                  <div className="bg-slate-50 p-3 rounded-lg border text-sm text-slate-600 italic">
                    "{t.evidence}"
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
