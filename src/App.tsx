import { useEffect, useMemo, useState } from 'react'
import { ExamResults } from './components/ExamResults'
import { Flashcard } from './components/Flashcard'
import { Onboarding } from './components/Onboarding'
import { Sidebar } from './components/Sidebar'
import { SiteHeader } from './components/SiteHeader'
import { DOMAINS, domainShortLabel } from './data/domains'
import { getQuestionsForPaper, PAPERS } from './data/papers'
import { useQuiz } from './hooks/useQuiz'
import {
  clearDeepLinkFromUrl,
  clearStoredProgress,
  loadStoredProgress,
  parseDeepLink,
  saveStoredProgress,
} from './lib/progress'
import type { PaperId, StudyMode } from './types'

const DEFAULT_TITLE =
  'CCARF Practice Exam: Free Claude Certified Architect Foundations Questions (220+)'

function QuizSession({
  paperId,
  mode,
  initialIndex,
  initialDomainFilter,
  onReset,
}: {
  paperId: PaperId
  mode: StudyMode
  initialIndex?: number
  initialDomainFilter?: string | null
  onReset: () => void
}) {
  const allQuestions = useMemo(() => getQuestionsForPaper(paperId), [paperId])
  const [domainFilter, setDomainFilter] = useState<string | null>(
    () => initialDomainFilter ?? null,
  )
  const [showSummary, setShowSummary] = useState(true)
  const [sessionEpoch, setSessionEpoch] = useState(0)

  const questions = useMemo(() => {
    if (!domainFilter) return allQuestions
    return allQuestions.filter((q) => q.domain === domainFilter)
  }, [allQuestions, domainFilter])

  const domainOptions = useMemo(() => {
    const counts = new Map<string, number>()
    for (const q of allQuestions) {
      counts.set(q.domain, (counts.get(q.domain) ?? 0) + 1)
    }
    return DOMAINS.filter((d) => counts.has(d.full)).map((d) => ({
      full: d.full,
      label: `${d.id} · ${d.name}`,
      count: counts.get(d.full) ?? 0,
    }))
  }, [allQuestions])

  const paper = PAPERS.find((p) => p.id === paperId)

  useEffect(() => {
    if (!paper) return
    const domainBit = domainFilter
      ? ` · ${domainShortLabel(domainFilter)}`
      : ''
    document.title = `${paper.label}${domainBit} · CCARF Practice Exam`
    return () => {
      document.title = DEFAULT_TITLE
    }
  }, [paper, domainFilter])

  const handleDomainChange = (next: string | null) => {
    if (next === domainFilter) return
    clearStoredProgress()
    saveStoredProgress({
      paperId,
      mode,
      currentIndex: 0,
      answers: {},
      examSubmitted: false,
      domainFilter: next,
    })
    setDomainFilter(next)
    setShowSummary(true)
    setSessionEpoch((value) => value + 1)
  }

  if (!paper) {
    return (
      <div className="flex min-h-svh items-center justify-center p-6 text-[#f4efe6]">
        No questions found.
      </div>
    )
  }

  return (
    <QuizSessionBody
      key={`${domainFilter ?? 'all'}-${sessionEpoch}`}
      paper={paper}
      paperId={paperId}
      mode={mode}
      questions={questions}
      domainOptions={domainOptions}
      domainFilter={domainFilter}
      initialIndex={sessionEpoch === 0 ? initialIndex : undefined}
      showSummary={showSummary}
      setShowSummary={setShowSummary}
      onDomainChange={handleDomainChange}
      onReset={onReset}
    />
  )
}

