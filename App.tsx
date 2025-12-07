import React, { useState, useCallback, useEffect } from 'react';
import { AppStep, ProcessingState } from './types';
import { transcribeImage, classifySnippets, synthesizeStrategy } from './services/geminiService';
import { MOCK_STRATEGY_DATA } from './constants';
import StrategyCanvas from './components/StrategyCanvas';
import { 
  Upload, Loader2, AlertCircle, FileImage, Cpu, BrainCircuit, 
  Layout, CheckCircle2, Zap, BarChart3, ScanLine
} from 'lucide-react';

const App: React.FC = () => {
  const [state, setState] = useState<ProcessingState>({
    step: AppStep.IDLE,
    snippets: [],
    classified: null,
    strategy: null
  });

  // Scroll to top on mount
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handleFileUpload = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      const base64Image = e.target?.result as string;
      
      setState(prev => ({ 
        ...prev, 
        step: AppStep.TRANSCRIBING, 
        imagePreview: base64Image,
        error: undefined 
      }));

      try {
        // --- Stage 1: Transcription ---
        const snippets = await transcribeImage(base64Image);
        setState(prev => ({ ...prev, step: AppStep.CLASSIFYING, snippets }));

        // --- Stage 2: Classification ---
        const classified = await classifySnippets(snippets);
        setState(prev => ({ ...prev, step: AppStep.SYNTHESIZING, classified }));

        // --- Stage 3: Synthesis ---
        const strategy = await synthesizeStrategy(classified.items, classified.relations);
        setState(prev => ({ ...prev, step: AppStep.COMPLETE, strategy }));

      } catch (error: any) {
        console.error("Pipeline failed:", error);
        setState(prev => ({ 
          ...prev, 
          step: AppStep.ERROR, 
          error: error.message || "An unexpected error occurred." 
        }));
      }
    };
    reader.readAsDataURL(file);
  }, []);

  const handleDemo = () => {
    setState(prev => ({ 
      ...prev, 
      step: AppStep.TRANSCRIBING,
      imagePreview: 'https://images.unsplash.com/photo-1531403009284-440f080d1e12?auto=format&fit=crop&q=80&w=2940&ixlib=rb-4.0.3', // Placeholder image
      error: undefined 
    }));

    // Simulate processing delay for demo effect
    setTimeout(() => {
      setState(prev => ({ ...prev, step: AppStep.CLASSIFYING }));
      setTimeout(() => {
        setState(prev => ({ ...prev, step: AppStep.SYNTHESIZING }));
        setTimeout(() => {
          setState({
            step: AppStep.COMPLETE,
            snippets: [],
            classified: null,
            strategy: MOCK_STRATEGY_DATA,
            imagePreview: undefined
          });
        }, 1200);
      }, 1000);
    }, 800);
  };

  const resetApp = () => {
    setState({
      step: AppStep.IDLE,
      snippets: [],
      classified: null,
      strategy: null
    });
  };

  // --- Render Views ---

  if (state.step === AppStep.COMPLETE && state.strategy) {
    return <StrategyCanvas data={state.strategy} onReset={resetApp} status={state.step} />;
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 selection:bg-indigo-100 selection:text-indigo-900">
      
      {/* Navbar */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-indigo-600 p-1.5 rounded-lg">
              <Zap className="w-5 h-5 text-white" fill="currentColor" />
            </div>
            <span className="text-xl font-bold tracking-tight text-slate-900">Stratify</span>
          </div>
          <div className="hidden md:flex gap-6 text-sm font-medium text-slate-600">
            <button className="hover:text-indigo-600 transition-colors">Features</button>
            <button className="hover:text-indigo-600 transition-colors">Pricing</button>
            <button className="hover:text-indigo-600 transition-colors">Enterprise</button>
          </div>
          <div>
            <button className="text-sm font-semibold text-slate-900 hover:text-indigo-600 px-4 py-2 transition-colors">
              Sign In
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-24">
        
        {state.step === AppStep.IDLE ? (
          <div className="max-w-4xl mx-auto text-center">
            
            {/* Hero Content */}
            <div className="space-y-8 animate-fade-in-up flex flex-col items-center">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-semibold uppercase tracking-wide">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
                </span>
                Powered by Gemini 3 Pro
              </div>
              
              <h1 className="text-5xl lg:text-7xl font-extrabold tracking-tight text-slate-900 leading-[1.1]">
                Turn Whiteboards into <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">Strategy</span>
              </h1>
              
              <p className="text-xl text-slate-600 leading-relaxed max-w-2xl mx-auto">
                Upload a photo of your messy meeting notes. Stratify uses multimodal AI to instantly generate structured OKRs, roadmaps, risk registers, and Jira tickets.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center w-full pt-4">
                <div className="relative group">
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg blur opacity-75 group-hover:opacity-100 transition duration-1000 group-hover:duration-200 animate-tilt"></div>
                  <label className="relative flex items-center justify-center gap-3 bg-slate-900 hover:bg-slate-800 text-white px-8 py-4 rounded-lg font-semibold text-lg transition-all cursor-pointer w-full sm:w-auto shadow-xl">
                    <Upload className="w-5 h-5" />
                    <span>Analyze Board</span>
                    <input 
                      type="file" 
                      accept="image/*" 
                      onChange={handleFileUpload} 
                      className="hidden" 
                    />
                  </label>
                </div>
                <button 
                  onClick={handleDemo}
                  className="px-8 py-4 rounded-lg font-semibold text-slate-700 border border-slate-300 hover:bg-slate-50 transition-colors"
                >
                  View Demo
                </button>
              </div>

              <div className="pt-12 border-t border-slate-200 grid grid-cols-3 gap-8 w-full max-w-3xl mx-auto">
                <div>
                  <h3 className="font-bold text-3xl text-slate-900">30s</h3>
                  <p className="text-sm text-slate-500 font-medium">Processing Time</p>
                </div>
                <div>
                  <h3 className="font-bold text-3xl text-slate-900">100%</h3>
                  <p className="text-sm text-slate-500 font-medium">Structured Output</p>
                </div>
                <div>
                  <h3 className="font-bold text-3xl text-slate-900">AI</h3>
                  <p className="text-sm text-slate-500 font-medium">Multimodal Reasoning</p>
                </div>
              </div>
            </div>

          </div>
        ) : (
          /* Processing State */
          <div className="max-w-2xl mx-auto pt-10">
            <div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
              <div className="p-8 pb-12 relative">
                <div className="absolute top-0 left-0 w-full h-1 bg-slate-100">
                  <div className={`h-full bg-indigo-600 transition-all duration-1000 ${
                    state.step === AppStep.TRANSCRIBING ? 'w-1/3' : 
                    state.step === AppStep.CLASSIFYING ? 'w-2/3' : 'w-full'
                  }`}></div>
                </div>

                <div className="text-center mb-8">
                  <div className="inline-flex items-center justify-center p-4 bg-indigo-50 rounded-full mb-4 relative">
                    <ScanLine className="w-8 h-8 text-indigo-600 animate-pulse" />
                    <div className="absolute inset-0 border-2 border-indigo-100 rounded-full animate-ping opacity-20"></div>
                  </div>
                  <h2 className="text-2xl font-bold text-slate-900">Analyzing Strategy</h2>
                  <p className="text-slate-500">Extracting insights from your whiteboard...</p>
                </div>

                {state.imagePreview && (
                  <div className="relative w-full h-48 bg-slate-900 rounded-lg overflow-hidden mb-8 group">
                    <img src={state.imagePreview} alt="Processing" className="w-full h-full object-cover opacity-40 blur-[2px]" />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 to-transparent"></div>
                    
                    {/* Scanning Line Animation */}
                    <div className="absolute top-0 left-0 w-full h-1 bg-indigo-400 shadow-[0_0_15px_rgba(129,140,248,0.8)] animate-[scan_2s_linear_infinite]"></div>

                    <div className="absolute bottom-4 left-4 right-4 font-mono text-xs text-indigo-300 space-y-1">
                      <div className="flex justify-between">
                        <span>&gt; DETECT_OBJECTS</span>
                        <span>[OK]</span>
                      </div>
                      <div className="flex justify-between">
                         <span>&gt; OCR_TEXT_EXTRACTION</span>
                         <span>{state.step === AppStep.TRANSCRIBING ? '[PROCESSING...]' : '[OK]'}</span>
                      </div>
                      <div className="flex justify-between">
                         <span>&gt; SEMANTIC_MAPPING</span>
                         <span>{state.step === AppStep.CLASSIFYING ? '[PROCESSING...]' : (state.step === AppStep.SYNTHESIZING ? '[OK]' : '[WAITING]')}</span>
                      </div>
                    </div>
                  </div>
                )}

                <div className="space-y-4">
                  <ProcessingStep 
                    icon={<FileImage className="w-5 h-5" />}
                    label="Vision Transcription"
                    desc="Extracting raw text & geometry"
                    status={state.step === AppStep.TRANSCRIBING ? 'active' : 'done'}
                  />
                  <ProcessingStep 
                    icon={<BrainCircuit className="w-5 h-5" />}
                    label="Semantic Classification"
                    desc="Identifying OKRs, Risks, & Owners"
                    status={state.step === AppStep.CLASSIFYING ? 'active' : (state.step === AppStep.SYNTHESIZING || state.step === AppStep.COMPLETE) ? 'done' : 'waiting'}
                  />
                  <ProcessingStep 
                    icon={<Layout className="w-5 h-5" />}
                    label="Strategy Synthesis"
                    desc="Structuring execution plan"
                    status={state.step === AppStep.SYNTHESIZING ? 'active' : state.step === AppStep.COMPLETE ? 'done' : 'waiting'}
                  />
                </div>

                {state.step === AppStep.ERROR && (
                  <div className="mt-8 bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3 animate-shake">
                    <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-sm font-semibold text-red-900">Analysis Failed</h4>
                      <p className="text-sm text-red-700 mt-1">{state.error}</p>
                      <button onClick={resetApp} className="mt-2 text-xs font-semibold text-red-800 hover:text-red-900 underline">Try Again</button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

      </main>

      {/* Features Grid (Only on Idle) */}
      {state.step === AppStep.IDLE && (
        <section className="bg-white py-20 border-t border-slate-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold text-slate-900">Everything you need to execute</h2>
              <p className="mt-4 text-slate-500">From messy ink to enterprise-grade artifacts.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
              <FeatureCard 
                icon={<BarChart3 className="w-6 h-6 text-indigo-600" />}
                title="Instant Roadmaps"
                desc="Automatically infer timelines and dependencies to create visual Gantt charts."
              />
              <FeatureCard 
                icon={<CheckCircle2 className="w-6 h-6 text-emerald-600" />}
                title="Actionable Tasks"
                desc="Convert bullet points into assigned tasks with priorities and due dates."
              />
              <FeatureCard 
                icon={<Cpu className="w-6 h-6 text-purple-600" />}
                title="Workflow Automation"
                desc="One-click integration to create Jira tickets, Slack notifications, and more."
              />
            </div>
          </div>
        </section>
      )}
      
      <style>{`
        @keyframes scan {
          0% { top: 0%; opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { top: 100%; opacity: 0; }
        }
      `}</style>
    </div>
  );
};

const ProcessingStep = ({ icon, label, desc, status }: { icon: React.ReactNode, label: string, desc: string, status: 'waiting' | 'active' | 'done' }) => {
  return (
    <div className={`flex items-center gap-4 p-4 rounded-xl border transition-all duration-500 ${
      status === 'active' ? 'border-indigo-500 bg-indigo-50/50 shadow-sm' : 
      status === 'done' ? 'border-emerald-100 bg-emerald-50/30' : 
      'border-slate-100 bg-white opacity-60'
    }`}>
      <div className={`p-2.5 rounded-lg transition-colors duration-300 ${
        status === 'active' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200' : 
        status === 'done' ? 'bg-emerald-500 text-white' : 
        'bg-slate-100 text-slate-400'
      }`}>
        {status === 'active' ? <Loader2 className="w-5 h-5 animate-spin" /> : status === 'done' ? <CheckCircle2 className="w-5 h-5" /> : icon}
      </div>
      <div className="flex-1">
        <div className="flex justify-between items-center mb-0.5">
          <p className={`font-semibold ${
            status === 'active' ? 'text-indigo-900' : 
            status === 'done' ? 'text-emerald-900' : 
            'text-slate-500'
          }`}>{label}</p>
          {status === 'active' && <span className="text-[10px] font-bold tracking-wider text-indigo-500 uppercase animate-pulse">Processing</span>}
        </div>
        <p className="text-xs text-slate-500">{desc}</p>
      </div>
    </div>
  )
}

const FeatureCard = ({ icon, title, desc }: any) => (
  <div className="flex flex-col items-center text-center p-6 rounded-2xl hover:bg-slate-50 transition-colors duration-300">
    <div className="p-3 bg-white rounded-xl shadow-md border border-slate-100 mb-4">
      {icon}
    </div>
    <h3 className="text-lg font-bold text-slate-900 mb-2">{title}</h3>
    <p className="text-slate-600 text-sm leading-relaxed">{desc}</p>
  </div>
);

export default App;