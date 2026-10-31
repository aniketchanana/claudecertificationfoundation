#!/usr/bin/env node
/**
 * Post-build SEO page generator for GitHub Pages.
 * Reads question JSON and writes static HTML into dist/.
 */
import { mkdirSync, readFileSync, writeFileSync, copyFileSync, existsSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, '..')
const DIST = join(ROOT, 'dist')
const SITE_ORIGIN = 'https://aniketchanana.github.io'
const BASE = '/claudecertificationfoundation'
const SITE_URL = `${SITE_ORIGIN}${BASE}/`

const PAPERS = [
  {
    id: 'paper-1',
    label: 'Paper 1',
    description: 'Full practice exam · 60 questions',
    file: 'questions.json',
  },
  {
    id: 'paper-2',
    label: 'Paper 2',
    description: 'Quick drill · 15 questions',
    file: 'questions-2.json',
  },
  {
    id: 'paper-3',
    label: 'Paper 3',
    description: 'Foundations practice set · 60 questions',
    file: 'questions-3.json',
  },
  {
    id: 'paper-4',
    label: 'Paper 4',
    description: 'Additional practice set · 37 questions',
    file: 'questions-4.json',
  },
  {
    id: 'paper-5',
    label: 'Paper 5',
    description: 'Study-guide scenarios · 54 questions',
    file: 'questions-5.json',
  },
]

const DOMAINS = [
  {
    id: 'D1',
    slug: 'agentic-architecture-orchestration',
    name: 'Agentic Architecture & Orchestration',
    full: 'D1 Agentic Architecture & Orchestration',
    intro:
      'Questions on designing multi-agent systems, orchestration patterns, routing, handoffs, and how Claude agents collaborate to complete complex workflows.',
  },
  {
    id: 'D2',
    slug: 'tool-design-mcp-integration',
    name: 'Tool Design & MCP Integration',
    full: 'D2 Tool Design & MCP Integration',
    intro:
      'Questions on Model Context Protocol (MCP), tool descriptions, tool scoping, and integrating external systems so Claude agents call the right tools reliably.',
  },
  {
    id: 'D3',
    slug: 'claude-code-configuration-workflows',
    name: 'Claude Code Configuration & Workflows',
    full: 'D3 Claude Code Configuration & Workflows',
    intro:
      'Questions on Claude Code hooks, CLAUDE.md, skills, slash commands, permissions, compaction, and developer workflow configuration.',
  },
  {
    id: 'D4',
    slug: 'prompt-engineering-structured-output',
    name: 'Prompt Engineering & Structured Output',
    full: 'D4 Prompt Engineering & Structured Output',
    intro:
      'Questions on prompting strategies, system prompts, few-shot examples, XML tags, JSON schema / structured outputs, and evaluating prompt quality.',
  },
  {
    id: 'D5',
    slug: 'context-management-reliability',
    name: 'Context Management & Reliability',
    full: 'D5 Context Management & Reliability',
    intro:
      'Questions on context windows, retrieval, memory, reliability patterns, evaluation, and keeping long-running Claude agents grounded and correct.',
  },
]

