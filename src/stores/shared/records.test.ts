import { describe, expect, it } from 'vitest'
import {
  findById,
  replaceCollection,
  resolveRecordId,
  toNormalizedId,
  toNormalizedStringList,
  upsertById,
} from './records'

describe('stores/shared/records', () => {
  it('normalizes ids from optional id fields', () => {
    expect(resolveRecordId({ id: 'abc' })).toBe('abc')
    expect(resolveRecordId({ _id: 42 })).toBe('42')
    expect(resolveRecordId({ id: '   ' })).toBe('')
  })

  it('normalizes scalar id values consistently', () => {
    expect(toNormalizedId('  123 ')).toBe('123')
    expect(toNormalizedId(123)).toBe('123')
    expect(toNormalizedId(null)).toBe('')
  })

  it('replaces collections in place', () => {
    const target = [{ id: 'old' }]
    const reference = target

    replaceCollection(target, [{ id: 'new-1' }, { id: 'new-2' }])

    expect(target).toBe(reference)
    expect(target).toEqual([{ id: 'new-1' }, { id: 'new-2' }])
  })

  it('upserts by normalized id', () => {
    const records = [{ id: 'a', value: 1 }]

    upsertById(records, { id: 'a', value: 2 })
    upsertById(records, { id: ' b ', value: 3 })

    expect(records).toEqual([
      { id: 'a', value: 2 },
      { id: ' b ', value: 3 },
    ])
  })

  it('finds a record by normalized id', () => {
    const records = [{ id: 'a' }, { id: 'b' }]

    expect(findById(records, ' b ')).toEqual({ id: 'b' })
    expect(findById(records, 'missing')).toBeNull()
  })

  it('normalizes string lists and drops empty values', () => {
    expect(toNormalizedStringList([' a ', null, ' ', 5])).toEqual(['a', '5'])
    expect(toNormalizedStringList('not-an-array')).toEqual([])
  })
})
