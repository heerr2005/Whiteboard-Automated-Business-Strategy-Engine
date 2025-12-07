import React, { useState, useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, 
  ScatterChart, Scatter, ZAxis, Cell, AreaChart, Area
} from 'recharts';
import { 
  CheckCircle2, Target, Calendar, Users, AlertTriangle, Code, Download,
  Share2, Zap, LayoutDashboard, Clock, ArrowRight, UserCircle, BellRing, Check
} from 'lucide-react';
import { StrategyResult, AppStep, ActionItem, OKR, Risk } from '../types';
import ChatBot from './ChatBot';

interface StrategyCanvasProps {
  data: StrategyResult;
  onReset: () => void;
  status: AppStep;
}

// --- Toast System ---
interface Toast {
  id: number;
  message: string;
  type: 'success' | 'info';
}

const StrategyCanvas: React.FC<StrategyCanvasProps> = ({ data, onReset }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'okrs' | 'timeline' | 'risks' | 'stakeholders' | 'json'>('overview');
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = (message: string) => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type: 'success' }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3000);
  };

  const exportPDF = () => {
    window.print();
  };

  return (
    <div className="flex h-screen bg-slate-50 font-sans overflow-hidden">
      
      {/* Chat Bot */}
      <ChatBot strategyData={data} />

      {/* Toast Container - Moved to bottom left to avoid overlapping with ChatBot */}
      <div className="fixed bottom-6 left-20 z-50 flex flex-col gap-2 pointer-events-none">
        {toasts.map(toast => (
          <div key={toast.id} className="toast-enter bg-slate-900 text-white px-4 py-3 rounded-lg shadow-xl flex items-center gap-3 min-w-[300px] pointer-events-auto">
            <div className="bg-emerald-500 rounded-full p-1">
              <Check className="w-3 h-3 text-white" />
            </div>
            <span className="text-sm font-medium">{toast.message}</span>
          </div>
        ))}
      </div>

      {/* Sidebar Navigation */}
      <aside className="w-20 lg:w-64 bg-white border-r border-slate-200 flex flex-col justify-between transition-all duration-300 z-20">
        <div>
          <div className="h-16 flex items-center justify-center lg:justify-start lg:px-6 border-b border-slate-100">
             <div className="bg-indigo-600 p-1.5 rounded-lg shrink-0">
               <Zap className="w-5 h-5 text-white" fill="currentColor" />
             </div>
             <span className="ml-3 font-bold text-slate-800 text-lg hidden lg:block tracking-tight">Stratify</span>
          </div>
          
          <nav className="p-4 space-y-2">
            <NavButton active={activeTab === 'overview'} onClick={() => setActiveTab('overview')} icon={<LayoutDashboard size={20} />} label="Overview" />
            <NavButton active={activeTab === 'okrs'} onClick={() => setActiveTab('okrs')} icon={<Target size={20} />} label="OKRs & Actions" />
            <NavButton active={activeTab === 'timeline'} onClick={() => setActiveTab('timeline')} icon={<Calendar size={20} />} label="Roadmap" />
            <NavButton active={activeTab === 'stakeholders'} onClick={() => setActiveTab('stakeholders')} icon={<Users size={20} />} label="Stakeholders" />
            <NavButton active={activeTab === 'risks'} onClick={() => setActiveTab('risks')} icon={<AlertTriangle size={20} />} label="Risks" />
            <div className="pt-4 border-t border-slate-100 mt-4">
              <NavButton active={activeTab === 'json'} onClick={() => setActiveTab('json')} icon={<Code size={20} />} label="JSON Data" />
            </div>
          </nav>
        </div>

        <div className="p-4 border-t border-slate-100">
          <button onClick={onReset} className="w-full flex items-center justify-center lg:justify-start gap-3 p-3 text-slate-600 hover:bg-slate-50 hover:text-red-600 rounded-lg transition-colors text-sm font-medium">
             <ArrowRight className="w-4 h-4 rotate-180" />
             <span className="hidden lg:block">Exit Strategy</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-full overflow-hidden relative">
        {/* Header */}
        <header className="h-16 bg-white/80 backdrop-blur-md border-b border-slate-200 px-8 flex items-center justify-between sticky top-0 z-10">
          <div className="flex items-center gap-2 text-sm breadcrumbs text-slate-500">
            <span className="font-medium text-slate-900">Strategy Engine</span>
            <span>/</span>
            <span className="capitalize text-indigo-600 font-medium">{activeTab}</span>
          </div>
          <div className="flex gap-3">
             <button onClick={exportPDF} className="flex items-center gap-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm">
                <Download className="w-4 h-4" />
                Export PDF
             </button>
             <button onClick={() => addToast("Strategy link copied to clipboard")} className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm shadow-indigo-200">
                <Share2 className="w-4 h-4" />
                Share
             </button>
          </div>
        </header>

        {/* Scrollable Canvas */}
        <main className="flex-1 overflow-auto bg-slate-50/50 p-6 lg:p-10">
          <div className="max-w-6xl mx-auto space-y-8 animate-fade-in pb-20">
            
            {activeTab === 'overview' && <DashboardView data={data} />}
            {activeTab === 'okrs' && <OKRView okrs={data.okrs} actions={data.action_items} automations={data.automations} onRunAutomation={(t) => addToast(`Automation triggered: ${t}`)} />}
            {activeTab === 'timeline' && <TimelineView timeline={data.timeline} />}
            {activeTab === 'risks' && <RiskView risks={data.risks} />}
            {activeTab === 'stakeholders' && <StakeholderView stakeholders={data.stakeholders} />}
            {activeTab === 'json' && (
              <div className="bg-slate-900 rounded-xl p-6 shadow-2xl border border-slate-800">
                <pre className="text-xs text-emerald-400 font-mono overflow-auto max-h-[70vh]">
                  {JSON.stringify(data, null, 2)}
                </pre>
              </div>
            )}

          </div>
        </main>
      </div>
    </div>
  );
};

