export type DomainMeta = {
  id: 'D1' | 'D2' | 'D3' | 'D4' | 'D5'
  slug: string
  name: string
  full: string
  weight: string
  intro: string
}

export const DOMAINS: DomainMeta[] = [
  {
    id: 'D1',
    slug: 'agentic-architecture-orchestration',
    name: 'Agentic Architecture & Orchestration',
    full: 'D1 Agentic Architecture & Orchestration',
    weight: '27%',
    intro:
      'Largest exam domain. Agentic loops, coordinator–subagent orchestration, Task-tool spawning, hooks for enforcement, and session resume/fork.',
  },
  {
    id: 'D2',
    slug: 'tool-design-mcp-integration',
    name: 'Tool Design & MCP Integration',
    full: 'D2 Tool Design & MCP Integration',
    weight: '18%',
    intro:
      'MCP tool/resource design, clear tool descriptions, structured errors, .mcp.json scoping, and built-in tool selection.',
  },
  {
    id: 'D3',
    slug: 'claude-code-configuration-workflows',
    name: 'Claude Code Configuration & Workflows',
    full: 'D3 Claude Code Configuration & Workflows',
    weight: '20%',
    intro:
      'CLAUDE.md hierarchy, path-scoped rules, slash commands, skills, plan mode vs direct execution, and hooks.',
  },
  {
    id: 'D4',
    slug: 'prompt-engineering-structured-output',
    name: 'Prompt Engineering & Structured Output',
    full: 'D4 Prompt Engineering & Structured Output',
    weight: '20%',
    intro:
      'Few-shot prompting, tool_use + JSON schemas, validation/retry loops, batches, and multi-pass review.',
  },
  {
    id: 'D5',
    slug: 'context-management-reliability',
    name: 'Context Management & Reliability',
    full: 'D5 Context Management & Reliability',
    weight: '15%',
    intro:
      'Context budgets, summarization risks, escalation criteria, structured error propagation, and review calibration.',
  },
]

export function domainShortLabel(full: string): string {
  const match = DOMAINS.find((d) => d.full === full)
  return match ? `${match.id} · ${match.name}` : full
}
