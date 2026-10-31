import type { Paper, PaperId, Question } from '../types'
import questions1 from './questions.json'
import questions2 from './questions-2.json'
import questions3 from './questions-3.json'
import questions4 from './questions-4.json'
import questions5 from './questions-5.json'

export const PAPERS: Paper[] = [
  {
    id: 'paper-1',
    label: 'Paper 1',
    description: 'Full practice exam · 60 questions',
    questionCount: (questions1 as Question[]).length,
  },
  {
    id: 'paper-2',
    label: 'Paper 2',
    description: 'Quick drill · 15 questions',
    questionCount: (questions2 as Question[]).length,
  },
  {
    id: 'paper-3',
    label: 'Paper 3',
    description: 'Foundations practice set · 60 questions',
    questionCount: (questions3 as Question[]).length,
  },
  {
    id: 'paper-4',
    label: 'Paper 4',
    description: 'Additional practice set · 37 questions',
    questionCount: (questions4 as Question[]).length,
  },
  {
    id: 'paper-5',
    label: 'Paper 5',
    description: 'Study-guide scenarios · 54 questions',
    questionCount: (questions5 as Question[]).length,
  },
]

const QUESTIONS_BY_PAPER: Record<PaperId, Question[]> = {
  'paper-1': questions1 as Question[],
  'paper-2': questions2 as Question[],
  'paper-3': questions3 as Question[],
  'paper-4': questions4 as Question[],
  'paper-5': questions5 as Question[],
}

export function getQuestionsForPaper(paperId: PaperId): Question[] {
  return QUESTIONS_BY_PAPER[paperId]
}