// --- View Components ---

const NavButton = ({ active, onClick, icon, label }: any) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center justify-center lg:justify-start gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group ${
      active 
        ? 'bg-indigo-50 text-indigo-700 font-semibold' 
        : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
    }`}
  >
    <div className={`transition-transform duration-200 ${active ? 'scale-110' : 'group-hover:scale-110'}`}>
      {icon}
    </div>
    <span className="hidden lg:block text-sm">{label}</span>
  </button>
);

const DashboardView = ({ data }: { data: StrategyResult }) => {
  const highRisks = data.risks.filter(r => r.severity === 'High').length;
  const totalActions = data.action_items.length;
  const totalStakeholders = data.stakeholders.length;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard title="Action Items" value={totalActions} icon={<CheckCircle2 className="text-emerald-500" />} trend="+12% vs last week" />
        <StatCard title="Key Stakeholders" value={totalStakeholders} icon={<Users className="text-blue-500" />} trend="Active engagement" />
        <StatCard title="Critical Risks" value={highRisks} icon={<AlertTriangle className="text-red-500" />} trend={highRisks > 0 ? "Requires attention" : "Low exposure"} isAlert={highRisks > 0} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
           <h3 className="font-bold text-slate-800 mb-4">Strategic Objectives</h3>
           <div className="space-y-4">
             {data.okrs.slice(0, 3).map((okr, i) => (
               <div key={i} className="flex items-start gap-4 p-3 rounded-xl hover:bg-slate-50 transition-colors">
                  <div className="bg-indigo-100 text-indigo-700 text-xs font-bold px-2 py-1 rounded mt-0.5">O{i+1}</div>
                  <div>
                    <p className="text-sm font-semibold text-slate-900">{okr.objective}</p>
                    <p className="text-xs text-slate-500 mt-1">{okr.key_results.length} Key Results tracked</p>
                  </div>
               </div>
             ))}
           </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
           <h3 className="font-bold text-slate-800 mb-4">Upcoming Deadlines</h3>
           <div className="space-y-0">
             {data.timeline.slice(0, 4).map((t, i) => (
               <div key={i} className="flex items-center gap-4 py-3 border-b border-slate-50 last:border-0">
                  <div className="flex flex-col items-center min-w-[3rem] p-1 bg-slate-50 rounded text-xs font-medium text-slate-500">
                    <span>{t.end_date.split('-')[1]}</span>
                    <span className="text-lg font-bold text-slate-800">{t.end_date.split('-')[2]}</span>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-900">{t.phase}</p>
                    <p className="text-xs text-slate-500 truncate max-w-[250px]">{t.description}</p>
                  </div>
               </div>
             ))}
           </div>
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ title, value, icon, trend, isAlert }: any) => (
  <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
    <div className="flex justify-between items-start mb-4">
      <div className="p-2 bg-slate-50 rounded-lg">{icon}</div>
      <span className={`text-xs font-medium px-2 py-1 rounded-full ${isAlert ? 'bg-red-50 text-red-600' : 'bg-emerald-50 text-emerald-600'}`}>
        {trend}
      </span>
    </div>
    <h4 className="text-3xl font-bold text-slate-900 mb-1">{value}</h4>
    <p className="text-slate-500 text-sm font-medium">{title}</p>
  </div>
);

const OKRView = ({ okrs, actions, automations, onRunAutomation }: { okrs: OKR[], actions: ActionItem[], automations: any[], onRunAutomation: (t: string) => void }) => (
  <div className="space-y-8 animate-fade-in">
    <div>
      <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
        <Target className="w-5 h-5 text-indigo-600" /> Objectives & Key Results
      </h2>
      <div className="grid grid-cols-1 gap-6">
        {okrs.map((okr, idx) => (
          <div key={idx} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden group hover:border-indigo-200 transition-all">
            <div className="px-6 py-5 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
              <div className="flex items-start gap-4">
                <span className="bg-white border border-slate-200 text-slate-900 text-sm font-bold w-8 h-8 flex items-center justify-center rounded-lg shadow-sm">O{idx + 1}</span>
                <h3 className="text-lg font-semibold text-slate-900">{okr.objective}</h3>
              </div>
              <div className="w-24 bg-slate-200 rounded-full h-2">
                 <div className="bg-emerald-500 h-2 rounded-full w-[35%]"></div>
              </div>
            </div>
            <div className="p-6 bg-white">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {okr.key_results.map((kr, kIdx) => (
                  <div key={kIdx} className="flex items-start gap-3 text-slate-700 p-3 rounded-xl hover:bg-slate-50 border border-transparent hover:border-slate-100 transition-all">
                    <div className="mt-0.5 min-w-[1.25rem] h-5 rounded-full border-2 border-slate-300 flex items-center justify-center cursor-pointer hover:border-indigo-500 hover:bg-indigo-50">
                      <div className="w-2.5 h-2.5 rounded-full bg-indigo-500 opacity-0 hover:opacity-100" />
                    </div>
                    <span className="text-sm font-medium leading-relaxed">{kr}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>

    <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
      <div className="xl:col-span-2">
        <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-emerald-500" />
          Execution Plan
        </h3>
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-100">
              <tr>
                <th className="px-6 py-4">Task</th>
                <th className="px-6 py-4">Owner</th>
                <th className="px-6 py-4">Priority</th>
                <th className="px-6 py-4">Est.</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {actions.map((action, idx) => (
                <tr key={idx} className="hover:bg-slate-50/80 transition-colors">
                  <td className="px-6 py-4 font-medium text-slate-900">{action.title}</td>
                  <td className="px-6 py-4">
                    {action.owner ? (
                      <div className="flex items-center gap-2">
                         <div className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-xs font-bold">
                           {action.owner.charAt(0)}
                         </div>
                         <span className="text-slate-600">{action.owner}</span>
                      </div>
                    ) : <span className="text-slate-400">-</span>}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      action.priority === 'High' ? 'bg-red-50 text-red-700' : 
                      action.priority === 'Medium' ? 'bg-amber-50 text-amber-700' : 'bg-slate-100 text-slate-600'
                    }`}>
                      {action.priority || 'Normal'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-slate-500 font-mono text-xs">{action.duration || 'TBD'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="xl:col-span-1">
        <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
          <Zap className="w-5 h-5 text-amber-500" />
          Automations
        </h3>
        <div className="space-y-3">
          {automations.map((auto, idx) => (
            <div key={idx} className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:border-indigo-300 hover:shadow-md transition-all group relative overflow-hidden">
              <div className="absolute top-0 left-0 w-1 h-full bg-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <div className="flex justify-between items-start mb-2">
                <span className="text-[10px] font-bold tracking-wide uppercase text-indigo-500 bg-indigo-50 px-2 py-1 rounded border border-indigo-100">{auto.type.replace('.', ' ')}</span>
              </div>
              <p className="text-sm font-semibold text-slate-900 mb-1">{auto.payload.title}</p>
              <p className="text-xs text-slate-500 mb-4">Assignee: {auto.payload.owner || 'Unassigned'}</p>
              <button 
                onClick={() => onRunAutomation(auto.payload.title)}
                className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                <Zap className="w-3 h-3" fill="currentColor" /> Run Workflow
              </button>
            </div>
          ))}
          {automations.length === 0 && (
             <div className="text-center p-8 bg-slate-50 rounded-xl border border-dashed border-slate-300 text-slate-400 text-sm">
                No automations detected
             </div>
          )}
        </div>
      </div>
    </div>
  </div>
);

