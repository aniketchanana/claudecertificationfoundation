/** GitHub Pages base path, e.g. `/claudecertificationfoundation/` */
export const BASE_URL = import.meta.env.BASE_URL

export const SITE_ORIGIN = 'https://aniketchanana.github.io'
export const SITE_PATH = '/claudecertificationfoundation'
export const SITE_URL = `${SITE_ORIGIN}${SITE_PATH}/`

export function sitePath(path = ''): string {
  const clean = path.replace(/^\//, '')
  return `${BASE_URL}${clean}`
}

export const BROWSE_LINKS = [
  { href: sitePath('practice-questions/'), label: 'All practice questions' },
  { href: sitePath('guides/ccarf-exam-domains/'), label: 'Exam domains guide' },
  {
    href: sitePath('guides/claude-code-hooks/'),
    label: 'Claude Code hooks cheat sheet',
  },
] as const
