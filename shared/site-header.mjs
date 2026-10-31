/** Single source for the app header and the static study-page header. */

export const LEARN_URL = 'https://claudecertificationguide.com/learn'

export const NAV_ITEMS = [
  { path: '', label: 'Interactive app' },
  { path: LEARN_URL, label: 'Learn', external: true },
  { path: 'practice-questions/', label: 'All questions' },
  { path: 'guides/ccarf-exam-overview/', label: 'Exam overview' },
  { path: 'guides/ccarf-exam-domains/', label: 'Domains' },
  { path: 'guides/ccarf-exam-scenarios/', label: 'Scenarios' },
]

/** Which header tab matches the page currently open. */
export function isNavItemCurrent(item, currentPath) {
  if (item.external) return false
  const current = String(currentPath ?? '')
    .replace(/^\/+|\/+$/g, '')
  const itemPath = item.path.replace(/^\/+|\/+$/g, '')
  if (itemPath === '') return current === ''
  if (itemPath === 'practice-questions') {
    return (
      current === 'practice-questions' ||
      current.startsWith('questions/') ||
      current.startsWith('papers/')
    )
  }
  if (itemPath === 'guides/ccarf-exam-domains') {
    return current === itemPath || current.startsWith('domains/')
  }
  return current === itemPath || current.startsWith(`${itemPath}/`)
}

export function renderSiteHeader(hrefFor, currentPath = '') {
  const links = NAV_ITEMS.map((item) => {
    const href = item.external ? item.path : hrefFor(item.path)
    const attrs = [
      item.external ? ' rel="noopener noreferrer" target="_blank"' : '',
      isNavItemCurrent(item, currentPath) ? ' aria-current="page"' : '',
    ].join('')
    return `<a href="${href}"${attrs}>${item.label}</a>`
  }).join('\n      ')
  return `<header class="site-header">
  <nav aria-label="Site">
      ${links}
  </nav>
</header>`
}
