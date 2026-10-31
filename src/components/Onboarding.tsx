import type { Paper, PaperId, StudyMode } from '../types'
import { BROWSE_LINKS } from '../lib/site'
import { Disclaimer } from './Disclaimer'

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
    title: 'Flashcard mode',
    blurb: 'Instant feedback after each answer — best for learning as you go.',
  },
  {
    id: 'exam',
    title: 'Full exam mode',
    blurb: 'Answer everything first. Results and explanations unlock at the end.',
  },
]

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
      <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col justify-center gap-8 px-4 py-10 sm:px-6">
      <div className="space-y-2">
        <p className="text-xs font-semibold tracking-[0.2em] text-orange-400/90 uppercase">
          CCARF Practice Exam
        </p>
        <h1 className="text-3xl font-semibold tracking-tight text-[#f4efe6] sm:text-4xl">
          Set up your session
        </h1>
        <p className="text-sm leading-relaxed text-[#a89f91] sm:text-base">
          A practice set by Aniket Chanana. Choose a paper and a study mode.
          Progress is saved for one session at a time.
        </p>
      </div>

      <section className="space-y-3">
        <h2 className="text-xs font-semibold tracking-[0.16em] text-[#8a8276] uppercase">
          1 · Question paper
        </h2>
        <div className="grid gap-2">
          {papers.map((paper) => {
            const selected = paper.id === selectedPaperId
            return (
              <button
                key={paper.id}
                type="button"
                onClick={() => onSelectPaper(paper.id)}
                className={`rounded-xl border px-4 py-3 text-left transition ${
                  selected
                    ? 'border-orange-400/70 bg-orange-500/20'
                    : 'border-white/12 bg-white/5 hover:border-orange-400/40'
                }`}
              >
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="font-semibold text-[#f4efe6]">{paper.label}</p>
                    <p className="mt-0.5 text-sm text-[#a89f91]">
                      {paper.description}
                    </p>
                  </div>
                  <span className="text-xs text-[#8a8276]">
                    {paper.questionCount}q
                  </span>
                </div>
              </button>
            )
          })}
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-xs font-semibold tracking-[0.16em] text-[#8a8276] uppercase">
          2 · Study mode
        </h2>
        <div className="grid gap-2 sm:grid-cols-2">
          {MODES.map((mode) => {
            const selected = mode.id === selectedMode
            return (
              <button
                key={mode.id}
                type="button"
                onClick={() => onSelectMode(mode.id)}
                className={`rounded-xl border px-4 py-3 text-left transition ${
                  selected
                    ? 'border-orange-400/70 bg-orange-500/20'
                    : 'border-white/12 bg-white/5 hover:border-orange-400/40'
                }`}
              >
                <p className="font-semibold text-[#f4efe6]">{mode.title}</p>
                <p className="mt-1 text-sm leading-snug text-[#a89f91]">
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

      <p className="flex flex-wrap justify-center gap-x-4 gap-y-1 text-center text-xs text-[#8a8276]">
        {BROWSE_LINKS.map((link) => (
          <a
            key={link.href}
            href={link.href}
            className="underline-offset-2 hover:text-orange-200 hover:underline"
          >
            {link.label}
          </a>
        ))}
      </p>
      </div>
      <Disclaimer />
    </div>
  )
}
