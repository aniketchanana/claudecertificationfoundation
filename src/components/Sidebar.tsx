import type { StudyMode } from '../types';

type SidebarProps = {
  paperLabel: string;
  mode: StudyMode;
  current: number;
  total: number;
  answeredCount: number;
  correctCount: number;
  incorrectCount: number;
  canPrev: boolean;
  canNext: boolean;
  showScore: boolean;
  onPrev: () => void;
  onNext: () => void;
  onReset: () => void;
  onSubmitExam?: () => void;
  examReadyToSubmit?: boolean;
};

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
  onPrev,
  onNext,
  onReset,
  onSubmitExam,
  examReadyToSubmit,
}: SidebarProps) {
  const pct = total > 0 ? (answeredCount / total) * 100 : 0;

  return (
    <aside className='flex w-full shrink-0 flex-row flex-wrap items-center gap-3 border-b border-white/10 pb-4 lg:w-56 lg:flex-col lg:items-stretch lg:gap-5 lg:border-b-0 lg:border-r lg:pb-0 lg:pr-5'>
      <div className='min-w-0 flex-1 lg:flex-none'>
        <p className='text-[11px] font-semibold tracking-[0.18em] text-orange-400/90 uppercase'>
          {paperLabel}
        </p>
        <p className='mt-1 text-lg font-semibold text-[#f4efe6]'>
          {current}
          <span className='font-normal text-[#8a8276]'> / {total}</span>
        </p>
        <p className='mt-0.5 text-xs text-[#8a8276]'>
          {mode === 'flashcard' ? 'Flashcard' : 'Full exam'}
        </p>
      </div>

      <div className='h-1 w-full overflow-hidden rounded-full bg-white/10 lg:order-3'>
        <div
          className='h-full rounded-full bg-gradient-to-r from-orange-500 to-amber-400 transition-all duration-300'
          style={{ width: `${pct}%` }}
        />
      </div>

      <div className='flex flex-wrap items-center gap-2 lg:order-4 lg:flex-col lg:items-stretch'>
        {showScore ? (
          <>
            <span className='rounded-lg bg-emerald-500/15 px-2.5 py-1 text-xs font-medium text-emerald-300 lg:text-sm'>
              {correctCount} correct
            </span>
            <span className='rounded-lg bg-rose-500/15 px-2.5 py-1 text-xs font-medium text-rose-300 lg:text-sm'>
              {incorrectCount} incorrect
            </span>
          </>
        ) : (
          <span className='rounded-lg bg-white/8 px-2.5 py-1 text-xs font-medium text-[#cfc6b8] lg:text-sm'>
            {answeredCount} answered
          </span>
        )}
      </div>

      <div className='ml-auto flex items-center gap-2 lg:order-5 lg:ml-0 lg:flex-col lg:items-stretch'>
        <div className='flex gap-2 lg:grid lg:grid-cols-2'>
          <button
            type='button'
            onClick={onPrev}
            disabled={!canPrev}
            className='rounded-lg border border-white/15 bg-white/5 px-3 py-1.5 text-sm text-[#f4efe6] transition hover:bg-white/10 disabled:opacity-35'
          >
            Prev
          </button>
          <button
            type='button'
            onClick={onNext}
            disabled={!canNext}
            className='rounded-lg border border-orange-500/40 bg-orange-500/20 px-3 py-1.5 text-sm text-orange-100 transition hover:bg-orange-500/30 disabled:opacity-35'
          >
            Next
          </button>
        </div>

        {mode === 'exam' && onSubmitExam && !showScore && (
          <button
            type='button'
            onClick={onSubmitExam}
            disabled={!examReadyToSubmit}
            className='rounded-lg border border-emerald-500/40 bg-emerald-500/15 px-3 py-1.5 text-sm font-medium text-emerald-200 transition hover:bg-emerald-500/25 disabled:opacity-35'
          >
            Submit exam
          </button>
        )}

        <button
          type='button'
          onClick={onReset}
          className='rounded-lg border border-white/15 bg-transparent px-3 py-1.5 text-sm text-[#a89f91] transition hover:border-orange-400/40 hover:text-orange-200'
        >
          Back to home
        </button>
      </div>
    </aside>
  );
}
