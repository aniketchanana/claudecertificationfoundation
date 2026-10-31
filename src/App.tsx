import { useMemo, useState } from 'react'
import { Disclaimer } from './components/Disclaimer'
import { ExamResults } from './components/ExamResults'
import { Flashcard } from './components/Flashcard'
import { Onboarding } from './components/Onboarding'
import { Sidebar } from './components/Sidebar'
import { getQuestionsForPaper, PAPERS } from './data/papers'
import { useQuiz } from './hooks/useQuiz'
import {
  clearStoredProgress,
  loadStoredProgress,
  saveStoredProgress,
} from './lib/progress'
import type { PaperId, StudyMode } from './types'

function QuizSession({
  paperId,
  mode,
  onReset,
}: {
  paperId: PaperId
  mode: StudyMode
  onReset: () => void
}) {
  const questions = useMemo(() => getQuestionsForPaper(paperId), [paperId])
  const quiz = useQuiz(questions, paperId, mode)
  const paper = PAPERS.find((p) => p.id === paperId)
  const [showSummary, setShowSummary] = useState(true)

  if (!paper || !quiz.current) {
    return (
      <div className="flex min-h-svh items-center justify-center p-6 text-[#f4efe6]">
        No questions found.
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
    <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-5 px-4 py-5 lg:flex-row lg:gap-8 lg:px-6 lg:py-8">
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

      <main className="min-w-0 flex-1">
        {showingResults ? (
          <ExamResults
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
    <Disclaimer />
    </div>
  )
}

export default function App() {
  const saved = loadStoredProgress()
  const [paperId, setPaperId] = useState<PaperId | null>(
    () => saved?.paperId ?? null,
  )
  const [mode, setMode] = useState<StudyMode | null>(() => saved?.mode ?? null)
  const [pendingPaperId, setPendingPaperId] = useState<PaperId | null>(
    () => saved?.paperId ?? null,
  )
  const [pendingMode, setPendingMode] = useState<StudyMode | null>(
    () => saved?.mode ?? null,
  )

  const handleStart = () => {
    if (!pendingPaperId || !pendingMode) return
    clearStoredProgress()
    saveStoredProgress({
      paperId: pendingPaperId,
      mode: pendingMode,
      currentIndex: 0,
      answers: {},
      examSubmitted: false,
    })
    setPaperId(pendingPaperId)
    setMode(pendingMode)
  }

  const handleResetToOnboarding = () => {
    clearStoredProgress()
    setPaperId(null)
    setMode(null)
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
      paperId={paperId}
      mode={mode}
      onReset={handleResetToOnboarding}
    />
  )
}
