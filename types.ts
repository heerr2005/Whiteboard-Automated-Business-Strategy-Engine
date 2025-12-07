export enum AppStep {
  IDLE = 'IDLE',
  UPLOADING = 'UPLOADING',
  TRANSCRIBING = 'TRANSCRIBING',
  CLASSIFYING = 'CLASSIFYING',
  SYNTHESIZING = 'SYNTHESIZING',
  COMPLETE = 'COMPLETE',
  ERROR = 'ERROR'
}

export interface Snippet {
  id: string;
  text: string;
  bbox: string; // "top-left" | "top-right" | ...
  confidence: "high" | "medium" | "low";
}

export interface ClassifiedItem {
  id: string;
  text: string;
  type: "Objective" | "KeyResult" | "ActionItem" | "Owner" | "Date" | "Metric" | "Risk" | "Note" | "Unknown";
}

export interface Relation {
  source: string;
  target: string;
  type: "contributes" | "depends_on" | "owned_by" | "precedes";
}

export interface OKR {
  objective: string;
  key_results: string[];
}

export interface ActionItem {
  title: string;
  owner?: string;
  duration?: string;
  priority?: "High" | "Medium" | "Low";
}

export interface TimelineItem {
  phase: string;
  start_date: string;
  end_date: string;
  description: string;
}

export interface Stakeholder {
  name: string;
  role: string;
  influence: "High" | "Medium" | "Low";
  interest: "High" | "Medium" | "Low";
}

export interface Risk {
  description: string;
  severity: "High" | "Medium" | "Low";
  mitigation: string;
}

export interface Automation {
  type: string;
  payload: Record<string, any>;
}

export interface StrategyResult {
  okrs: OKR[];
  action_items: ActionItem[];
  timeline: TimelineItem[];
  stakeholders: Stakeholder[];
  risks: Risk[];
  automations: Automation[];
}

export interface ProcessingState {
  step: AppStep;
  snippets: Snippet[];
  classified: { items: ClassifiedItem[]; relations: Relation[] } | null;
  strategy: StrategyResult | null;
  error?: string;
  imagePreview?: string;
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
  timestamp: Date;
}