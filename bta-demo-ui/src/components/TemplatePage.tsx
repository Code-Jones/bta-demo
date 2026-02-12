import type { CSSProperties } from 'react'

type TemplateTheme = {
  primary?: string
  accent?: string
  backgroundLight?: string
  backgroundDark?: string
  cardWhite?: string
  slateCustom?: string
}

type TemplatePageProps = {
  html: string
  theme?: TemplateTheme
  className?: string
}

const bodyTagRegex = /<body[^>]*>/i
const bodyClassRegex = /<body[^>]*class=["']([^"']*)["'][^>]*>/i
const htmlClassRegex = /<html[^>]*class=["']([^"']*)["'][^>]*>/i
const bodyContentRegex = /<body[^>]*>([\s\S]*?)<\/body>/i

function extractTemplateParts(html: string) {
  const bodyTagMatch = html.match(bodyTagRegex)
  const bodyClassMatch = html.match(bodyClassRegex)
  const htmlClassMatch = html.match(htmlClassRegex)
  const bodyContentMatch = html.match(bodyContentRegex)

  const bodyClassName = bodyClassMatch?.[1] ?? ''
  const htmlClassName = htmlClassMatch?.[1] ?? ''
  const bodyHtml = (bodyContentMatch?.[1] ?? html)
    .replace(/```/g, '')
    .replace(bodyTagMatch?.[0] ?? '', '')
    .trim()

  return { bodyClassName, htmlClassName, bodyHtml }
}

function buildThemeStyle(theme?: TemplateTheme) {
  if (!theme) {
    return undefined
  }

  const style = {
    ...(theme.primary ? { '--color-primary': theme.primary } : {}),
    ...(theme.primary ? { '--primary-color': theme.primary } : {}),
    ...(theme.accent ? { '--color-accent': theme.accent } : {}),
    ...(theme.backgroundLight ? { '--color-background-light': theme.backgroundLight } : {}),
    ...(theme.backgroundDark ? { '--color-background-dark': theme.backgroundDark } : {}),
    ...(theme.cardWhite ? { '--color-card-white': theme.cardWhite } : {}),
    ...(theme.slateCustom ? { '--color-slate-custom': theme.slateCustom } : {}),
  } as CSSProperties

  return style
}

export function TemplatePage({ html, theme, className }: TemplatePageProps) {
  const { bodyClassName, htmlClassName, bodyHtml } = extractTemplateParts(html)
  const wrapperClassName = [
    htmlClassName.split(/\s+/).includes('dark') ? 'dark' : '',
    bodyClassName,
    className ?? '',
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <div
      className={wrapperClassName}
      style={buildThemeStyle(theme)}
      dangerouslySetInnerHTML={{ __html: bodyHtml }}
    />
  )
}