const TimelineView = ({ timeline }: { timeline: any[] }) => {
  // Enhanced Timeline using CSS Grid to simulate a Gantt chart
  const sorted = [...timeline].sort((a,b) => new Date(a.start_date).getTime() - new Date(b.start_date).getTime());
  
  // Calculate relative widths (simplified for demo)
  const getGridPos = (dateStr: string) => {
     // This is a mock calculation. Real impl would parse dates relative to start/end of project
     const day = parseInt(dateStr.split('-')[2]);
     return Math.max(1, Math.min(30, day)); 
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-slate-800">Project Roadmap</h2>
        <div className="flex gap-2">
          <span className="flex items-center gap-1 text-xs text-slate-500"><div className="w-3 h-3 bg-indigo-500 rounded"></div> Planned</span>
          <span className="flex items-center gap-1 text-xs text-slate-500"><div className="w-3 h-3 bg-emerald-400 rounded"></div> Milestone</span>
        </div>
      </div>
      
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden p-6">
        <div className="space-y-8">
           {sorted.map((item, idx) => (
             <div key={idx} className="relative group">
               <div className="flex flex-col md:flex-row md:items-center gap-4 mb-2">
                  <div className="w-32 shrink-0 text-sm font-mono text-slate-500">{item.start_date}</div>
                  <div className="flex-1 relative h-10 bg-slate-50 rounded-lg overflow-hidden border border-slate-100 group-hover:border-indigo-200 transition-colors">
                     {/* Bar */}
                     <div 
                        className="absolute top-1 bottom-1 left-0 bg-indigo-500/10 border-l-4 border-indigo-500 rounded-r-md flex items-center px-3"
                        style={{ width: `${Math.random() * 50 + 40}%` }} // Mock width
                     >
                        <span className="text-xs font-bold text-indigo-700 truncate">{item.phase}</span>
                     </div>
                  </div>
                  <div className="w-32 shrink-0 text-right text-sm font-mono text-slate-500">{item.end_date}</div>
               </div>
               <p className="pl-32 md:pl-36 text-xs text-slate-400">{item.description}</p>
             </div>
           ))}
        </div>
      </div>
    </div>
  );
};

