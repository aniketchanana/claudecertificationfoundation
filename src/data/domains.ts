export type DomainMeta = {
  id: 'D1' | 'D2' | 'D3' | 'D4' | 'D5'
  slug: string
  name: string
  full: string
  intro: string
}

export const DOMAINS: DomainMeta[] = [
  {
    id: 'D1',
    slug: 'agentic-architecture-orchestration',
    name: 'Agentic Architecture & Orchestration',
    full: 'D1 Agentic Architecture & Orchestration',
    intro:
      'Multi-agent systems, orchestration patterns, routing, handoffs, and collaborative Claude workflows.',
  },
  {
    id: 'D2',
    slug: 'tool-design-mcp-integration',
    name: 'Tool Design & MCP Integration',
    full: 'D2 Tool Design & MCP Integration',
    intro:
      'Model Context Protocol, tool descriptions, scoping, and reliable external tool use.',
  },
  {
    id: 'D3',
    slug: 'claude-code-configuration-workflows',
    name: 'Claude Code Configuration & Workflows',
    full: 'D3 Claude Code Configuration & Workflows',
    intro:
      'Hooks, CLAUDE.md, skills, slash commands, permissions, and compaction workflows.',
  },
  {
    id: 'D4',
    slug: 'prompt-engineering-structured-output',
    name: 'Prompt Engineering & Structured Output',
    full: 'D4 Prompt Engineering & Structured Output',
    intro:
      'Prompting strategies, system prompts, schemas, structured outputs, and evaluation.',
  },
  {
    id: 'D5',
    slug: 'context-management-reliability',
    name: 'Context Management & Reliability',
    full: 'D5 Context Management & Reliability',
    intro:
      'Context windows, retrieval, memory, reliability patterns, and grounded long-running agents.',
  },
]

export function domainShortLabel(full: string): string {
  const match = DOMAINS.find((d) => d.full === full)
  return match ? `${match.id} · ${match.name}` : full
}
