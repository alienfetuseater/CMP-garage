export type VisualTheme = 'light' | 'dark'

const VISUAL_THEME_KEY = 'cmp_visual_theme'

export function readVisualTheme(storage: Storage = localStorage): VisualTheme {
  const storedTheme = storage.getItem(VISUAL_THEME_KEY)
  return storedTheme === 'light' || storedTheme === 'original' ? 'light' : 'dark'
}

export function applyVisualTheme(theme: VisualTheme, root: HTMLElement = document.body) {
  root.classList.toggle('theme-dark', theme === 'dark')
  root.classList.remove('theme-tui', 'theme-luxury')
}

export function saveVisualTheme(theme: VisualTheme, storage: Storage = localStorage) {
  storage.setItem(VISUAL_THEME_KEY, theme)
}
