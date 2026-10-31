import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  clearStoredProgress,
  loadStoredProgress,
  saveStoredProgress,
} from '../lib/progress'
import type {
  AnswerMap,
  OptionLetter,
  PaperId,
  Question,
  StudyMode,
} from '../types'

export function normalizeCorrect(
  correct: Question['correct_answer'],
): OptionLetter[] {
  return Array.isArray(correct) ? correct : [correct]
}

export function answersMatch(
  selected: OptionLetter | OptionLetter[] | undefined,
  correct: Question['correct_answer'],
): boolean {
  if (selected === undefined) return false
  const selectedList = Array.isArray(selected)
    ? [...selected].sort()
    : [selected]
  const correctList = [...normalizeCorrect(correct)].sort()
  if (selectedList.length !== correctList.length) return false
  return selectedList.every((letter, i) => letter === correctList[i])
}

function selectionSize(selected: OptionLetter | OptionLetter[] | undefined) {
  if (selected === undefined) return 0
  return Array.isArray(selected) ? selected.length : 1
}

function sameDomainFilter(
  saved: string | null | undefined,
  current: string | null,
) {
  return (saved ?? null) === current
}

export function useQuiz(
  questions: Question[],
  paperId: PaperId,
  mode: StudyMode,
  initialIndex?: number,
  domainFilter: string | null = null,
) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [answers, setAnswers] = useState<AnswerMap>({})
  const [examSubmitted, setExamSubmitted] = useState(false)
  const [ready, setReady] = useState(false)
  const appliedDeepLink = useRef(false)

  useEffect(() => {
    const clamp = (index: number) =>
      Math.min(Math.max(index, 0), Math.max(questions.length - 1, 0))

    const saved = loadStoredProgress()
    const shouldUseDeepLink =
      !appliedDeepLink.current &&
      initialIndex !== undefined &&
      Number.isFinite(initialIndex) &&
      initialIndex >= 0

    if (shouldUseDeepLink) {
      appliedDeepLink.current = true
      const index = clamp(initialIndex)
      setCurrentIndex(index)
      setAnswers({})
      setExamSubmitted(false)
      saveStoredProgress({
        paperId,
        mode,
        currentIndex: index,
        answers: {},
        examSubmitted: false,
        domainFilter,
      })
    } else if (
      saved &&
      saved.paperId === paperId &&
      saved.mode === mode &&
      sameDomainFilter(saved.domainFilter, domainFilter)
    ) {
      setCurrentIndex(clamp(saved.currentIndex))
      setAnswers(saved.answers)
      setExamSubmitted(Boolean(saved.examSubmitted))
    } else {
      setCurrentIndex(0)
      setAnswers({})
      setExamSubmitted(false)
      saveStoredProgress({
        paperId,
        mode,
        currentIndex: 0,
        answers: {},
        examSubmitted: false,
        domainFilter,
      })
    }
    setReady(true)
  }, [paperId, mode, questions.length, initialIndex, domainFilter])

  useEffect(() => {
    if (!ready) return
    saveStoredProgress({
      paperId,
      mode,
      currentIndex,
      answers,
      examSubmitted,
      domainFilter,
    })
  }, [
    answers,
    currentIndex,
    examSubmitted,
    mode,
    paperId,
    ready,
    domainFilter,
  ])

  const current = questions[currentIndex]
  const selected = current ? answers[current.id] : undefined
  const selectCount = current?.select_count ?? 1
  const isAnswered =
    selected !== undefined && selectionSize(selected) >= selectCount

  const answeredCount = useMemo(() => {
    let count = 0
    for (const q of questions) {
      const ans = answers[q.id]
      const needed = q.select_count ?? 1
      if (ans !== undefined && selectionSize(ans) >= needed) count += 1
    }
    return count
  }, [answers, questions])

  const { correctCount, incorrectCount } = useMemo(() => {
    let correct = 0
    let incorrect = 0
    for (const q of questions) {
      const ans = answers[q.id]
      const needed = q.select_count ?? 1
      if (ans === undefined || selectionSize(ans) < needed) continue
      if (answersMatch(ans, q.correct_answer)) correct += 1
      else incorrect += 1
    }
    return { correctCount: correct, incorrectCount: incorrect }
  }, [answers, questions])

  const selectOption = useCallback(
    (letter: OptionLetter) => {
      if (!current || examSubmitted) return
      const needed = current.select_count ?? 1

      // Flashcard: lock once fully answered.
      if (mode === 'flashcard') {
        const existing = answers[current.id]
        if (existing !== undefined && selectionSize(existing) >= needed) return
      }

      if (needed === 1) {
        setAnswers((prev) => ({ ...prev, [current.id]: letter }))
        return
      }

      setAnswers((prev) => {
        const currentSelection = Array.isArray(prev[current.id])
          ? [...(prev[current.id] as OptionLetter[])]
          : []
        if (currentSelection.includes(letter)) {
          const next = currentSelection.filter((l) => l !== letter)
          if (next.length === 0) {
            const { [current.id]: _, ...rest } = prev
            return rest
          }
          return { ...prev, [current.id]: next }
        }
        if (mode === 'flashcard' && currentSelection.length >= needed) {
          return prev
        }
        if (mode === 'exam' && currentSelection.length >= needed) {
          // Replace oldest by appending and trimming? Prefer block when full unless toggling.
          return prev
        }
        return { ...prev, [current.id]: [...currentSelection, letter] }
      })
    },
    [answers, current, examSubmitted, mode],
  )

  const next = useCallback(() => {
    setCurrentIndex((i) => Math.min(i + 1, questions.length - 1))
  }, [questions.length])

  const prev = useCallback(() => {
    setCurrentIndex((i) => Math.max(i - 1, 0))
  }, [])

  const goTo = useCallback(
    (index: number) => {
      setCurrentIndex(
        Math.min(Math.max(index, 0), Math.max(questions.length - 1, 0)),
      )
    },
    [questions.length],
  )

  const submitExam = useCallback(() => {
    setExamSubmitted(true)
  }, [])

  const reset = useCallback(() => {
    setCurrentIndex(0)
    setAnswers({})
    setExamSubmitted(false)
    clearStoredProgress()
  }, [])

  const isCorrect =
    isAnswered && current
      ? answersMatch(selected, current.correct_answer)
      : false

  return {
    current,
    currentIndex,
    total: questions.length,
    selected,
    isAnswered,
    isCorrect,
    correctCount,
    incorrectCount,
    answeredCount,
    selectOption,
    next,
    prev,
    goTo,
    reset,
    submitExam,
    examSubmitted,
    canPrev: currentIndex > 0,
    canNext: currentIndex < questions.length - 1,
    selectCount,
    answers,
    questions,
  }
}
