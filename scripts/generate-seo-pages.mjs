#!/usr/bin/env node
/**
 * SEO page generator for GitHub Pages / local Vite.
 * Reads question JSON and writes static HTML into --out (default: dist).
 *
 *   node scripts/generate-seo-pages.mjs
 *   node scripts/generate-seo-pages.mjs --out seo-pages
 */
import { mkdirSync, readFileSync, writeFileSync, existsSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { LEARN_URL, renderSiteHeader } from '../shared/site-header.mjs'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, '..')
const SITE_HEADER_CSS = readFileSync(join(ROOT, 'shared/site-header.css'), 'utf8')

function parseOutDir(argv) {
  const idx = argv.indexOf('--out')
  if (idx !== -1 && argv[idx + 1]) {
    return resolve(ROOT, argv[idx + 1])
  }
  return join(ROOT, 'dist')
}

const OUT = parseOutDir(process.argv.slice(2))
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
    weight: '27%',
    intro:
      'Largest exam domain (~27%). Agentic loops, coordinator–subagent orchestration, Task-tool spawning, hooks for enforcement, session resume/fork, and production workflow handoffs.',
  },
  {
    id: 'D2',
    slug: 'tool-design-mcp-integration',
    name: 'Tool Design & MCP Integration',
    full: 'D2 Tool Design & MCP Integration',
    weight: '18%',
    intro:
      'About 18% of the exam. MCP tool/resource design, clear tool descriptions, structured errors (isError), .mcp.json scoping, and choosing built-in tools (Read, Write, Edit, Bash, Grep, Glob).',
  },
  {
    id: 'D3',
    slug: 'claude-code-configuration-workflows',
    name: 'Claude Code Configuration & Workflows',
    full: 'D3 Claude Code Configuration & Workflows',
    weight: '20%',
    intro:
      'About 20% of the exam. CLAUDE.md hierarchy, .claude/rules path scoping, slash commands, skills (context: fork), plan mode vs direct execution, hooks, and CI-friendly Claude Code usage.',
  },
  {
    id: 'D4',
    slug: 'prompt-engineering-structured-output',
    name: 'Prompt Engineering & Structured Output',
    full: 'D4 Prompt Engineering & Structured Output',
    weight: '20%',
    intro:
      'About 20% of the exam. Few-shot prompting, tool_use + JSON schemas, tool_choice, validation/retry loops, Message Batches API tradeoffs, and multi-pass review architectures.',
  },
  {
    id: 'D5',
    slug: 'context-management-reliability',
    name: 'Context Management & Reliability',
    full: 'D5 Context Management & Reliability',
    weight: '15%',
    intro:
      'About 15% of the exam. Context budgets, progressive summarization risks, lost-in-the-middle effects, escalation criteria, structured error propagation, and human-review calibration.',
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
a.card-link {
  display: block;
  color: inherit;
  text-decoration: none !important;
  transition: border-color 0.15s ease, background 0.15s ease;
  cursor: pointer;
}
a.card-link .title {
  display: block;
  color: #f4efe6;
  font-weight: 600;
}
a.card-link:hover {
  border-color: rgba(249,115,22,0.45);
  background: rgba(249,115,22,0.08);
}
a.card-link:hover .title { color: #fdba74; }
a.card-link:focus-visible {
  outline: 2px solid #fb923c;
  outline-offset: 2px;
}
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
  const full = join(OUT, relativePath)
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
  <link rel="sitemap" type="application/xml" title="Sitemap" href="${relUrl('sitemap.xml')}" />
  <link rel="icon" type="image/svg+xml" href="${relUrl('favicon.svg')}" />
  <meta property="og:type" content="article" />
  <meta property="og:title" content="${escapeHtml(title)}" />
  <meta property="og:description" content="${escapeHtml(description)}" />
  <meta property="og:url" content="${canonical}" />
  <meta property="og:image" content="${absUrl('/og-image.png')}" />
  <meta property="og:image:width" content="1200" />
  <meta property="og:image:height" content="630" />
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="${escapeHtml(title)}" />
  <meta name="twitter:description" content="${escapeHtml(description)}" />
  <meta name="twitter:image" content="${absUrl('/og-image.png')}" />
  <meta name="robots" content="index, follow" />
  <style>${SITE_HEADER_CSS}${SHARED_CSS}</style>
  ${jsonLdBlock}
</head>
<body>
  ${renderSiteHeader((path) => relUrl(path), canonicalPath)}
  <div class="wrap">
    ${body}
    <footer class="footer">
      Free CCARF / Claude Certified Architect Foundations (CCA-F / CCAR-F) practice questions.
      Not affiliated with Anthropic. Created by Aniket Chanana.
      Curriculum:
      <a href="${LEARN_URL}" rel="noopener noreferrer" target="_blank">claudecertificationguide.com/learn</a>.
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

  const related = siblings
    .filter((s) => s.id !== q.id && s.domain === q.domain)
    .slice(0, 5)

  const shortQ =
    q.question.length > 110 ? `${q.question.slice(0, 107)}…` : q.question
  const title = `CCARF ${q.paperLabel} Q${q.id}: ${shortQ}`
  const description = `Free CCARF / Claude Certified Architect Foundations practice question (${q.domain}). Review options and explanations, then try it in the interactive exam app.`

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
    ${
      related.length
        ? `<h2>Related ${escapeHtml(q.domainMeta?.name ?? 'domain')} questions</h2>
           <div class="grid">${related
             .map(
               (r) =>
                 `<a class="card card-link" href="${relUrl(r.path.slice(1))}"><span class="title">${escapeHtml(r.paperLabel)} Q${r.id}</span><span class="sub">${escapeHtml(r.question.slice(0, 140))}${r.question.length > 140 ? '…' : ''}</span></a>`,
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
        `<a class="card card-link" href="${relUrl(q.path.slice(1))}"><span class="title">${escapeHtml(q.paperLabel)} · Q${q.id}</span><span class="sub">${escapeHtml(q.question.slice(0, 160))}${q.question.length > 160 ? '…' : ''}</span></a>`,
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
    <p class="meta">${questions.length} practice questions · Official blueprint weight ${escapeHtml(domain.weight ?? '')} · Claude Certified Architect Foundations (CCAR-F)</p>
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
        `<a class="card card-link" href="${relUrl(q.path.slice(1))}"><span class="title">Q${q.id}</span><span class="sub">${escapeHtml(q.domain)} — ${escapeHtml(q.question.slice(0, 140))}${q.question.length > 140 ? '…' : ''}</span></a>`,
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

function guideAttribution() {
  return `<p class="meta" style="margin-top:2rem">
    Study notes paraphrased for CCAR-F / CCARF prep from the public
    <em>Claude Certified Architect – Foundations Exam Guide</em> (exam code CCAR-F, v1.0).
    Unofficial practice aid — not affiliated with Anthropic. Always prefer the latest official guide when scheduling.
  </p>`
}

function buildGuides() {
  return [
    {
      slug: 'ccarf-exam-overview',
      title: 'CCAR-F Exam Overview — Claude Certified Architect Foundations',
      description:
        'CCAR-F / CCARF exam overview: 60 questions, 120 minutes, four scenarios, domain weights, scoring, and who the Anthropic Claude Certified Architect Foundations exam is for.',
      body: `
    <p class="eyebrow">CCAR-F / CCARF</p>
    <h1>Claude Certified Architect – Foundations exam overview</h1>
    <p class="lede">
      The CCAR-F credential checks whether you can make production tradeoffs with Claude Code,
      the Claude Agent SDK, the Claude API, and Model Context Protocol (MCP)—not just recite definitions.
    </p>
    <div class="prose">
      <h2>Exam at a glance</h2>
      <ul>
        <li><strong>Exam code:</strong> CCAR-F (often searched as CCARF / CCA-F / CCAR-F)</li>
        <li><strong>Items:</strong> 60 multiple-choice / multiple-response questions</li>
        <li><strong>Structure:</strong> 4 live scenarios drawn from a bank of 6</li>
        <li><strong>Time:</strong> 120 minutes, proctored</li>
        <li><strong>Passing score:</strong> scaled 720 on a 100–1,000 scale</li>
        <li><strong>Validity:</strong> 12 months (renewal path via Anthropic Partner Academy)</li>
      </ul>
      <h2>Who it is for</h2>
      <p>
        Solution architects with hands-on Claude experience—typically 6+ months building agentic apps,
        Claude Code team workflows, MCP integrations, structured outputs, and reliability/escalation patterns.
      </p>
      <h2>Domain weights</h2>
      <ul>
        ${DOMAINS.map(
          (d) =>
            `<li><strong>${escapeHtml(d.id)} ${escapeHtml(d.name)}</strong> — ${escapeHtml(d.weight)}</li>`,
        ).join('')}
      </ul>
      <h2>How this practice site helps</h2>
      <ul>
        <li>Drill by domain with the in-app filter.</li>
        <li>Use full exam mode for timed-feeling practice papers.</li>
        <li>Read per-option explanations to internalize preferred tradeoffs.</li>
      </ul>
    </div>
    <a class="cta" href="${relUrl('guides/ccarf-exam-scenarios/')}">Review the six exam scenarios</a>
    <a class="cta" href="${relUrl('')}">Open the practice app</a>
    ${guideAttribution()}
  `,
    },
    {
      slug: 'ccarf-exam-domains',
      title:
        'CCARF Exam Domains Explained — Claude Certified Architect Foundations',
      description:
        'CCAR-F domain blueprint with weights: Agentic Architecture (27%), MCP tools (18%), Claude Code (20%), Prompt Engineering (20%), Context & Reliability (15%).',
      body: `
    <p class="eyebrow">CCARF Study Guide</p>
    <h1>CCAR-F exam domains explained</h1>
    <p class="lede">
      The official blueprint weights five domains. Use this as a study map, then drill matching practice questions.
    </p>
    <div class="prose">
      <h2>D1 · Agentic Architecture &amp; Orchestration (${DOMAINS[0].weight})</h2>
      <p>Agentic loops driven by <code>stop_reason</code> (<code>tool_use</code> vs <code>end_turn</code>), hub-and-spoke coordinators, Task-tool subagents with explicit context passing, parallel Task calls, programmatic prerequisites/hooks instead of “hope the prompt remembers,” and session resume/fork choices.</p>
      <h2>D2 · Tool Design &amp; MCP Integration (${DOMAINS[1].weight})</h2>
      <p>Tool descriptions that disambiguate similar tools, splitting vague tools into narrow ones, MCP <code>isError</code> patterns, project vs user MCP config (<code>.mcp.json</code> / <code>~/.claude.json</code>), resources as catalogs, and picking Grep/Glob/Read/Write/Edit/Bash correctly.</p>
      <h2>D3 · Claude Code Configuration &amp; Workflows (${DOMAINS[2].weight})</h2>
      <p>CLAUDE.md hierarchy (user/project/directory), <code>@import</code> and <code>.claude/rules</code> with path globs, project slash commands and skills (<code>context: fork</code>, <code>allowed-tools</code>), plan mode vs direct execution, Explore subagent for noisy discovery, and CI-oriented Claude Code usage.</p>
      <h2>D4 · Prompt Engineering &amp; Structured Output (${DOMAINS[3].weight})</h2>
      <p>Few-shot examples for ambiguous cases, <code>tool_use</code> + JSON schemas for reliable structure, <code>tool_choice</code> (<code>auto</code> / <code>any</code> / forced), validation-retry with error feedback, Message Batches for latency-tolerant work, and independent multi-pass review instead of weak self-review.</p>
      <h2>D5 · Context Management &amp; Reliability (${DOMAINS[4].weight})</h2>
      <p>Protect critical facts from progressive summarization, mitigate lost-in-the-middle, trim verbose tool results, escalate on clear criteria (not vibes), propagate structured errors across agents, and calibrate human review with confidence/stratified sampling ideas.</p>
      <h2>Out of scope (do not over-study)</h2>
      <p>Fine-tuning, billing/auth deep dives, hosting MCP infrastructure, model internals, computer use, vision, embeddings/vector DB plumbing, and cloud-provider setup details are called out as out of scope in the official guide.</p>
    </div>
    <div class="grid grid-2" style="margin-top:1.25rem">
      ${DOMAINS.map(
        (d) =>
          `<div class="card"><a href="${relUrl(`domains/${d.slug}/`)}">${escapeHtml(d.id)} · ${escapeHtml(d.name)}</a><span class="sub">${escapeHtml(d.weight)} of exam · practice questions</span></div>`,
      ).join('')}
    </div>
    <a class="cta" href="${relUrl('')}">Open the practice app</a>
    ${guideAttribution()}
  `,
    },
    {
      slug: 'ccarf-exam-scenarios',
      title: 'CCAR-F Exam Scenarios — Six Production Storylines',
      description:
        'The six CCAR-F scenario banks: support agents, Claude Code workflows, multi-agent research, developer productivity, CI integration, and structured extraction—plus which domains each emphasizes.',
      body: `
    <p class="eyebrow">CCARF Scenarios</p>
    <h1>Six CCAR-F exam scenarios to practice against</h1>
    <p class="lede">
      On exam day you see 4 of these 6 scenario contexts. Practicing across all six keeps you ready for any draw.
    </p>
    <div class="prose">
      <h2>1 · Customer support resolution agent</h2>
      <p>Agent SDK support bot with MCP tools (customer/order/refund/escalate). Focus: orchestration, tool design, escalation/reliability, first-contact resolution without unsafe autonomy.</p>
      <h2>2 · Code generation with Claude Code</h2>
      <p>Team coding with slash commands, CLAUDE.md, and plan mode vs direct execution. Focus: Claude Code configuration and context management.</p>
      <h2>3 · Multi-agent research system</h2>
      <p>Coordinator plus search/analysis/synthesis/report subagents. Focus: orchestration, MCP/tools, context handoffs and coverage gaps.</p>
      <h2>4 · Developer productivity with Claude</h2>
      <p>Codebase exploration agents using built-in tools plus MCP. Focus: tool selection, Claude Code workflows, agent architecture.</p>
      <h2>5 · Claude Code for CI/CD</h2>
      <p>Automated review/test feedback in pipelines with low false positives. Focus: Claude Code + prompt/structured-output design.</p>
      <h2>6 · Structured data extraction</h2>
      <p>Unstructured documents → schema-validated JSON with retries and edge cases. Focus: prompt engineering/structured output and reliability.</p>
    </div>
    <a class="cta" href="${relUrl('guides/ccarf-exam-domains/')}">Map scenarios to domains</a>
    <a class="cta" href="${relUrl('')}">Practice in the app</a>
    ${guideAttribution()}
  `,
    },
    {
      slug: 'claude-code-hooks',
      title: 'Claude Code Study Notes for CCARF (CLAUDE.md, Skills, Hooks)',
      description:
        'CCAR-F Domain 3 study notes: CLAUDE.md hierarchy, .claude/rules, slash commands, skills with context:fork, plan mode, and hooks patterns that show up in practice questions.',
      body: `
    <p class="eyebrow">Domain 3 Cheat Sheet</p>
    <h1>Claude Code configuration notes for CCAR-F</h1>
    <p class="lede">
      Domain 3 is ~20% of the exam. Questions reward correct scoping (user vs project), isolation (<code>context: fork</code>),
      and deterministic enforcement (hooks/gates) over vague prompt-only hopes.
    </p>
    <div class="prose">
      <h2>CLAUDE.md hierarchy</h2>
      <ul>
        <li>User-level (<code>~/.claude/CLAUDE.md</code>) is personal—teammates will not get it via git.</li>
        <li>Project-level (<code>CLAUDE.md</code> / <code>.claude/CLAUDE.md</code>) is the shared source of truth.</li>
        <li>Use <code>@import</code> and <code>.claude/rules/</code> to keep standards modular; path globs load rules only when relevant files are touched.</li>
        <li><code>/memory</code> helps verify what is actually loaded when behavior looks inconsistent.</li>
      </ul>
      <h2>Commands &amp; skills</h2>
      <ul>
        <li>Project commands live in <code>.claude/commands/</code>; personal ones in <code>~/.claude/commands/</code>.</li>
        <li>Skills (<code>.claude/skills/*/SKILL.md</code>) support frontmatter like <code>context: fork</code>, <code>allowed-tools</code>, and <code>argument-hint</code>.</li>
        <li>Forked skill context keeps verbose exploration from polluting the main thread.</li>
      </ul>
      <h2>Plan mode vs direct execution</h2>
      <ul>
        <li>Plan mode for large/architectural/multi-approach work.</li>
        <li>Direct execution for narrow, well-scoped fixes.</li>
        <li>Explore subagents for noisy discovery so the main context stays clean.</li>
      </ul>
      <h2>Hooks patterns that matter</h2>
      <ul>
        <li><code>PreToolUse</code> / interception hooks: gate policy-sensitive calls before they run.</li>
        <li><code>PostToolUse</code>: normalize tool results (dates, status codes) before the model reasons on them.</li>
        <li><code>PreCompact</code>: archive transcripts before compaction discards detail.</li>
        <li>Prefer dedicated lifecycle hooks over inventing fake tool names for non-tool operations.</li>
      </ul>
      <h2>MCP config reminders</h2>
      <ul>
        <li>Shared servers → project <code>.mcp.json</code> with <code>\${ENV}</code> expansion for secrets.</li>
        <li>Personal experiments → user-level Claude config so they do not ship to the team.</li>
      </ul>
    </div>
    <a class="cta" href="${relUrl('domains/claude-code-configuration-workflows/')}">Browse D3 practice questions</a>
    <a class="cta" href="${relUrl('')}">Open interactive app</a>
    ${guideAttribution()}
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
    return `<div class="card"><a href="${relUrl(`papers/${p.id}/`)}">${escapeHtml(p.label)}</a><span class="sub">${escapeHtml(p.description)} (${count})</span></div>`
  }).join('\n')

  const domainCards = DOMAINS.map((d) => {
    const count = allQuestions.filter((q) => q.domain === d.full).length
    return `<div class="card"><a href="${relUrl(`domains/${d.slug}/`)}">${escapeHtml(d.id)} · ${escapeHtml(d.name)}</a><span class="sub">${escapeHtml(d.weight)} of exam · ${count} practice questions</span></div>`
  }).join('\n')

  const guideCards = buildGuides()
    .map(
      (g) =>
        `<div class="card"><a href="${relUrl(`guides/${g.slug}/`)}">${escapeHtml(g.title.split(' — ')[0].split(' for ')[0])}</a><span class="sub">${escapeHtml(g.description.slice(0, 120))}…</span></div>`,
    )
    .join('\n')

  const body = `
    <p class="eyebrow">CCAR-F / CCARF / CCA-F</p>
    <h1>Claude Certified Architect Foundations Practice Questions</h1>
    <p class="lede">
      Free practice bank aligned to the official CCAR-F blueprint (${allQuestions.length} questions with explanations).
      Study the five weighted domains and six scenario storylines, then drill in flashcard or full exam mode.
    </p>
    <a class="cta" href="${relUrl('')}">Open interactive practice app</a>
    <a class="cta" href="${LEARN_URL}" rel="noopener noreferrer" target="_blank">Learn curriculum</a>
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
    join(OUT, 'sitemap.xml'),
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
    join(OUT, 'robots.txt'),
    `User-agent: *
Allow: /

Sitemap: ${SITE_URL}sitemap.xml
`,
    'utf8',
  )
}

function main() {
  mkdirSync(OUT, { recursive: true })

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

  // SPA fallback for unknown paths on GitHub Pages (only when building into dist)
  const spaIndex = join(OUT, 'index.html')
  if (existsSync(spaIndex)) {
    const spaHtml = readFileSync(spaIndex, 'utf8')
    const notFound = spaHtml.includes('name="robots"')
      ? spaHtml.replace(
          /<meta\s+name="robots"\s+content="[^"]*"\s*\/?>/,
          '<meta name="robots" content="noindex, follow" />',
        )
      : spaHtml.replace(
          '</head>',
          '    <meta name="robots" content="noindex, follow" />\n  </head>',
        )
    writeFileSync(join(OUT, '404.html'), notFound)
  }

  console.log(
    `SEO pages generated into ${OUT}: ${allQuestions.length} questions, ${DOMAINS.length} domains, ${PAPERS.length} papers, ${buildGuides().length} guides, hub, sitemap, robots.`,
  )
}

main()