const SHARED_CSS = `
:root { color-scheme: dark; }
* { box-sizing: border-box; }
body {
  margin: 0;
  min-height: 100svh;
  font-family: 'Segoe UI', system-ui, -apple-system, sans-serif;
  background: #0f1115;
  color: #e8e4dc;
  line-height: 1.55;
}
a { color: #fb923c; text-decoration: none; }
a:hover { color: #fdba74; text-decoration: underline; }
.wrap { max-width: 48rem; margin: 0 auto; padding: 1.5rem 1.25rem 3rem; }
.topnav { display: flex; flex-wrap: wrap; gap: 0.75rem 1.25rem; font-size: 0.85rem; margin-bottom: 1.75rem; color: #8a8276; }
.eyebrow { color: #fb923c; font-size: 0.75rem; font-weight: 700; letter-spacing: 0.18em; text-transform: uppercase; margin: 0 0 0.5rem; }
h1 { font-size: clamp(1.4rem, 3vw, 1.9rem); line-height: 1.25; color: #f4efe6; margin: 0 0 0.75rem; }
h2 { font-size: 1.15rem; color: #f4efe6; margin: 2rem 0 0.75rem; }
h3 { font-size: 1rem; color: #f4efe6; margin: 1.25rem 0 0.5rem; }
.lede, .meta, p { color: #a89f91; }
.meta { font-size: 0.875rem; margin-bottom: 1.25rem; }
.card {
  border: 1px solid rgba(255,255,255,0.12);
  background: rgba(255,255,255,0.04);
  border-radius: 0.85rem;
  padding: 1rem 1.1rem;
  margin: 0.65rem 0;
}
.card a { color: #f4efe6; font-weight: 600; }
.card .sub { display: block; margin-top: 0.3rem; font-size: 0.875rem; color: #a89f91; font-weight: 400; }
.options { list-style: none; padding: 0; margin: 1rem 0; }
.options li {
  border: 1px solid rgba(255,255,255,0.12);
  background: rgba(255,255,255,0.04);
  border-radius: 0.75rem;
  padding: 0.85rem 1rem;
  margin: 0.5rem 0;
}
.options .letter { color: #fb923c; font-weight: 700; margin-right: 0.4rem; }
details {
  border: 1px solid rgba(249,115,22,0.35);
  background: rgba(249,115,22,0.08);
  border-radius: 0.75rem;
  padding: 0.85rem 1rem;
  margin: 1.25rem 0;
}
details summary { cursor: pointer; color: #fdba74; font-weight: 600; }
details[open] summary { margin-bottom: 0.75rem; }
.feedback p { margin: 0.5rem 0; }
.cta {
  display: inline-block;
  margin: 1.25rem 0;
  padding: 0.75rem 1.25rem;
  border-radius: 0.75rem;
  border: 1px solid rgba(249,115,22,0.5);
  background: rgba(249,115,22,0.25);
  color: #fff7ed !important;
  font-weight: 700;
  text-decoration: none !important;
}
.cta:hover { background: rgba(249,115,22,0.35); }
.nav-row { display: flex; flex-wrap: wrap; gap: 1rem; justify-content: space-between; margin-top: 1.5rem; font-size: 0.9rem; }
.footer { margin-top: 2.5rem; padding-top: 1.25rem; border-top: 1px solid rgba(255,255,255,0.08); font-size: 0.8rem; color: #8a8276; }
.grid { display: grid; gap: 0.65rem; }
.prose h2 { margin-top: 1.75rem; }
.prose ul { color: #a89f91; padding-left: 1.2rem; }
.prose li { margin: 0.35rem 0; }
.prose code {
  font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
  font-size: 0.9em;
  color: #fdba74;
  background: rgba(255,255,255,0.06);
  padding: 0.1rem 0.35rem;
  border-radius: 0.3rem;
}
@media (min-width: 640px) { .grid-2 { grid-template-columns: 1fr 1fr; } }
`


function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;')
}

function slugify(text, maxLen = 60) {
  const slug = String(text)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, maxLen)
    .replace(/-+$/g, '')
  return slug || 'question'
}

function absUrl(path) {
  const clean = path.startsWith('/') ? path : `/${path}`
  return `${SITE_ORIGIN}${BASE}${clean}`
}

function relUrl(path) {
  const clean = path.startsWith('/') ? path.slice(1) : path
  return `${BASE}/${clean}`
}

function writePage(relativePath, html) {
  const full = join(DIST, relativePath)
  mkdirSync(dirname(full), { recursive: true })
  writeFileSync(full, html, 'utf8')
}