function QuizSessionBody({
  paper,
  paperId,
  mode,
  questions,
  domainOptions,
  domainFilter,
  initialIndex,
  showSummary,
  setShowSummary,
  onDomainChange,
  onReset,
}: {
  paper: (typeof PAPERS)[number]
  paperId: PaperId
  mode: StudyMode
  questions: ReturnType<typeof getQuestionsForPaper>
  domainOptions: { full: string; label: string; count: number }[]
  domainFilter: string | null
  initialIndex?: number
  showSummary: boolean
  setShowSummary: (value: boolean) => void
  onDomainChange: (domain: string | null) => void
  onReset: () => void
}) {
  const quiz = useQuiz(questions, paperId, mode, initialIndex, domainFilter)

  if (questions.length === 0 || !quiz.current) {
    return (
      <div className="flex min-h-svh flex-col">
        <SiteHeader />
        <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-3 pt-3 pb-6 lg:flex-row lg:items-start lg:gap-8 lg:px-6 lg:py-8">
          <Sidebar
            paperLabel={paper.label}
            mode={mode}
            current={0}
            total={0}
            answeredCount={0}
            correctCount={0}
            incorrectCount={0}
            canPrev={false}
            canNext={false}
            showScore={false}
            domains={domainOptions}
            selectedDomain={domainFilter}
            onDomainChange={onDomainChange}
            onPrev={() => undefined}
            onNext={() => undefined}
            onReset={onReset}
          />
          <main className="min-w-0 flex-1 px-3 text-[#a89f91] lg:px-0">
            No questions in this domain for {paper.label}. Choose another domain
            or all domains.
          </main>
        </div>
      </div>
    )
  }

  const examDone = mode === 'exam' && quiz.examSubmitted
  const showingResults = examDone && showSummary
  const revealFeedback = mode === 'flashcard' || examDone

  const handleReset = () => {
    quiz.reset()
    onReset()
  }

  return (
    <div className="flex min-h-svh flex-col">
      <SiteHeader />
      <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-3 pt-3 pb-24 lg:flex-row lg:items-start lg:gap-8 lg:px-6 lg:py-8 lg:pb-8">
        <Sidebar
          paperLabel={paper.label}
          mode={mode}
          current={quiz.currentIndex + 1}
          total={quiz.total}
          answeredCount={quiz.answeredCount}
          correctCount={quiz.correctCount}
          incorrectCount={quiz.incorrectCount}
          canPrev={quiz.canPrev && !showingResults}
          canNext={quiz.canNext && !showingResults}
          showScore={mode === 'flashcard' || quiz.examSubmitted}
          domains={domainOptions}
          selectedDomain={domainFilter}
          onDomainChange={onDomainChange}
          onPrev={quiz.prev}
          onNext={quiz.next}
          onReset={handleReset}
          onSubmitExam={
            mode === 'exam' && !quiz.examSubmitted
              ? () => {
                  quiz.submitExam()
                  setShowSummary(true)
                }
              : undefined
          }
          examReadyToSubmit={
            mode === 'exam' && !quiz.examSubmitted && quiz.answeredCount > 0
          }
        />

        <main className="min-w-0 flex-1 px-3 lg:px-0">
          {showingResults ? (
            <ExamResults
              paperLabel={paper.label}
              questions={quiz.questions}
              answers={quiz.answers}
              correctCount={quiz.correctCount}
              incorrectCount={quiz.incorrectCount}
              onReset={handleReset}
              onReviewQuestion={(index) => {
                quiz.goTo(index)
                setShowSummary(false)
              }}
            />
          ) : (
            <div className="space-y-4">
              {examDone && (
                <button
                  type="button"
                  onClick={() => setShowSummary(true)}
                  className="text-sm text-orange-300/90 hover:text-orange-200"
                >
                  ← Back to score summary
                </button>
              )}
              <Flashcard
                question={quiz.current}
                selected={quiz.selected}
                isAnswered={quiz.isAnswered}
                isCorrect={quiz.isCorrect}
                selectCount={quiz.selectCount}
                revealFeedback={revealFeedback}
                onSelect={quiz.selectOption}
              />
              {mode === 'exam' && !quiz.examSubmitted && (
                <p className="text-center text-xs text-[#8a8276]">
                  Answers stay hidden until you submit the exam
                </p>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  )
}

function readLaunchState() {
  const deepLink = parseDeepLink()
  if (deepLink) {
    clearStoredProgress()
    saveStoredProgress(deepLink)
    clearDeepLinkFromUrl()
    return {
      paperId: deepLink.paperId,
      mode: deepLink.mode,
      initialIndex: deepLink.currentIndex,
      domainFilter: deepLink.domainFilter ?? null,
    }
  }

  const saved = loadStoredProgress()
  return {
    paperId: saved?.paperId ?? null,
    mode: saved?.mode ?? null,
    initialIndex: undefined,
    domainFilter: saved?.domainFilter ?? null,
  }
}

export default function App() {
  const [launch] = useState(() => readLaunchState())
  const [paperId, setPaperId] = useState<PaperId | null>(() => launch.paperId)
  const [mode, setMode] = useState<StudyMode | null>(() => launch.mode)
  const [initialIndex, setInitialIndex] = useState<number | undefined>(
    () => launch.initialIndex,
  )
  const [initialDomainFilter] = useState<string | null>(
    () => launch.domainFilter,
  )
  const [pendingPaperId, setPendingPaperId] = useState<PaperId | null>(
    () => launch.paperId,
  )
  const [pendingMode, setPendingMode] = useState<StudyMode | null>(
    () => launch.mode,
  )

  useEffect(() => {
    if (!paperId || !mode) {
      document.title = DEFAULT_TITLE
    }
  }, [paperId, mode])

  const handleStart = () => {
    if (!pendingPaperId || !pendingMode) return
    clearStoredProgress()
    saveStoredProgress({
      paperId: pendingPaperId,
      mode: pendingMode,
      currentIndex: 0,
      answers: {},
      examSubmitted: false,
      domainFilter: null,
    })
    setInitialIndex(undefined)
    setPaperId(pendingPaperId)
    setMode(pendingMode)
  }

  const handleResetToOnboarding = () => {
    clearStoredProgress()
    setPaperId(null)
    setMode(null)
    setInitialIndex(undefined)
    setPendingPaperId(null)
    setPendingMode(null)
  }

  if (!paperId || !mode) {
    return (
      <Onboarding
        papers={PAPERS}
        selectedPaperId={pendingPaperId}
        selectedMode={pendingMode}
        onSelectPaper={setPendingPaperId}
        onSelectMode={setPendingMode}
        onStart={handleStart}
      />
    )
  }

  return (
    <QuizSession
      key={`${paperId}-${mode}`}
      paperId={paperId}
      mode={mode}
      initialIndex={initialIndex}
      initialDomainFilter={initialDomainFilter}
      onReset={handleResetToOnboarding}
    />
  )
}
