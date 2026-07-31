import type {
  DiagnosticLevel,
  MonthlyReportDiagnosticEntry,
  MonthlyReportDiagnostics,
  TicketDiagnostics,
} from '@/types/mock'

export const monthlyReportDiagnosticSections = [
  {
    title: 'Engine and Drive',
    fields: [
      { key: 'engine_oil', label: 'Engine oil level and condition' },
      { key: 'gear_lube', label: 'Gear lube' },
      { key: 'fuel_system', label: 'Fuel system' },
      { key: 'cooling_system', label: 'Cooling system' },
      { key: 'propeller_hardware', label: 'Propeller hardware' },
      { key: 'anodes_engine_drive', label: 'Anodes engine drive' },
      { key: 'belts_hoses', label: 'Belts and hoses' },
      { key: 'steering_engine_mount_hardware', label: 'Steering and engine mount hardware' },
    ],
  },
  {
    title: 'Electrical and Batteries',
    fields: [
      { key: 'battery_voltage', label: 'Battery voltage and load test' },
      { key: 'terminals_connections', label: 'Terminals and connections' },
      { key: 'charger_shore_power', label: 'Charger and shore power' },
      { key: 'bilge_pump', label: 'Bilge pump' },
      { key: 'navigation_anchorLights', label: 'Navigation and anchor lights' },
      { key: 'ham_electronics_powerUp', label: 'Helm electronics and power up' },
    ],
  },
  {
    title: 'Hull and Exterior',
    fields: [
      { key: 'hull_gellcoat', label: 'Hull and gelcoat' },
      { key: 'throughHull_seacocks', label: 'Through-hull and seacocks' },
      { key: 'hull_trimTab_anodes', label: 'Hull and trim tab anodes' },
      { key: 'bottom_paint_growth', label: 'Bottom paint and growth' },
      { key: 'trim_tabs_operation', label: 'Trim tabs operation' },
    ],
  },
  {
    title: 'Lift and Mooring',
    fields: [
      { key: 'liftCables_pulleys', label: 'Lift cables and pulleys' },
      { key: 'liftMotors_switches', label: 'Lift motors and switches' },
      { key: 'bunks_guidePosts', label: 'Bunks and guide posts' },
      { key: 'dockLines_chafePoints', label: 'Dock lines and chafe points' },
    ],
  },
  {
    title: 'Onboard Systems',
    fields: [
      { key: 'steeringFluid_operation', label: 'Steering fluid and operation' },
      { key: 'liveWell_washdownPumps', label: 'Live well and washdown pumps' },
      { key: 'freshwater_system', label: 'Freshwater system' },
      { key: 'head_waste_system', label: 'Head and waste system' },
    ],
  },
  {
    title: 'Deck and Interior',
    fields: [
      { key: 'hatches_latches_drains', label: 'Hatches, latches and drains' },
      { key: 'upholstery_canvas', label: 'Upholstery and canvas' },
      { key: 'safety_equipment_check', label: 'Safety equipment check' },
    ],
  },
] as const

export const monthlyReportDiagnosticFields = monthlyReportDiagnosticSections.flatMap((section) =>
  section.fields.map((field) => field.key),
)

type LegacyMonthlyReportDiagnostics = TicketDiagnostics | MonthlyReportDiagnostics

function normalizeDiagnosticEntry(
  entry: DiagnosticLevel | MonthlyReportDiagnosticEntry | undefined,
): MonthlyReportDiagnosticEntry {
  if (!entry || typeof entry === 'string') {
    return { value: entry ?? 'N/A', comment: '', photos: [] }
  }

  return {
    value: entry.value ?? 'N/A',
    comment: String(entry.comment ?? ''),
    photos: Array.isArray(entry.photos) ? entry.photos.map((photo) => ({ ...photo })) : [],
  }
}

export function createMonthlyReportDiagnostics(
  current: LegacyMonthlyReportDiagnostics = {},
): MonthlyReportDiagnostics {
  return Object.fromEntries(
    monthlyReportDiagnosticFields.map((field) => [field, normalizeDiagnosticEntry(current[field])]),
  )
}

export function isMonthlyReportDiagnosticField(key: string): boolean {
  return monthlyReportDiagnosticFields.some((field) => field === key)
}