function layout({ title, description, canonicalPath, body, jsonLd }) {
  const canonical = absUrl(canonicalPath)
  const jsonLdBlock = jsonLd
    ? `<script type="application/ld+json">${JSON.stringify(jsonLd)}</script>`
    : ''
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${escapeHtml(title)}</title>
  <meta name="description" content="${escapeHtml(description)}" />
  <link rel="canonical" href="${canonical}" />
  <link rel="icon" type="image/svg+xml" href="${relUrl('favicon.svg')}" />
  <meta property="og:type" content="article" />
  <meta property="og:title" content="${escapeHtml(title)}" />
  <meta property="og:description" content="${escapeHtml(description)}" />
  <meta property="og:url" content="${canonical}" />
  <meta property="og:image" content="${absUrl('/og-image.png')}" />
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="${escapeHtml(title)}" />
  <meta name="twitter:description" content="${escapeHtml(description)}" />
  <meta name="twitter:image" content="${absUrl('/og-image.png')}" />
  <meta name="robots" content="index, follow" />
  <style>${SHARED_CSS}</style>
  ${jsonLdBlock}
</head>
<body>
  <div class="wrap">
    <nav class="topnav" aria-label="Site">
      <a href="${relUrl('')}">Interactive app</a>
      <a href="${relUrl('practice-questions/')}">All questions</a>
      <a href="${relUrl('guides/ccarf-exam-domains/')}">Domains guide</a>
      <a href="${relUrl('guides/claude-code-hooks/')}">Hooks cheat sheet</a>
    </nav>
    ${body}
    <footer class="footer">
      Free CCARF / Claude Certified Architect Foundations (CCA-F / CCAR-F) practice questions.
      Not affiliated with Anthropic. Created by Aniket Chanana.
    </footer>
  </div>
</body>
</html>`
}

function loadQuestions() {
  const all = []
  for (const paper of PAPERS) {
    const data = JSON.parse(
      readFileSync(join(ROOT, 'src', 'data', paper.file), 'utf8'),
    )
    data.forEach((q, index) => {
      const slug = `${paper.id}-${q.id}-${slugify(q.question)}`
      const path = `/questions/${slug}/`
      all.push({
        ...q,
        paperId: paper.id,
        paperLabel: paper.label,
        index,
        slug,
        path,
        domainMeta: DOMAINS.find((d) => d.full === q.domain) ?? null,
      })
    })
  }
  return all
}

function formatCorrect(correct) {
  return Array.isArray(correct) ? correct.join(', ') : correct
}

function questionJsonLd(q) {
  const options = Object.entries(q.options ?? {})
  const correctLetters = Array.isArray(q.correct_answer)
    ? q.correct_answer
    : [q.correct_answer]
  const accepted = correctLetters
    .map((letter) => q.options?.[letter])
    .filter(Boolean)
    .join(' / ')

  return {
    '@context': 'https://schema.org',
    '@type': 'Quiz',
    name: `CCARF practice question ${q.paperLabel} #${q.id}`,
    about: q.domain,
    educationalLevel: 'Professional certification',
    isAccessibleForFree: true,
    url: absUrl(q.path),
    hasPart: {
      '@type': 'Question',
      name: q.question,
      text: q.question,
      suggestedAnswer: options.map(([, text]) => ({
        '@type': 'Answer',
        text,
      })),
      acceptedAnswer: {
        '@type': 'Answer',
        text: accepted || formatCorrect(q.correct_answer),
      },
    },
  }
}

