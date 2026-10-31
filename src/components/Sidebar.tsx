import type { StudyMode } from '../types'

export type DomainOption = {
  full: string
  label: string
  count: number
}

type SidebarProps = {
  paperLabel: string
  mode: StudyMode
  current: number
  total: number
  answeredCount: number
  correctCount: number
  incorrectCount: number
  canPrev: boolean
  canNext: boolean
  showScore: boolean
  domains: DomainOption[]
  selectedDomain: string | null
  onDomainChange: (domain: string | null) => void
  onPrev: () => void
  onNext: () => void
  onReset: () => void
  onSubmitExam?: () => void
  examReadyToSubmit?: boolean
}

export function Sidebar({
  paperLabel,
  mode,
  current,
  total,
  answeredCount,
  correctCount,
  incorrectCount,
  canPrev,
  canNext,
  showScore,
  domains,
  selectedDomain,
  onDomainChange,
  onPrev,
  onNext,
  onReset,
  onSubmitExam,
  examReadyToSubmit,
}: SidebarProps) {
  const pct = total > 0 ? (answeredCount / total) * 100 : 0
  const showMobileNav = canPrev || canNext || Boolean(onSubmitExam && !showScore)

  return (
    <>
      <aside className="flex w-full shrink-0 flex-col gap-2.5 border-b border-white/10 px-3 pb-3 lg:w-56 lg:gap-5 lg:border-b-0 lg:border-r lg:px-0 lg:pb-0 lg:pr-5">
        <div className="flex items-start justify-between gap-3 lg:hidden">
          <div className="min-w-0">
            <p className="truncate text-[11px] font-semibold tracking-[0.16em] text-orange-400/90 uppercase">
              {paperLabel}
              <span className="font-medium tracking-normal text-[#8a8276] normal-case">
                {' '}
                · {mode === 'flashcard' ? 'Flashcard' : 'Exam'}
              </span>
            </p>
            <p className="mt-0.5 text-sm text-[#cfc6b8]">
              <span className="font-semibold text-[#f4efe6]">{current}</span>
              <span className="text-[#8a8276]"> / {total}</span>
              {showScore && answeredCount > 0 ? (
                <>
                  <span className="text-[#8a8276]"> · </span>
                  <span className="text-emerald-300">{correctCount} correct</span>
                  <span className="text-[#8a8276]"> · </span>
                  <span className="text-rose-300">{incorrectCount} wrong</span>
                </>
              ) : (
                answeredCount > 0 && (
                  <>
                    <span className="text-[#8a8276]"> · </span>
                    <span>{answeredCount} answered</span>
                  </>
                )
              )}
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            {mode === 'exam' && onSubmitExam && !showScore && (
              <button
                type="button"
                onClick={onSubmitExam}
                disabled={!examReadyToSubmit}
                aria-label="Submit exam"
                className="rounded-lg border border-emerald-500/40 bg-emerald-500/15 px-2.5 py-1 text-xs font-medium text-emerald-200 transition hover:bg-emerald-500/25 disabled:opacity-35"
              >
                Submit
              </button>
            )}
            <button
              type="button"
              onClick={onReset}
              className="pt-0.5 text-xs text-[#a89f91] underline-offset-2 hover:text-orange-200 hover:underline"
            >
              Home
            </button>
          </div>
        </div>

        <div className="h-1 w-full overflow-hidden rounded-full bg-white/10 lg:hidden">
          <div
            className="h-full rounded-full bg-gradient-to-r from-orange-500 to-amber-400 transition-all duration-300"
            style={{ width: `${pct}%` }}
          />
        </div>

        <DomainSelect
          className="lg:hidden"
          domains={domains}
          selectedDomain={selectedDomain}
          onDomainChange={onDomainChange}
        />

        <div className="hidden lg:contents">
          <div className="min-w-0 flex-1 lg:flex-none">
            <p className="text-[11px] font-semibold tracking-[0.18em] text-orange-400/90 uppercase">
              {paperLabel}
            </p>
            <p className="mt-1 text-lg font-semibold text-[#f4efe6]">
              {current}
              <span className="font-normal text-[#8a8276]"> / {total}</span>
            </p>
            <p className="mt-0.5 text-xs text-[#8a8276]">
              {mode === 'flashcard' ? 'Flashcard' : 'Full exam'}
            </p>
          </div>

          <DomainSelect
            className="w-full lg:order-2"
            showLabel
            domains={domains}
            selectedDomain={selectedDomain}
            onDomainChange={onDomainChange}
          />

          <div className="h-1 w-full overflow-hidden rounded-full bg-white/10 lg:order-3">
            <div
              className="h-full rounded-full bg-gradient-to-r from-orange-500 to-amber-400 transition-all duration-300"
              style={{ width: `${pct}%` }}
            />
          </div>

          <div className="flex flex-wrap items-center gap-2 lg:order-4 lg:flex-col lg:items-stretch">
            {showScore ? (
              <>
                <span className="rounded-lg bg-emerald-500/15 px-2.5 py-1 text-xs font-medium text-emerald-300 lg:text-sm">
                  {correctCount} correct
                </span>
                <span className="rounded-lg bg-rose-500/15 px-2.5 py-1 text-xs font-medium text-rose-300 lg:text-sm">
                  {incorrectCount} incorrect
                </span>
              </>
            ) : (
              <span className="rounded-lg bg-white/8 px-2.5 py-1 text-xs font-medium text-[#cfc6b8] lg:text-sm">
                {answeredCount} answered
              </span>
            )}
          </div>

          <div className="ml-auto flex items-center gap-2 lg:order-5 lg:ml-0 lg:flex-col lg:items-stretch">
            <NavButtons
              canPrev={canPrev}
              canNext={canNext}
              onPrev={onPrev}
              onNext={onNext}
            />

            {mode === 'exam' && onSubmitExam && !showScore && (
              <button
                type="button"
                onClick={onSubmitExam}
                disabled={!examReadyToSubmit}
                className="rounded-lg border border-emerald-500/40 bg-emerald-500/15 px-3 py-1.5 text-sm font-medium text-emerald-200 transition hover:bg-emerald-500/25 disabled:opacity-35"
              >
                Submit exam
              </button>
            )}

            <button
              type="button"
              onClick={onReset}
              className="rounded-lg border border-white/15 bg-transparent px-3 py-1.5 text-sm text-[#a89f91] transition hover:border-orange-400/40 hover:text-orange-200"
            >
              Back to home
            </button>
          </div>
        </div>
      </aside>

      {showMobileNav && (
        <div className="fixed inset-x-0 bottom-0 z-30 border-t border-white/10 bg-[#0f1115]/95 px-3 pt-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] backdrop-blur-md lg:hidden">
          <div className="mx-auto w-full max-w-6xl">
            <NavButtons
              canPrev={canPrev}
              canNext={canNext}
              onPrev={onPrev}
              onNext={onNext}
              stretch
            />
          </div>
        </div>
      )}
    </>
  )
}

