export const LEARN_URL: string

export const NAV_ITEMS: readonly {
  readonly path: string
  readonly label: string
  readonly external?: boolean
}[]

export function isNavItemCurrent(
  item: { readonly path: string; readonly external?: boolean },
  currentPath: string,
): boolean

export function renderSiteHeader(
  hrefFor: (path: string) => string,
  currentPath?: string,
): string