function renderQuestionPage(q, siblings) {
  const optionsHtml = Object.entries(q.options ?? {})
    .map(
      ([letter, text]) =>
        `<li><span class="letter">${escapeHtml(letter)}.</span>${escapeHtml(text)}</li>`,
    )
    .join('\n')

  const feedbackHtml = Object.entries(q.feedback ?? {})
    .map(
      ([letter, text]) =>
        `<p><strong>${escapeHtml(letter)}:</strong> ${escapeHtml(text)}</p>`,
    )
    .join('\n')

  const domainLink = q.domainMeta
    ? `<a href="${relUrl(`domains/${q.domainMeta.slug}/`)}">${escapeHtml(q.domain)}</a>`
    : escapeHtml(q.domain)

  const prev = siblings[q.index - 1]
  const next = siblings[q.index + 1]
  const related = siblings
    .filter((s) => s.id !== q.id && s.domain === q.domain)
    .slice(0, 5)

  const shortQ =
    q.question.length > 110 ? `${q.question.slice(0, 107)}…` : q.question
  const title = `CCARF ${q.paperLabel} Q${q.id}: ${shortQ}`
  const description = `Free CCARF / Claude Certified Architect Foundations practice question (${q.domain}). Review options and explanations, then try it in the interactive exam app.`

  const practiceHref = relUrl(
    `?paper=${encodeURIComponent(q.paperId)}&mode=flashcard&q=${q.index + 1}`,
  )

  const body = `
    <p class="eyebrow">CCARF Practice Question</p>
    <h1>${escapeHtml(q.paperLabel)} · Question ${q.id}</h1>
    <p class="meta">${domainLink} · ${escapeHtml(q.paperLabel)}</p>
    <h2>${escapeHtml(q.question)}</h2>
    <ul class="options">
      ${optionsHtml}
    </ul>
    <details>
      <summary>Show answer &amp; explanations</summary>
      <p><strong>Correct answer:</strong> ${escapeHtml(formatCorrect(q.correct_answer))}</p>
      <div class="feedback">${feedbackHtml}</div>
    </details>
    <a class="cta" href="${practiceHref}">Practice this in the interactive app</a>
    <div class="nav-row">
      <span>${prev ? `<a href="${relUrl(prev.path.slice(1))}">← Previous: Q${prev.id}</a>` : ''}</span>
      <span>${next ? `<a href="${relUrl(next.path.slice(1))}">Next: Q${next.id} →</a>` : ''}</span>
    </div>
    ${
      related.length
        ? `<h2>Related ${escapeHtml(q.domainMeta?.name ?? 'domain')} questions</h2>
           <div class="grid">${related
             .map(
               (r) =>
                 `<div class="card"><a href="${relUrl(r.path.slice(1))}">${escapeHtml(r.paperLabel)} Q${r.id}</a><span class="sub">${escapeHtml(r.question.slice(0, 140))}${r.question.length > 140 ? '…' : ''}</span></div>`,
             )
             .join('')}</div>`
        : ''
    }
    <p class="meta" style="margin-top:2rem">
      More: <a href="${relUrl(`papers/${q.paperId}/`)}">${escapeHtml(q.paperLabel)}</a> ·
      <a href="${relUrl('practice-questions/')}">All practice questions</a>
    </p>
  `

  return layout({
    title,
    description,
    canonicalPath: q.path,
    body,
    jsonLd: questionJsonLd(q),
  })
}

function renderDomainPage(domain, questions) {
  const title = `CCARF ${domain.id}: ${domain.name} Practice Questions`
  const description = `Free Claude Certified Architect Foundations (${domain.id}) practice questions on ${domain.name}. Part of a 220+ question CCARF / CCA-F exam bank.`
  const list = questions
    .map(
      (q) =>
        `<div class="card"><a href="${relUrl(q.path.slice(1))}">${escapeHtml(q.paperLabel)} · Q${q.id}</a><span class="sub">${escapeHtml(q.question.slice(0, 160))}${q.question.length > 160 ? '…' : ''}</span></div>`,
    )
    .join('\n')

  const otherDomains = DOMAINS.filter((d) => d.id !== domain.id)
    .map(
      (d) =>
        `<a href="${relUrl(`domains/${d.slug}/`)}">${escapeHtml(d.id)} ${escapeHtml(d.name)}</a>`,
    )
    .join(' · ')

  const body = `
    <p class="eyebrow">CCARF Domain ${escapeHtml(domain.id)}</p>
    <h1>${escapeHtml(domain.name)} Practice Questions</h1>
    <p class="lede">${escapeHtml(domain.intro)}</p>
    <p class="meta">${questions.length} questions in this domain · Claude Certified Architect Foundations (CCA-F / CCAR-F)</p>
    <div class="grid">${list}</div>
    <h2>Other domains</h2>
    <p class="meta">${otherDomains}</p>
  `

  return layout({
    title,
    description,
    canonicalPath: `/domains/${domain.slug}/`,
    body,
    jsonLd: {
      '@context': 'https://schema.org',
      '@type': 'CollectionPage',
      name: title,
      description,
      url: absUrl(`/domains/${domain.slug}/`),
      isPartOf: { '@type': 'WebSite', name: 'CCARF Practice Flashcards', url: SITE_URL },
    },
  })
}

