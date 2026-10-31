import { useEffect, useState } from 'react'
import { isNavItemCurrent } from '../../shared/site-header.mjs'
import { BASE_URL, NAV_LINKS, sitePath } from '../lib/site'
import '../../shared/site-header.css'

function currentPath() {
  const base = BASE_URL.replace(/\/$/, '')
  const path = window.location.pathname
  const rest = base && path.startsWith(base) ? path.slice(base.length) : path
  return rest.replace(/^\/+|\/+$/g, '')
}

export function SiteHeader() {
  const openPath = currentPath()
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const desktop = window.matchMedia('(min-width: 1024px)')
    const closeOnDesktop = () => {
      if (desktop.matches) setOpen(false)
    }
    desktop.addEventListener('change', closeOnDesktop)
    return () => desktop.removeEventListener('change', closeOnDesktop)
  }, [])

  useEffect(() => {
    if (!open) return
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener('keydown', onKey)
    }
  }, [open])

  return (
    <header className={`site-header${open ? ' is-open' : ''}`}>
      <div className="site-header-bar">
        <a className="site-header-brand" href={sitePath('')}>
          CCARF
        </a>
        <button
          type="button"
          className="site-nav-button"
          aria-expanded={open}
          aria-controls="site-nav"
          onClick={() => setOpen((value) => !value)}
        >
          <span className="sr-only">{open ? 'Close menu' : 'Open menu'}</span>
          <span className="site-nav-icon" aria-hidden="true" />
        </button>
      </div>
      {open && (
        <button
          type="button"
          className="site-nav-scrim"
          aria-label="Close menu"
          onClick={() => setOpen(false)}
        />
      )}
      <nav id="site-nav" aria-label="Site">
        {NAV_LINKS.map((link) => {
          const current = isNavItemCurrent(link, openPath)
          return (
            <a
              key={link.href}
              href={link.href}
              onClick={() => setOpen(false)}
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
