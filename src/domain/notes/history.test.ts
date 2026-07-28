import { describe, expect, it } from 'vitest'
import { splitNoteHistory } from './history'

describe('domain/notes/history', () => {
  it('splits notes by blank lines and trims entries', () => {
    const notes = '  First note\n\nSecond note\n\n\nThird note  '

    expect(splitNoteHistory(notes)).toEqual(['First note', 'Second note', 'Third note'])
  })

  it('returns empty list for empty values', () => {
    expect(splitNoteHistory('')).toEqual([])
    expect(splitNoteHistory(null)).toEqual([])
  })
})