function renderPaperPage(paper, questions) {
  const title = `CCARF ${paper.label}: ${paper.description}`
  const description = `Free ${paper.label} for Claude Certified Architect Foundations (CCARF / CCA-F). ${paper.description}. Practice with flashcards or full exam mode.`
  const list = questions
    .map(
      (q) =>
        `<div class="card"><a href="${relUrl(q.path.slice(1))}">Q${q.id}</a><span class="sub">${escapeHtml(q.domain)} — ${escapeHtml(q.question.slice(0, 140))}${q.question.length > 140 ? '…' : ''}</span></div>`,
    )
    .join('\n')

  const practiceHref = relUrl(
    `?paper=${encodeURIComponent(paper.id)}&mode=flashcard&q=1`,
  )

  const body = `
    <p class="eyebrow">CCARF Practice Paper</p>
    <h1>${escapeHtml(paper.label)}</h1>
    <p class="lede">${escapeHtml(paper.description)}. Use flashcard mode for instant feedback or exam mode to simulate the real test.</p>
    <a class="cta" href="${practiceHref}">Start ${escapeHtml(paper.label)} in the app</a>
    <h2>Questions in ${escapeHtml(paper.label)}</h2>
    <div class="grid">${list}</div>
  `

  return layout({
    title,
    description,
    canonicalPath: `/papers/${paper.id}/`,
    body,
    jsonLd: {
      '@context': 'https://schema.org',
      '@type': 'LearningResource',
      name: title,
      description,
      url: absUrl(`/papers/${paper.id}/`),
      learningResourceType: 'Practice exam',
      isAccessibleForFree: true,
    },
  })
}

function renderGuidePage(guide) {
  return layout({
    title: guide.title,
    description: guide.description,
    canonicalPath: `/guides/${guide.slug}/`,
    body: guide.body,
    jsonLd: {
      '@context': 'https://schema.org',
      '@type': 'Article',
      headline: guide.title,
      description: guide.description,
      url: absUrl(`/guides/${guide.slug}/`),
      author: { '@type': 'Person', name: 'Aniket Chanana' },
      isAccessibleForFree: true,
    },
  })
}

