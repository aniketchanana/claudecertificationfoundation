import { isNavItemCurrent } from '../../shared/site-header.mjs'
import { BASE_URL, NAV_LINKS } from '../lib/site'
import '../../shared/site-header.css'

function currentPath() {
  const base = BASE_URL.replace(/\/$/, '')
  const path = window.location.pathname
  const rest = base && path.startsWith(base) ? path.slice(base.length) : path
  return rest.replace(/^\/+|\/+$/g, '')
}

export function SiteHeader() {
  const openPath = currentPath()

  return (
    <header className="site-header">
      <nav aria-label="Site">
        {NAV_LINKS.map((link) => {
          const current = isNavItemCurrent(link, openPath)
          return (
            <a
              key={link.href}
              href={link.href}
              {...(current ? { 'aria-current': 'page' as const } : {})}
              {...(link.external
                ? { target: '_blank', rel: 'noopener noreferrer' }
                : {})}
            >
              {link.label}
            </a>
          )
        })}
      </nav>
    </header>
  )
}
