import type { AnswerMap, PaperId, QuizProgress, StudyMode } from '../types'

export const PROGRESS_KEY = 'ccarf-flashcards-progress'

const LEGACY_KEYS = [
  'ccarf-flashcards-active-paper',
  'ccarf-flashcards-progress:paper-1',
  'ccarf-flashcards-progress:paper-2',
  'ccarf-flashcards-progress:paper-3',
  'ccarf-flashcards-progress:paper-4',
  'ccarf-flashcards-progress:paper-5',
]

export type StoredProgress = QuizProgress & {
  paperId: PaperId
  mode: StudyMode
  examSubmitted?: boolean
  /** Exact question.domain string, or null/undefined for all domains. */
  domainFilter?: string | null
}

function isPaperId(value: unknown): value is PaperId {
  return (
    value === 'paper-1' ||
    value === 'paper-2' ||
    value === 'paper-3' ||
    value === 'paper-4' ||
    value === 'paper-5'
  )
}

function isStudyMode(value: unknown): value is StudyMode {
  return value === 'flashcard' || value === 'exam'
}

export function clearLegacyProgressKeys() {
  try {
    for (const key of LEGACY_KEYS) localStorage.removeItem(key)
  } catch {
    /* ignore */
  }
}

export function loadStoredProgress(): StoredProgress | null {
  try {
    clearLegacyProgressKeys()
    const raw = localStorage.getItem(PROGRESS_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as Partial<StoredProgress>
    if (
      !isPaperId(parsed.paperId) ||
      !isStudyMode(parsed.mode) ||
      typeof parsed.currentIndex !== 'number' ||
      typeof parsed.answers !== 'object' ||
      parsed.answers === null
    ) {
      return null
    }
    return {
      paperId: parsed.paperId,
      mode: parsed.mode,
      currentIndex: parsed.currentIndex,
      answers: parsed.answers as AnswerMap,
      examSubmitted: Boolean(parsed.examSubmitted),
      domainFilter:
        typeof parsed.domainFilter === 'string' ? parsed.domainFilter : null,
    }
  } catch {
    return null
  }
}

export function saveStoredProgress(progress: StoredProgress) {
  try {
    clearLegacyProgressKeys()
    localStorage.setItem(PROGRESS_KEY, JSON.stringify(progress))
  } catch {
    /* ignore */
  }
}

export function clearStoredProgress() {
  try {
    localStorage.removeItem(PROGRESS_KEY)
    clearLegacyProgressKeys()
  } catch {
    /* ignore */
  }
}

/** Parse `?paper=paper-1&mode=flashcard&q=5` (q is 1-based). */
export function parseDeepLink(
  search: string = typeof window !== 'undefined' ? window.location.search : '',
): StoredProgress | null {
  try {
    const params = new URLSearchParams(search)
    const paper = params.get('paper')
    const mode = params.get('mode')
    if (!isPaperId(paper) || !isStudyMode(mode)) return null

    const rawQ = params.get('q')
    let currentIndex = 0
    if (rawQ !== null) {
      const oneBased = Number.parseInt(rawQ, 10)
      if (Number.isFinite(oneBased) && oneBased >= 1) {
        currentIndex = oneBased - 1
      }
    }

    return {
      paperId: paper,
      mode,
      currentIndex,
      answers: {},
      examSubmitted: false,
      domainFilter: null,
    }
  } catch {
    return null
  }
}

export function clearDeepLinkFromUrl() {
  try {
    const url = new URL(window.location.href)
    if (
      !url.searchParams.has('paper') &&
      !url.searchParams.has('mode') &&
      !url.searchParams.has('q')
    ) {
      return
    }
    url.searchParams.delete('paper')
    url.searchParams.delete('mode')
    url.searchParams.delete('q')
    const next = `${url.pathname}${url.search}${url.hash}`
    window.history.replaceState({}, '', next)
  } catch {
    /* ignore */
  }
}