function buildGuides() {
  return [
    {
      slug: 'ccarf-exam-domains',
      title:
        'CCARF Exam Domains Explained — Claude Certified Architect Foundations',
      description:
        'A plain-English guide to the five CCARF / CCA-F exam domains: agentic architecture, MCP tools, Claude Code, prompt engineering, and context management.',
      body: `
    <p class="eyebrow">CCARF Study Guide</p>
    <h1>Claude Certified Architect Foundations exam domains explained</h1>
    <p class="lede">
      The CCARF / CCA-F / CCAR-F exam tests whether you can design reliable Claude-powered systems.
      These five domains map to how Anthropic expects architects to think about agents, tools, developer workflows, prompts, and context.
    </p>
    <div class="prose">
      <h2>D1 · Agentic Architecture &amp; Orchestration</h2>
      <p>Design multi-step and multi-agent systems: when to use a single agent vs coordinator patterns, how to route work, hand off context, and keep orchestration simple enough to debug.</p>
      <h2>D2 · Tool Design &amp; MCP Integration</h2>
      <p>Give Claude the right tools through MCP and clear tool descriptions. Prefer narrow, purpose-specific tools over vague catch-all tools, and design for safe, predictable invocation.</p>
      <h2>D3 · Claude Code Configuration &amp; Workflows</h2>
      <p>Configure Claude Code with hooks, CLAUDE.md, skills, permissions, and compaction so developer workflows stay repeatable and reviewable.</p>
      <h2>D4 · Prompt Engineering &amp; Structured Output</h2>
      <p>Write prompts that steer Claude toward correct behavior: system instructions, examples, XML structure, schemas, and evaluation loops for structured outputs.</p>
      <h2>D5 · Context Management &amp; Reliability</h2>
      <p>Keep long-running agents grounded: manage context windows, retrieval, memory, retries, evaluations, and failure modes so answers stay accurate under load.</p>
      <h2>How to practice</h2>
      <ul>
        <li>Drill one domain at a time in the interactive app with the domain filter.</li>
        <li>Then take a full paper in exam mode to simulate the real test.</li>
        <li>Read the per-option explanations — wrong answers often teach the exam’s preferred pattern.</li>
      </ul>
    </div>
    <div class="grid grid-2" style="margin-top:1.25rem">
      ${DOMAINS.map(
        (d) =>
          `<div class="card"><a href="${relUrl(`domains/${d.slug}/`)}">${escapeHtml(d.id)} · ${escapeHtml(d.name)}</a><span class="sub">Browse practice questions</span></div>`,
      ).join('')}
    </div>
    <a class="cta" href="${relUrl('')}">Open the practice app</a>
  `,
    },
    {
      slug: 'claude-code-hooks',
      title: 'Claude Code Hooks Cheat Sheet for CCARF',
      description:
        'Quick CCARF study cheat sheet for Claude Code hooks: PreToolUse, PostToolUse, PreCompact, and common workflow patterns that show up in CCA-F practice questions.',
      body: `
    <p class="eyebrow">CCARF Cheat Sheet</p>
    <h1>Claude Code hooks cheat sheet</h1>
    <p class="lede">
      Hooks let you run custom logic around Claude Code lifecycle events. CCARF questions often ask which hook fits a workflow — archive before compact, gate a tool call, or react after a write.
    </p>
    <div class="prose">
      <h2>Common hook events</h2>
      <ul>
        <li><code>PreToolUse</code> — runs before a tool executes; useful for allow/deny gates and input checks.</li>
        <li><code>PostToolUse</code> — runs after a tool finishes; useful for logging, formatting, or follow-up actions.</li>
        <li><code>PreCompact</code> — runs before conversation compaction; the right place to archive the full transcript.</li>
        <li>Session/stop style hooks — cleanup, summaries, or notifications when a turn or session ends.</li>
      </ul>
      <h2>Patterns the exam likes</h2>
      <ul>
        <li>Prefer the dedicated event over inventing a fake tool name (compaction is not a model tool).</li>
        <li>Keep hooks narrow: snapshot on <code>PreCompact</code>, don’t log every write “just in case”.</li>
        <li>Use permissions + hooks together for safer agentic coding workflows.</li>
        <li>Document project conventions in <code>CLAUDE.md</code>; use hooks for enforcement and automation.</li>
      </ul>
      <h2>Practice these questions</h2>
      <p>Filter the interactive app to <strong>D3 Claude Code Configuration &amp; Workflows</strong>, or browse the domain page for static explanations.</p>
    </div>
    <a class="cta" href="${relUrl('domains/claude-code-configuration-workflows/')}">Browse D3 Claude Code questions</a>
    <a class="cta" href="${relUrl('')}">Open interactive app</a>
  `,
    },
  ]
}

function renderHubPage(allQuestions) {
  const title =
    'CCARF Practice Questions Hub — Claude Certified Architect Foundations'
  const description =
    'Browse 220+ free CCARF / CCA-F / CCAR-F practice exam questions by paper and by domain. Interactive flashcards and full exam mode included.'

  const paperCards = PAPERS.map((p) => {
    const count = allQuestions.filter((q) => q.paperId === p.id).length
    return `<div class="card"><a href="${relUrl(`papers/${p.id}/`)}">${escapeHtml(p.label)}</a><span class="sub">${escapeHtml(p.description)} · ${count} questions</span></div>`
  }).join('\n')

  const domainCards = DOMAINS.map((d) => {
    const count = allQuestions.filter((q) => q.domain === d.full).length
    return `<div class="card"><a href="${relUrl(`domains/${d.slug}/`)}">${escapeHtml(d.id)} · ${escapeHtml(d.name)}</a><span class="sub">${count} questions</span></div>`
  }).join('\n')

  const guideCards = buildGuides()
    .map(
      (g) =>
        `<div class="card"><a href="${relUrl(`guides/${g.slug}/`)}">${escapeHtml(g.title.split(' — ')[0].split(' for ')[0])}</a><span class="sub">${escapeHtml(g.description.slice(0, 120))}…</span></div>`,
    )
    .join('\n')

  const body = `
    <p class="eyebrow">CCARF / CCA-F / CCAR-F</p>
    <h1>Claude Certified Architect Foundations Practice Questions</h1>
    <p class="lede">
      Free Anthropic certification practice bank with ${allQuestions.length} questions and per-option explanations.
      Cover all five CCARF domains, then open the interactive app for flashcard or full exam mode.
    </p>
    <a class="cta" href="${relUrl('')}">Open interactive practice app</a>
    <h2>Study guides</h2>
    <div class="grid grid-2">${guideCards}</div>
    <h2>Practice papers</h2>
    <div class="grid grid-2">${paperCards}</div>
    <h2>Browse by domain</h2>
    <div class="grid grid-2">${domainCards}</div>
  `

  return layout({
    title,
    description,
    canonicalPath: '/practice-questions/',
    body,
    jsonLd: {
      '@context': 'https://schema.org',
      '@type': 'CollectionPage',
      name: title,
      description,
      url: absUrl('/practice-questions/'),
      numberOfItems: allQuestions.length,
    },
  })
}