function DomainSelect({
  domains,
  selectedDomain,
  onDomainChange,
  className,
  showLabel = false,
}: {
  domains: DomainOption[]
  selectedDomain: string | null
  onDomainChange: (domain: string | null) => void
  className?: string
  showLabel?: boolean
}) {
  return (
    <label className={className}>
      {showLabel ? (
        <span className="mb-1 block text-[11px] font-semibold tracking-[0.14em] text-[#8a8276] uppercase">
          Domain
        </span>
      ) : (
        <span className="sr-only">Domain</span>
      )}
      <select
        value={selectedDomain ?? ''}
        onChange={(e) => onDomainChange(e.target.value || null)}
        className="w-full rounded-lg border border-white/15 bg-[#16181d] px-2.5 py-2 text-sm text-[#f4efe6] outline-none transition hover:border-orange-400/40 focus:border-orange-400/60 lg:py-1.5"
      >
        <option value="">All domains</option>
        {domains.map((domain) => (
          <option key={domain.full} value={domain.full}>
            {domain.label} ({domain.count})
          </option>
        ))}
      </select>
    </label>
  )
}

function NavButtons({
  canPrev,
  canNext,
  onPrev,
  onNext,
  stretch = false,
}: {
  canPrev: boolean
  canNext: boolean
  onPrev: () => void
  onNext: () => void
  stretch?: boolean
}) {
  const width = stretch ? 'flex-1 py-2.5' : 'px-3 py-1.5'
  return (
    <div className={stretch ? 'flex w-full gap-2' : 'flex gap-2 lg:grid lg:grid-cols-2'}>
      <button
        type="button"
        onClick={onPrev}
        disabled={!canPrev}
        aria-label="Previous question"
        className={`rounded-lg border border-white/15 bg-white/5 ${width} text-sm text-[#f4efe6] transition hover:bg-white/10 disabled:opacity-35`}
      >
        Prev
      </button>
      <button
        type="button"
        onClick={onNext}
        disabled={!canNext}
        aria-label="Next question"
        className={`rounded-lg border border-orange-500/40 bg-orange-500/20 ${width} text-sm text-orange-100 transition hover:bg-orange-500/30 disabled:opacity-35`}
      >
        Next
      </button>
    </div>
  )
}
