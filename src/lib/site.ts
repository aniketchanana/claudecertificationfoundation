/** GitHub Pages base path, e.g. `/claudecertificationfoundation/` */
export const BASE_URL = import.meta.env.BASE_URL

export const SITE_ORIGIN = 'https://aniketchanana.github.io'
export const SITE_PATH = '/claudecertificationfoundation'
export const SITE_URL = `${SITE_ORIGIN}${SITE_PATH}/`

export function sitePath(path = ''): string {
  const clean = path.replace(/^\//, '')
  return `${BASE_URL}${clean}`
}

/** Absolute URLs so browse links work from local `vite` too (SEO pages only exist in the built deploy). */
export function absoluteSitePath(path = ''): string {
  const clean = path.replace(/^\//, '')
  return `${SITE_URL}${clean}`
}

export const BROWSE_LINKS = [
  {
    href: absoluteSitePath('practice-questions/'),
    label: 'All practice questions',
  },
  {
    href: absoluteSitePath('guides/ccarf-exam-domains/'),
    label: 'Exam domains guide',
  },
  {
    href: absoluteSitePath('guides/claude-code-hooks/'),
    label: 'Claude Code hooks cheat sheet',
  },
] as const
