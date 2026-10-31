import { useMemo } from 'react'
import { normalizeCorrect } from '../hooks/useQuiz'
import type { OptionLetter, Question } from '../types'

type FlashcardProps = {
  question: Question
  selected: OptionLetter | OptionLetter[] | undefined
  isAnswered: boolean
  isCorrect: boolean
  selectCount: number
  /** When false (exam mode), hide flip / feedback until results. */
  revealFeedback: boolean
  onSelect: (letter: OptionLetter) => void
}

function isSelectedLetter(
  selected: OptionLetter | OptionLetter[] | undefined,
  letter: OptionLetter,
) {
  if (selected === undefined) return false
  return Array.isArray(selected) ? selected.includes(letter) : selected === letter
}

export function Flashcard({
  question,
  selected,
  isAnswered,
  isCorrect,
  selectCount,
  revealFeedback,
  onSelect,
}: FlashcardProps) {
  const letters = useMemo(
    () =>
      (Object.keys(question.options) as OptionLetter[]).sort((a, b) =>
        a.localeCompare(b),
      ),
    [question.options],
  )

  const selectedList = useMemo(() => {
    if (selected === undefined) return [] as OptionLetter[]
    return Array.isArray(selected) ? selected : [selected]
  }, [selected])

  const correctList = normalizeCorrect(question.correct_answer)
  const showBack = revealFeedback && isAnswered

  const feedbackBody =
    selectCount === 1
      ? selectedList[0]
        ? question.feedback[selectedList[0]]
        : undefined
      : selectedList
          .map((letter) => `${letter}: ${question.feedback[letter] ?? ''}`)
          .join('\n\n')

  return (
    <div className="perspective w-full max-lg:-mx-3 max-lg:w-auto lg:mx-0">
      <div className={`flashcard-inner ${showBack ? 'is-flipped' : ''}`}>
        <div className="flashcard-face border border-[#e8dfd0]/20 bg-[#f7f1e6] p-4 text-left shadow-xl shadow-black/30 max-lg:rounded-none max-lg:border-x-0 max-lg:shadow-none sm:p-7 lg:rounded-2xl">
          <span className="inline-block max-w-full truncate rounded-full bg-orange-500/15 px-2.5 py-0.5 text-[11px] font-semibold tracking-wide text-orange-800 uppercase">
            {question.domain}
          </span>
          <p className="mt-3 text-[15px] leading-relaxed font-medium text-[#1c1915] sm:text-base">
            {question.question}
          </p>
          {selectCount > 1 && (
            <p className="mt-2 text-sm text-[#6b6358]">
              Select {selectCount}
              {selectedList.length > 0
                ? ` · ${selectedList.length} selected`
                : ''}
            </p>
          )}
          <div className="mt-5 space-y-2">
            {letters.map((letter) => {
              const active = isSelectedLetter(selected, letter)
              const locked = revealFeedback && isAnswered
              return (
                <button
                  key={letter}
                  type="button"
                  disabled={locked}
                  onClick={() => onSelect(letter)}
                  className={`flex w-full items-start gap-3 rounded-xl border px-3.5 py-2.5 text-left transition ${
                    active
                      ? 'border-orange-500 bg-orange-50 shadow-sm'
                      : 'border-[#d9d0c0] bg-white/70 hover:border-orange-400 hover:bg-orange-50/60'
                  } disabled:cursor-default`}
                >
                  <span
                    className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                      active
                        ? 'bg-orange-500 text-white'
                        : 'bg-[#efe8db] text-[#3f3a33]'
                    }`}
                  >
                    {letter}
                  </span>
                  <span className="text-sm leading-relaxed text-[#2a261f]">
                    {question.options[letter]}
                  </span>
                </button>
              )
            })}
          </div>
        </div>

        {revealFeedback && (
          <div className="flashcard-face flashcard-back flex flex-col overflow-auto border border-[#e8dfd0]/20 bg-[#f7f1e6] p-4 text-left shadow-xl shadow-black/30 max-lg:rounded-none max-lg:border-x-0 max-lg:shadow-none sm:p-7 lg:rounded-2xl">
            <div
              className={`rounded-xl px-3.5 py-2.5 text-sm font-semibold ${
                isCorrect
                  ? 'bg-emerald-500/15 text-emerald-800'
                  : 'bg-rose-500/15 text-rose-800'
              }`}
            >
              {isCorrect ? 'Correct' : 'Incorrect'}
              {selectCount > 1 && selectedList.length > 0 && (
                <span className="ml-2 font-normal opacity-80">
                  (you selected {selectedList.join(', ')})
                </span>
              )}
            </div>

            {feedbackBody && (
              <div className="mt-4">
                <p className="text-[11px] font-semibold tracking-wide text-[#8a8072] uppercase">
                  Feedback for your choice
                </p>
                <p className="mt-1.5 whitespace-pre-line text-sm leading-relaxed text-[#2a261f]">
                  {feedbackBody}
                </p>
              </div>
            )}

            {!isCorrect && (
              <div className="mt-4 rounded-xl border border-emerald-600/25 bg-emerald-50/80 p-3.5">
                <p className="text-[11px] font-semibold tracking-wide text-emerald-800 uppercase">
                  Correct answer{correctList.length > 1 ? 's' : ''}
                </p>
                <div className="mt-2 space-y-2.5">
                  {correctList.map((letter) => (
                    <div key={letter}>
                      <p className="text-sm font-semibold text-emerald-900">
                        {letter}. {question.options[letter]}
                      </p>
                      {question.feedback[letter] && (
                        <p className="mt-1 text-sm leading-relaxed text-emerald-900/80">
                          {question.feedback[letter]}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            <p className="mt-auto pt-5 text-xs text-[#8a8072]">
              {question.domain}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