function writeSitemap(urls) {
  const today = new Date().toISOString().slice(0, 10)
  const body = urls
    .map(
      (u) => `  <url>
    <loc>${escapeHtml(u.loc)}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${u.changefreq}</changefreq>
    <priority>${u.priority}</priority>
  </url>`,
    )
    .join('\n')

  writeFileSync(
    join(DIST, 'sitemap.xml'),
    `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${body}
</urlset>
`,
    'utf8',
  )
}

function writeRobots() {
  writeFileSync(
    join(DIST, 'robots.txt'),
    `User-agent: *
Allow: /

Sitemap: ${SITE_URL}sitemap.xml
`,
    'utf8',
  )
}

function main() {
  if (!existsSync(DIST)) {
    console.error('dist/ not found. Run vite build first.')
    process.exit(1)
  }

  const allQuestions = loadQuestions()
  const byPaper = Object.fromEntries(
    PAPERS.map((p) => [p.id, allQuestions.filter((q) => q.paperId === p.id)]),
  )

  const urls = [
    { loc: SITE_URL, changefreq: 'weekly', priority: '1.0' },
    {
      loc: absUrl('/practice-questions/'),
      changefreq: 'weekly',
      priority: '0.9',
    },
  ]

  // Hub
  writePage('practice-questions/index.html', renderHubPage(allQuestions))

  // Guides
  for (const guide of buildGuides()) {
    writePage(`guides/${guide.slug}/index.html`, renderGuidePage(guide))
    urls.push({
      loc: absUrl(`/guides/${guide.slug}/`),
      changefreq: 'monthly',
      priority: '0.85',
    })
  }

  // Domain pages
  for (const domain of DOMAINS) {
    const qs = allQuestions.filter((q) => q.domain === domain.full)
    writePage(
      `domains/${domain.slug}/index.html`,
      renderDomainPage(domain, qs),
    )
    urls.push({
      loc: absUrl(`/domains/${domain.slug}/`),
      changefreq: 'weekly',
      priority: '0.8',
    })
  }

  // Paper pages
  for (const paper of PAPERS) {
    const qs = byPaper[paper.id]
    writePage(`papers/${paper.id}/index.html`, renderPaperPage(paper, qs))
    urls.push({
      loc: absUrl(`/papers/${paper.id}/`),
      changefreq: 'weekly',
      priority: '0.8',
    })
  }

  // Question pages
  for (const paper of PAPERS) {
    const siblings = byPaper[paper.id]
    for (const q of siblings) {
      writePage(
        `questions/${q.slug}/index.html`,
        renderQuestionPage(q, siblings),
      )
      urls.push({
        loc: absUrl(q.path),
        changefreq: 'monthly',
        priority: '0.6',
      })
    }
  }

  writeSitemap(urls)
  writeRobots()

  // SPA fallback for unknown paths on GitHub Pages
  copyFileSync(join(DIST, 'index.html'), join(DIST, '404.html'))

  console.log(
    `SEO pages generated: ${allQuestions.length} questions, ${DOMAINS.length} domains, ${PAPERS.length} papers, ${buildGuides().length} guides, hub, sitemap, robots, 404.`,
  )
}

main()
