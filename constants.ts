import { StrategyResult } from './types';

export const PROMPT_TRANSCRIPTION = `
SYSTEM:
You are an expert multimodal transcription engine.
Extract all readable text from the whiteboard image.
Return JSON only in the following format:
[
  {
    "id": "s1",
    "text": "...",
    "bbox": "top-left | top-right | center | bottom-left | bottom-right",
    "confidence": "high | medium | low"
  }
]
If unsure, mark confidence:"low".
Do NOT hallucinate.
`;

export const PROMPT_CLASSIFICATION = `
SYSTEM:
You are an information extraction model.
Given these text snippets, classify each into one of the following types:
Objective, KeyResult, ActionItem, Owner, Date, Metric, Risk, Note, Unknown.

Also infer relation types between items:
contributes, depends_on, owned_by, preceding.

Return only JSON in this format:
{
 "items": [
    { "id": "s1", "text": "...", "type": "Objective" }
 ],
 "relations": [
    { "source": "s1", "target": "s2", "type": "contributes" }
 ]
}
`;

export const PROMPT_SYNTHESIS = `
SYSTEM:
You are a senior product strategist.
Given the structured items and relations, generate a complete
business strategy using this schema:

{
 "okrs": [
    { "objective": "...", "key_results": ["...", "..."] }
 ],
 "action_items": [
    { "title": "...", "owner": "...", "duration": "2 weeks", "priority": "High" }
 ],
 "timeline": [
    { "phase": "...", "start_date": "YYYY-MM-DD", "end_date": "YYYY-MM-DD", "description": "..." }
 ],
 "stakeholders": [
    { "name": "...", "role": "...", "influence": "High", "interest": "High" }
 ],
 "risks": [
    { "description": "...", "severity": "High", "mitigation": "..." }
 ],
 "automations": [
    { "type": "task.create", "payload": { "title": "...", "owner": "..." } }
 ]
}

All dates should be reasonably inferred starting from reference_date = "2025-12-01".
Ensure all fields are consistent and professional.
Return JSON only.
`;

export const MOCK_STRATEGY_DATA: StrategyResult = {
  okrs: [
    {
      objective: "Launch Stratify MVP and achieve 1000 active users",
      key_results: [
        "Reach 5,000 unique website visitors",
        "Achieve 20% sign-up conversion rate",
        "Maintain < 2s average processing latency"
      ]
    },
    {
      objective: "Establish Market Presence in Enterprise Sector",
      key_results: [
        "Secure 3 beta partners from Fortune 500",
        "Publish 2 case studies on efficiency gains",
        "Integrate with Jira and Salesforce"
      ]
    }
  ],
  action_items: [
    { title: "Finalize Gemini 3 Pro API integration", owner: "Dev Team", duration: "1 week", priority: "High" },
    { title: "Design landing page marketing assets", owner: "Sarah", duration: "3 days", priority: "Medium" },
    { title: "Conduct security audit for data compliance", owner: "Alex", duration: "2 weeks", priority: "High" },
    { title: "Draft user documentation", owner: "Jamie", duration: "1 week", priority: "Low" }
  ],
  timeline: [
    { phase: "Alpha Release", start_date: "2025-12-01", end_date: "2025-12-14", description: "Internal testing and core feature validation" },
    { phase: "Beta Launch", start_date: "2025-12-15", end_date: "2025-12-30", description: "Public beta with waitlist access" },
    { phase: "V1.0 Go-Live", start_date: "2026-01-10", end_date: "2026-01-31", description: "Full public launch and marketing push" }
  ],
  stakeholders: [
    { name: "Executive Board", role: "Sponsor", influence: "High", interest: "High" },
    { name: "Product Team", role: "Execution", influence: "High", interest: "High" },
    { name: "Marketing Dept", role: "Promotion", influence: "Medium", interest: "Medium" },
    { name: "Legal & Compliance", role: "Reviewer", influence: "High", interest: "Low" }
  ],
  risks: [
    { description: "API Rate limits exceeded during launch", severity: "High", mitigation: "Implement robust caching and quota management" },
    { description: "Low user adoption of advanced features", severity: "Medium", mitigation: "Create interactive tutorials and onboarding flow" },
    { description: "Browser compatibility issues", severity: "Low", mitigation: "Extensive cross-browser testing suite" }
  ],
  automations: [
    { type: "task.create", payload: { title: "Set up analytics dashboard", owner: "Dev Team" } },
    { type: "notify.channel", payload: { channel: "#launches", message: "Beta is live!" } }
  ]
};