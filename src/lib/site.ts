import { LEARN_URL, NAV_ITEMS } from '../../shared/site-header.mjs'

/** GitHub Pages base path, e.g. `/claudecertificationfoundation/` */
export const BASE_URL = import.meta.env.BASE_URL

export const SITE_ORIGIN = 'https://aniketchanana.github.io'
export const SITE_PATH = '/claudecertificationfoundation'
export const SITE_URL = `${SITE_ORIGIN}${SITE_PATH}/`

export { LEARN_URL }

export function sitePath(path = ''): string {
  const clean = path.replace(/^\//, '')
  return `${BASE_URL}${clean}`
}

export function isExternalHref(href: string): boolean {
  return /^https?:\/\//i.test(href)
}

/** Shared with the static study-page header in scripts/generate-seo-pages.mjs */
export const NAV_LINKS = NAV_ITEMS.map((item) => ({
  href: item.external || isExternalHref(item.path) ? item.path : sitePath(item.path),
  label: item.label,
  path: item.path,
  external: Boolean(item.external) || isExternalHref(item.path),
}))

/** Browse links used in onboarding / secondary nav */
export const BROWSE_LINKS = [
  { href: LEARN_URL, label: 'Learn curriculum' },
  { href: sitePath('practice-questions/'), label: 'All practice questions' },
  { href: sitePath('guides/ccarf-exam-overview/'), label: 'Exam overview' },
  { href: sitePath('guides/ccarf-exam-domains/'), label: 'Exam domains' },
  { href: sitePath('guides/ccarf-exam-scenarios/'), label: 'Exam scenarios' },
  {
    href: sitePath('guides/claude-code-hooks/'),
    label: 'Claude Code study notes',
  },
] as const