const RiskView = ({ risks }: { risks: Risk[] }) => {
  // Scatter data prep
  const riskData = risks.map((r, i) => ({
    ...r,
    x: r.severity === 'High' ? 3.5 : r.severity === 'Medium' ? 2 : 1, // Impact
    y: Math.random() * 3 + 0.5, // Probability (Randomized for viz)
    z: 100
  }));

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-slate-800">Risk Matrix</h2>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm p-6 h-[400px]">
          <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">Impact vs Probability</h3>
          <ResponsiveContainer width="100%" height="90%">
            <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis type="number" dataKey="x" name="Impact" domain={[0, 4]} tick={false} label={{ value: 'Impact', position: 'bottom' }} />
              <YAxis type="number" dataKey="y" name="Likelihood" domain={[0, 4]} tick={false} label={{ value: 'Probability', angle: -90, position: 'left' }} />
              <ZAxis type="number" dataKey="z" range={[200, 500]} />
              <RechartsTooltip cursor={{ strokeDasharray: '3 3' }} content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div className="bg-slate-900 text-white p-3 rounded-lg shadow-xl max-w-xs">
                        <p className="font-bold text-sm mb-1">{data.description}</p>
                        <div className="flex gap-2 text-xs opacity-80">
                           <span>Severity: {data.severity}</span>
                        </div>
                      </div>
                    );
                  }
                  return null;
                }} 
              />
              <Scatter name="Risks" data={riskData}>
                {riskData.map((entry, index) => (
                   <Cell key={`cell-${index}`} fill={entry.severity === 'High' ? '#ef4444' : entry.severity === 'Medium' ? '#f59e0b' : '#3b82f6'} fillOpacity={0.8} />
                ))}
              </Scatter>
            </ScatterChart>
          </ResponsiveContainer>
        </div>

        <div className="space-y-4 overflow-auto max-h-[400px] pr-2 custom-scrollbar">
          {risks.map((risk, idx) => (
            <div key={idx} className={`p-4 rounded-xl border shadow-sm bg-white transition-all hover:translate-x-1 ${
              risk.severity === 'High' ? 'border-l-4 border-l-red-500 border-t-slate-100 border-r-slate-100 border-b-slate-100' : 
              risk.severity === 'Medium' ? 'border-l-4 border-l-amber-500 border-t-slate-100 border-r-slate-100 border-b-slate-100' : 
              'border-l-4 border-l-blue-500 border-t-slate-100 border-r-slate-100 border-b-slate-100'
            }`}>
              <div className="flex justify-between items-start mb-2">
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wide ${
                   risk.severity === 'High' ? 'bg-red-50 text-red-700' : 
                   risk.severity === 'Medium' ? 'bg-amber-50 text-amber-700' : 'bg-blue-50 text-blue-700'
                }`}>{risk.severity}</span>
              </div>
              <h4 className="font-medium text-slate-900 text-sm mb-2">{risk.description}</h4>
              <div className="text-xs text-slate-600 bg-slate-50 p-2 rounded border border-slate-100">
                <span className="font-semibold text-slate-700">Mitigation:</span> {risk.mitigation}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const StakeholderView = ({ stakeholders }: { stakeholders: any[] }) => {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current || stakeholders.length === 0) return;
    d3.select(svgRef.current).selectAll("*").remove();

    const width = 800;
    const height = 500;
    const svg = d3.select(svgRef.current)
      .attr("viewBox", [0, 0, width, height])
      .attr("class", "w-full h-full");

    const nodes = stakeholders.map(s => ({ ...s, id: s.name }));
    const rootNode = { id: "Strategy Core", role: "Central", influence: "High" };
    const allNodes: any[] = [rootNode, ...nodes];
    const links = nodes.map(s => ({ source: "Strategy Core", target: s.name }));

    const simulation = d3.forceSimulation(allNodes)
      .force("link", d3.forceLink(links).id((d: any) => d.id).distance(150))
      .force("charge", d3.forceManyBody().strength(-400))
      .force("center", d3.forceCenter(width / 2, height / 2))
      .force("collide", d3.forceCollide().radius(40));

    const link = svg.append("g")
      .attr("stroke", "#e2e8f0")
      .attr("stroke-opacity", 0.6)
      .selectAll("line")
      .data(links)
      .join("line")
      .attr("stroke-width", 2);

    const nodeGroup = svg.append("g")
      .selectAll("g")
      .data(allNodes)
      .join("g")
      .call(d3.drag<any, any>()
          .on("start", (event, d) => {
            if (!event.active) simulation.alphaTarget(0.3).restart();
            d.fx = d.x;
            d.fy = d.y;
          })
          .on("drag", (event, d) => {
            d.fx = event.x;
            d.fy = event.y;
          })
          .on("end", (event, d) => {
            if (!event.active) simulation.alphaTarget(0);
            d.fx = null;
            d.fy = null;
          }));

    nodeGroup.append("circle")
      .attr("r", (d: any) => d.id === "Strategy Core" ? 35 : d.influence === "High" ? 25 : 18)
      .attr("fill", (d: any) => d.id === "Strategy Core" ? "#4f46e5" : d.interest === "High" ? "#ec4899" : "#64748b")
      .attr("stroke", "#fff")
      .attr("stroke-width", 3)
      .attr("class", "cursor-grab active:cursor-grabbing transition-all hover:opacity-80 shadow-lg");

    nodeGroup.append("text")
      .text((d: any) => d.id.split(' ')[0])
      .attr("dy", (d: any) => d.id === "Strategy Core" ? 5 : 4)
      .attr("text-anchor", "middle")
      .attr("fill", "white")
      .attr("font-size", "10px")
      .attr("font-weight", "bold")
      .attr("pointer-events", "none");

    // Labels below nodes
    nodeGroup.append("text")
      .text((d: any) => d.id !== "Strategy Core" ? d.role : "")
      .attr("dy", 40)
      .attr("text-anchor", "middle")
      .attr("fill", "#64748b")
      .attr("font-size", "10px");

    simulation.on("tick", () => {
      link
        .attr("x1", (d: any) => d.source.x)
        .attr("y1", (d: any) => d.source.y)
        .attr("x2", (d: any) => d.target.x)
        .attr("y2", (d: any) => d.target.y);

      nodeGroup.attr("transform", (d: any) => `translate(${d.x},${d.y})`);
    });

  }, [stakeholders]);

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-slate-800">Stakeholder Influence Map</h2>
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden h-[600px] relative">
         <div className="absolute top-4 right-4 bg-white/90 backdrop-blur p-3 rounded-lg border border-slate-100 shadow-sm text-xs text-slate-500 space-y-2">
           <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-pink-500"></div> High Interest</div>
           <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-slate-500"></div> Low Interest</div>
           <div className="flex items-center gap-2"><div className="w-4 h-4 rounded-full border-2 border-slate-300"></div> Size = Influence</div>
         </div>
         <p className="absolute top-4 left-4 text-xs text-slate-400 font-mono">Interactive: Drag nodes to rearrange</p>
        <svg ref={svgRef} className="w-full h-full bg-slate-50/50" />
      </div>
    </div>
  );
};

export default StrategyCanvas;