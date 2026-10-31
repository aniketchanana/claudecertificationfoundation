import { useState } from 'react'
import { answersMatch, normalizeCorrect } from '../hooks/useQuiz'
import { SITE_URL } from '../lib/site'
import type { AnswerMap, OptionLetter, Question } from '../types'

type ExamResultsProps = {
  paperLabel: string
  questions: Question[]
  answers: AnswerMap
  correctCount: number
  incorrectCount: number
  onReset: () => void
  onReviewQuestion: (index: number) => void
}

function formatAnswer(value: OptionLetter | OptionLetter[] | undefined) {
  if (value === undefined) return '—'
  return Array.isArray(value) ? value.join(', ') : value
}

function selectionSize(selected: OptionLetter | OptionLetter[] | undefined) {
  if (selected === undefined) return 0
  return Array.isArray(selected) ? selected.length : 1
}

export function ExamResults({
  paperLabel,
  questions,
  answers,
  correctCount,
  incorrectCount,
  onReset,
  onReviewQuestion,
}: ExamResultsProps) {
  const [shareState, setShareState] = useState<'idle' | 'copied' | 'shared'>(
    'idle',
  )
  const unanswered = questions.length - correctCount - incorrectCount
  const pct =
    questions.length > 0
      ? Math.round((correctCount / questions.length) * 100)
      : 0

  const shareText = `I scored ${correctCount}/${questions.length} (${pct}%) on CCARF ${paperLabel} practice — free Claude Certified Architect Foundations questions: ${SITE_URL}`

  const handleShare = async () => {
    try {
      if (typeof navigator !== 'undefined' && navigator.share) {
        await navigator.share({
          title: `CCARF ${paperLabel} score`,
          text: shareText,
          url: SITE_URL,
        })
        setShareState('shared')
        return
      }
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') return
    }

    try {
      await navigator.clipboard.writeText(shareText)
      setShareState('copied')
      window.setTimeout(() => setShareState('idle'), 2000)
    } catch {
      /* ignore */
    }
  }

  return (
    <div className="w-full space-y-5">
      <div className="rounded-2xl border border-white/10 bg-white/5 p-5 sm:p-6">
        <p className="text-xs font-semibold tracking-[0.16em] text-orange-400/90 uppercase">
          Exam complete
        </p>
        <h2 className="mt-2 text-2xl font-semibold text-[#f4efe6]">
          {correctCount} / {questions.length} correct
          <span className="ml-2 text-lg font-normal text-[#8a8276]">
            ({pct}%)
          </span>
        </h2>
        <div className="mt-3 flex flex-wrap gap-2 text-sm">
          <span className="rounded-lg bg-emerald-500/15 px-2.5 py-1 text-emerald-300">
            {correctCount} correct
          </span>
          <span className="rounded-lg bg-rose-500/15 px-2.5 py-1 text-rose-300">
            {incorrectCount} incorrect
          </span>
          {unanswered > 0 && (
            <span className="rounded-lg bg-white/10 px-2.5 py-1 text-[#cfc6b8]">
              {unanswered} unanswered
            </span>
          )}
        </div>
        <div className="mt-5 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={handleShare}
            className="rounded-lg border border-orange-500/40 bg-orange-500/20 px-4 py-2 text-sm font-medium text-orange-100 transition hover:bg-orange-500/30"
          >
            {shareState === 'copied'
              ? 'Copied!'
              : shareState === 'shared'
                ? 'Shared'
                : 'Share score'}
          </button>
          <button
            type="button"
            onClick={onReset}
            className="rounded-lg border border-white/15 px-4 py-2 text-sm text-[#d9d2c5] transition hover:border-orange-400/40"
          >
            Back to start
          </button>
        </div>
      </div>

      <div className="space-y-3">
        {questions.map((q, index) => {
          const selected = answers[q.id]
          const needed = q.select_count ?? 1
          const hasAnswer = selectionSize(selected) >= needed
          const ok = hasAnswer && answersMatch(selected, q.correct_answer)
          const correct = normalizeCorrect(q.correct_answer)

          return (
            <article
              key={q.id}
              className="rounded-xl border border-white/10 bg-white/[0.03] p-4"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs font-medium text-[#8a8276]">
                    Q{index + 1}
                  </span>
                  <span
                    className={`rounded-md px-2 py-0.5 text-xs font-medium ${
                      !hasAnswer
                        ? 'bg-white/10 text-[#cfc6b8]'
                        : ok
                          ? 'bg-emerald-500/15 text-emerald-300'
                          : 'bg-rose-500/15 text-rose-300'
                    }`}
                  >
                    {!hasAnswer ? 'Unanswered' : ok ? 'Correct' : 'Incorrect'}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => onReviewQuestion(index)}
                  className="text-xs text-orange-300/90 hover:text-orange-200"
                >
                  Open
                </button>
              </div>
              <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-[#e8e0d4]">
                {q.question}
              </p>
              <p className="mt-2 text-xs text-[#8a8276]">
                Your answer:{' '}
                <span className="text-[#d9d2c5]">{formatAnswer(selected)}</span>
                {' · '}
                Correct:{' '}
                <span className="text-emerald-300/90">{correct.join(', ')}</span>
              </p>
              {hasAnswer && (
                <p className="mt-2 text-sm leading-relaxed text-[#a89f91]">
                  {correct
                    .map((letter) => q.feedback[letter])
                    .filter(Boolean)
                    .join(' ')}
                </p>
              )}
            </article>
          )
        })}
      </div>
    </div>
  )
}
