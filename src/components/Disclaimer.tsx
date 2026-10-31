const LINKS = [
  {
    href: 'mailto:aniket.chanana@gmail.com',
    label: 'aniket.chanana@gmail.com',
  },
  {
    href: 'https://github.com/aniketchanana',
    label: 'GitHub',
  },
  {
    href: 'https://aniketchanana.com',
    label: 'Portfolio',
  },
]

export function Disclaimer() {
  return (
    <footer className="border-t border-white/10 px-4 py-5">
      <div className="mx-auto flex max-w-2xl flex-col items-center gap-2 text-center">
        <p className="text-sm font-semibold text-[#f4efe6]">Aniket Chanana</p>
        <p className="text-xs text-[#a89f91]">
          Software engineer · Bengaluru
        </p>
        <p className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-xs">
          {LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-orange-300/90 underline-offset-2 hover:text-orange-200 hover:underline"
              {...(link.href.startsWith('http')
                ? { target: '_blank', rel: 'noreferrer' }
                : {})}
            >
              {link.label}
            </a>
          ))}
        </p>
        <p className="mt-1 max-w-md text-xs leading-relaxed text-[#8a8276]">
          These questions were gathered from publicly available sources online.
          They were not copied from the real exam. They are included only to
          give you a taste of the topics and the way questions are asked. For a
          full curriculum, see{' '}
          <a
            href="https://claudecertificationguide.com/learn"
            target="_blank"
            rel="noreferrer"
            className="text-orange-300/90 underline-offset-2 hover:text-orange-200 hover:underline"
          >
            claudecertificationguide.com/learn
          </a>
          .
        </p>
      </div>
    </footer>
  )
}
