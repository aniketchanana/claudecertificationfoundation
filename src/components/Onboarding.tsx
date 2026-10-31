import { BROWSE_LINKS, isExternalHref } from '../lib/site'
import type { Paper, PaperId, StudyMode } from '../types'
import { Disclaimer } from './Disclaimer'
import { SiteHeader } from './SiteHeader'

type OnboardingProps = {
  papers: Paper[]
  selectedPaperId: PaperId | null
  selectedMode: StudyMode | null
  onSelectPaper: (paperId: PaperId) => void
  onSelectMode: (mode: StudyMode) => void
  onStart: () => void
}

const MODES: { id: StudyMode; title: string; blurb: string }[] = [
  {
    id: 'flashcard',
    title: 'Flashcard',
    blurb: 'Feedback after each answer',
  },
  {
    id: 'exam',
    title: 'Full exam',
    blurb: 'Results unlock at the end',
  },
]

function paperBlurb(description: string) {
  return description.split(' · ')[0]
}

export function Onboarding({
  papers,
  selectedPaperId,
  selectedMode,
  onSelectPaper,
  onSelectMode,
  onStart,
}: OnboardingProps) {
  const canStart = Boolean(selectedPaperId && selectedMode)

  return (
    <div className="flex min-h-svh flex-col">
      <SiteHeader />
      <div className="mx-auto flex w-full max-w-5xl flex-1 flex-col justify-center gap-5 px-4 py-5 sm:px-6">
        <header className="space-y-1">
          <p className="text-xs font-semibold tracking-[0.2em] text-orange-400/90 uppercase">
            CCARF Practice Exam
          </p>
          <h1 className="text-2xl font-semibold tracking-tight text-[#f4efe6] sm:text-3xl">
            Set up your session
          </h1>
          <p className="text-sm leading-snug text-[#a89f91]">
            Choose a paper and a study mode. Progress is saved for one session
            at a time.
          </p>
        </header>

        <section className="space-y-2">
          <h2 className="text-xs font-semibold tracking-[0.16em] text-[#8a8276] uppercase">
            1 · Question paper
          </h2>
          <div className="grid grid-cols-2 gap-2 md:grid-cols-3">
            {papers.map((paper) => {
              const selected = paper.id === selectedPaperId
              return (
                <button
                  key={paper.id}
                  type="button"
                  onClick={() => onSelectPaper(paper.id)}
                  className={`rounded-xl border px-3 py-2.5 text-left transition ${
                    selected
                      ? 'border-orange-400/70 bg-orange-500/20'
                      : 'border-white/12 bg-white/5 hover:border-orange-400/40'
                  }`}
                >
                  <div className="flex items-baseline justify-between gap-2">
                    <p className="font-semibold text-[#f4efe6]">{paper.label}</p>
                    <span
                      className={`shrink-0 text-xs tabular-nums ${
                        selected ? 'text-orange-200' : 'text-[#8a8276]'
                      }`}
                    >
                      {paper.questionCount}q
                    </span>
                  </div>
                  <p className="mt-0.5 text-xs leading-snug text-[#a89f91]">
                    {paperBlurb(paper.description)}
                  </p>
                </button>
              )
            })}
          </div>
        </section>

        <section className="space-y-2">
          <h2 className="text-xs font-semibold tracking-[0.16em] text-[#8a8276] uppercase">
            2 · Study mode
          </h2>
          <div className="grid grid-cols-2 gap-2">
            {MODES.map((mode) => {
              const selected = mode.id === selectedMode
              return (
                <button
                  key={mode.id}
                  type="button"
                  onClick={() => onSelectMode(mode.id)}
                  className={`rounded-xl border px-3 py-2.5 text-left transition ${
                    selected
                      ? 'border-orange-400/70 bg-orange-500/20'
                      : 'border-white/12 bg-white/5 hover:border-orange-400/40'
                  }`}
                >
                  <p className="font-semibold text-[#f4efe6]">{mode.title}</p>
                  <p className="mt-0.5 text-xs leading-snug text-[#a89f91]">
                    {mode.blurb}
                  </p>
                </button>
              )
            })}
          </div>
        </section>

        <button
          type="button"
          disabled={!canStart}
          onClick={onStart}
          className="rounded-xl border border-orange-500/50 bg-orange-500/25 px-6 py-3 text-base font-semibold text-orange-50 transition hover:bg-orange-500/35 disabled:cursor-not-allowed disabled:opacity-40"
        >
          Start
        </button>

        <nav
          aria-label="Study resources"
          className="flex flex-wrap gap-x-4 gap-y-2 border-t border-white/10 pt-4 text-sm"
        >
          {BROWSE_LINKS.map((link) => {
            const external = isExternalHref(link.href)
            return (
              <a
                key={link.href}
                href={link.href}
                className="text-orange-300/90 underline-offset-2 hover:text-orange-200 hover:underline"
                {...(external
                  ? { target: '_blank', rel: 'noopener noreferrer' }
                  : {})}
              >
                {link.label}
              </a>
            )
          })}
        </nav>
      </div>
      <Disclaimer />
    </div>
  )
}
