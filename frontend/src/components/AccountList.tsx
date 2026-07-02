import { useEffect, useState } from 'react';
import { ArrowRight, Activity, ShieldAlert, CheckCircle2 } from 'lucide-react';

export default function AccountList({ onSelect }: { onSelect: (id: string) => void }) {
  const [tenants, setTenants] = useState<any[]>([]);

  const fetchTenants = async () => {
    try {
      const res = await fetch('http://localhost:3000/api/tenants');
      const data = await res.json();
      setTenants(data);
    } catch (e) {
      console.error('Failed to fetch tenants', e);
    }
  };

  useEffect(() => {
    fetchTenants();
    const interval = setInterval(fetchTenants, 15000);
    return () => clearInterval(interval);
  }, []);

  const getRiskColor = (score?: number) => {
    if (score === undefined) return 'bg-slate-100 text-slate-500 border-slate-200';
    if (score < 40) return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    if (score <= 70) return 'bg-amber-50 text-amber-700 border-amber-200';
    return 'bg-rose-50 text-rose-700 border-rose-200';
  };

  const getRiskIcon = (score?: number) => {
    if (score === undefined) return <Activity className="w-5 h-5" />;
    if (score < 40) return <CheckCircle2 className="w-5 h-5 text-emerald-600" />;
    if (score <= 70) return <Activity className="w-5 h-5 text-amber-600" />;
    return <ShieldAlert className="w-5 h-5 text-rose-600" />;
  };

  return (
    <div className="w-full">
      <h2 className="text-2xl font-semibold mb-6 flex items-center">
        Accounts Overview
        <span className="ml-3 px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-700 text-sm font-medium">
          Live Polling Active
        </span>
      </h2>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {tenants.map(t => {
          const health = t.healthChecks?.[0];
          let topCause = null;
          if (health?.rootCauses) {
            try {
              const causes = JSON.parse(health.rootCauses);
              topCause = causes.sort((a: any, b: any) => b.contribution_percent - a.contribution_percent)[0];
            } catch {
              // Ignore parse error
            }
          }

          return (
            <div 
              key={t.id} 
              onClick={() => onSelect(t.id)}
              className={`relative flex flex-col p-6 rounded-xl border cursor-pointer hover:shadow-md transition-all duration-200 group bg-white hover:-translate-y-1`}
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="font-bold text-lg text-slate-900 group-hover:text-blue-600 transition-colors">{t.name}</h3>
                  <p className="text-sm text-slate-500 capitalize">{t.billingTier} Tier</p>
                </div>
                <div className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-full border ${getRiskColor(health?.riskScore)}`}>
                  {getRiskIcon(health?.riskScore)}
                  <span className="font-semibold text-sm">
                    {health ? `${health.riskScore} / 100` : 'Pending'}
                  </span>
                </div>
              </div>
              
              {health ? (
                <div className="mt-2 space-y-3 flex-1">
                  <div>
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Top Risk Factor</p>
                    <p className="text-sm font-medium text-slate-800">
                      {topCause ? `${topCause.category} (${topCause.contribution_percent}%)` : 'Unknown'}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Status</p>
                    <p className="text-sm text-slate-600 line-clamp-2">{health.recommendedAction}</p>
                  </div>
                </div>
              ) : (
                <div className="mt-2 flex-1 flex items-center justify-center">
                  <p className="text-sm text-slate-400 italic">Waiting for next proactive scan...</p>
                </div>
              )}
              
              <div className="mt-6 flex items-center justify-end text-sm font-medium text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity">
                View Details <ArrowRight className="w-4 h-4 ml-1" />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
