import { useState } from 'react';
import AccountList from './components/AccountList';
import AccountDetail from './components/AccountDetail';
import ComparisonView from './components/ComparisonView';
import PatternDetection from './components/PatternDetection';
import { ActivitySquare } from 'lucide-react';

function App() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'compare' | 'patterns'>('dashboard');
  const [selectedTenantId, setSelectedTenantId] = useState<string | null>(null);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <header className="bg-white border-b px-6 py-4 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center space-x-3">
          <ActivitySquare className="h-6 w-6 text-blue-600" />
          <h1 className="text-xl font-bold text-slate-800 tracking-tight">RetainGraph</h1>
        </div>
        <div className="flex space-x-1 bg-slate-100 p-1 rounded-lg">
          <button 
            onClick={() => { setActiveTab('dashboard'); setSelectedTenantId(null); }}
            className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${activeTab === 'dashboard' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-500 hover:text-slate-700'}`}
          >
            Dashboard
          </button>
          <button 
            onClick={() => setActiveTab('compare')}
            className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${activeTab === 'compare' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-500 hover:text-slate-700'}`}
          >
            Compare Engine
          </button>
          <button 
            onClick={() => setActiveTab('patterns')}
            className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${activeTab === 'patterns' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-500 hover:text-slate-700'}`}
          >
            Pattern Detection
          </button>
        </div>
      </header>

      <main className="flex-1 p-6 flex max-w-7xl mx-auto w-full">
        {activeTab === 'dashboard' && (
          <div className="w-full">
            {selectedTenantId ? (
              <AccountDetail 
                tenantId={selectedTenantId} 
                onBack={() => setSelectedTenantId(null)} 
              />
            ) : (
              <AccountList onSelect={setSelectedTenantId} />
            )}
          </div>
        )}
        
        {activeTab === 'compare' && (
          <ComparisonView />
        )}
        
        {activeTab === 'patterns' && (
          <PatternDetection />
        )}
      </main>
    </div>
  );
}

export default App;
