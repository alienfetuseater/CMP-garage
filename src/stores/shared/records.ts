export type RecordWithOptionalMongoId = {
  id?: unknown
  _id?: unknown
}

export const toNormalizedId = (value: unknown): string => String(value ?? '').trim()

export const resolveRecordId = (record: RecordWithOptionalMongoId): string =>
  toNormalizedId(record.id ?? record._id)

// Replace the full array in-place so Vue reactivity stays stable for existing references.
export const replaceCollection = <T>(target: T[], records: T[]) => {
  target.splice(0, target.length, ...records)
}

export const upsertById = <T extends { id: unknown }>(target: T[], record: T) => {
  const normalizedRecordId = toNormalizedId(record.id)
  const index = target.findIndex((entry) => toNormalizedId(entry.id) === normalizedRecordId)

  if (index >= 0) {
    target[index] = record
    return
  }

  target.push(record)
}

export const findById = <T extends { id: unknown }>(target: T[], id: string): T | null => {
  const normalizedId = toNormalizedId(id)
  return target.find((entry) => toNormalizedId(entry.id) === normalizedId) ?? null
}

export const toNormalizedStringList = (value: unknown): string[] => {
  if (!Array.isArray(value)) return []

  return value.map((entry) => toNormalizedId(entry)).filter(Boolean)
}
