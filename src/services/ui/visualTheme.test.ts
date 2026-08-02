import { describe, expect, it } from 'vitest'
import { applyVisualTheme, readVisualTheme, saveVisualTheme } from './visualTheme'

function createStorage(initialValue?: string) {
  const values = new Map<string, string>()
  if (initialValue) values.set('cmp_visual_theme', initialValue)

  return {
    get length() {
      return values.size
    },
    clear: () => values.clear(),
    getItem: (key: string) => values.get(key) ?? null,
    key: (index: number) => [...values.keys()][index] ?? null,
    removeItem: (key: string) => values.delete(key),
    setItem: (key: string, value: string) => {
      values.set(key, value)
    },
  } as Storage
}

function createThemeRoot() {
  const classes = new Set<string>()

  return {
    classList: {
      contains: (name: string) => classes.has(name),
      remove: (...names: string[]) => names.forEach((name) => classes.delete(name)),
      toggle: (name: string, force?: boolean) => {
        if (force) classes.add(name)
        else classes.delete(name)
        return classes.has(name)
      },
    },
  } as unknown as HTMLElement
}

describe('visual theme preference', () => {
  it('defaults to dark and applies each theme to the root class', () => {
    const storage = createStorage()
    const root = createThemeRoot()

    expect(readVisualTheme(storage)).toBe('dark')
    applyVisualTheme('dark', root)
    expect(root.classList.contains('theme-dark')).toBe(true)

    applyVisualTheme('light', root)
    expect(root.classList.contains('theme-dark')).toBe(false)
  })

  it('persists and restores the light theme', () => {
    const storage = createStorage()

    saveVisualTheme('light', storage)

    expect(readVisualTheme(storage)).toBe('light')
  })

  it('migrates legacy original and TUI preferences', () => {
    expect(readVisualTheme(createStorage('original'))).toBe('light')
    expect(readVisualTheme(createStorage('tui'))).toBe('dark')
  })
})
