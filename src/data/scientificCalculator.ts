import type { CalculatorDefinition, CalculatorKeyDefinition, KeySpec } from '@/types/calculator'

export const body = {
  width: 5.25,
  height: 12.0,
  depth: 0.72,
  radius: 0.48,
  segments: 8,
} as const

/** Body front face is at z = depth / 2. */
export const bodyFrontZ = body.depth / 2

export const frontPanel = {
  width: 5.02,
  height: 11.76,
  depth: 0.065,
  radius: 0.42,
  bevelSize: 0.012,
  bevelThickness: 0.012,
  z: bodyFrontZ - 0.008,
  get topZ() {
    return this.z + this.depth + this.bevelThickness
  },
} as const

export const keypadPlate = {
  width: 4.72,
  height: 8.65,
  depth: 0.028,
  radius: 0.2,
  bevelSize: 0.008,
  bevelThickness: 0.008,
  centerY: -1.46,
  z: frontPanel.topZ,
  get topZ() {
    return this.z + this.depth + this.bevelThickness
  },
} as const

export const display = {
  centerY: 2.95,
  frameWidth: 4.32,
  frameHeight: 1.42,
  frameRadius: 0.17,
  frameDepth: 0.12,
  frameBevel: 0.01,
  frameZ: frontPanel.topZ,
  get frameTopZ() {
    return this.frameZ + this.frameDepth + this.frameBevel
  },
  panelWidth: 4.02,
  panelHeight: 1.12,
  panelRadius: 0.09,
  panelDepth: 0.035,
  panelBevel: 0.006,
  panelZ: frontPanel.topZ + 0.055,
  get panelTopZ() {
    return this.panelZ + this.panelDepth + this.panelBevel
  },
  value: '42.',
} as const

export const calculatorMarks = {
  casio: {
    text: 'CASIO',
    x: -1.22,
    y: 5.02,
    width: 1.56,
    height: 0.48,
    color: '#e0dfd7',
    size: 0.8,
  },
  model: {
    text: 'fx-82MS',
    x: 1.38,
    y: 5.02,
    width: 1.16,
    height: 0.34,
    color: '#deddd5',
    size: 0.68,
  },
  memory: {
    text: 'S-V.P.A.M.',
    x: 0,
    y: 4.38,
    width: 1.9,
    height: 0.38,
    color: '#c9c8c1',
    size: 0.72,
  },
  edition: {
    text: '2nd edition',
    x: 1.22,
    y: 4.04,
    width: 0.9,
    height: 0.25,
    color: '#d2d1ca',
    size: 0.68,
  },
} as const

export const keypad = {
  keyWidth: 0.68,
  keyHeight: 0.42,
  keyDepth: 0.095,
  keyRadius: 0.09,
  keyBevel: 0.009,
  columnGap: 0.13,
  rowGap: 0.12,
  centerY: keypadPlate.centerY,
} as const

/** Keys sit on the keypad plate, slightly embedded by their bevel. */
export const keyBaseZ = keypadPlate.topZ

export const actionRow: (KeySpec | null)[] = [
  { label: 'SHIFT', tone: 'medium', x: -1.68, y: 1.2, width: 0.46, height: 0.46, shape: 'circle' },
  { label: 'ALPHA', tone: 'medium', x: -0.84, y: 1.2, width: 0.46, height: 0.46, shape: 'circle' },
  null,
  { label: 'MODE', tone: 'medium', x: 0.84, y: 1.2, width: 0.46, height: 0.46, shape: 'circle' },
  { label: 'ON', tone: 'medium', x: 1.68, y: 1.2, width: 0.46, height: 0.46, shape: 'circle' },
]

export const scientificKeyRows: (KeySpec | null)[][] = [
  [
    { label: 'x⁻¹', tone: 'medium', secondaryLabel: 'n!', secondaryTone: 'yellow' },
    { label: 'nCr', tone: 'medium', secondaryLabel: 'nPr', secondaryTone: 'yellow' },
    null,
    { label: 'Pol(', tone: 'medium', secondaryLabel: 'Rec(', secondaryTone: 'yellow' },
    { label: 'x³', tone: 'medium', secondaryLabel: '∛', secondaryTone: 'yellow' },
  ],
  [
    { label: 'a b/c', tone: 'medium', secondaryLabel: 'd/c', secondaryTone: 'yellow' },
    { label: '√', tone: 'medium' },
    { label: 'x²', tone: 'medium' },
    { label: '^', tone: 'medium', secondaryLabel: 'x√', secondaryTone: 'yellow' },
    { label: 'log', tone: 'medium', secondaryLabel: '10ˣ', secondaryTone: 'yellow' },
    { label: 'ln', tone: 'medium', secondaryLabel: 'eˣ', secondaryTone: 'yellow' },
  ],
  [
    { label: '(−)', tone: 'medium', secondaryLabel: 'A', secondaryTone: 'red' },
    { label: '° ′ ″', tone: 'medium', secondaryLabel: '←', secondaryTone: 'yellow' },
    { label: 'hyp', tone: 'medium', secondaryLabel: 'B', secondaryTone: 'red' },
    { label: 'sin', tone: 'medium', secondaryLabel: 'sin⁻¹', secondaryTone: 'yellow' },
    { label: 'cos', tone: 'medium', secondaryLabel: 'cos⁻¹', secondaryTone: 'yellow' },
    { label: 'tan', tone: 'medium', secondaryLabel: 'tan⁻¹', secondaryTone: 'yellow' },
  ],
  [
    { label: 'RCL', tone: 'medium', secondaryLabel: 'STO', secondaryTone: 'yellow' },
    { label: 'ENG', tone: 'medium', secondaryLabel: '←', secondaryTone: 'yellow' },
    { label: '(', tone: 'medium', secondaryLabel: 'C', secondaryTone: 'red' },
    { label: ')', tone: 'medium', secondaryLabel: 'D', secondaryTone: 'red' },
    { label: ',', tone: 'medium', secondaryLabel: 'X', secondaryTone: 'red' },
    { label: 'M+', tone: 'medium', secondaryLabel: 'M', secondaryTone: 'red' },
  ],
  [
    { label: '7', tone: 'light' },
    { label: '8', tone: 'light' },
    { label: '9', tone: 'light' },
    {
      label: 'DEL',
      tone: 'medium',
      labelColor: '#a64c5a',
      secondaryLabel: 'INS',
      secondaryTone: 'yellow',
    },
    {
      label: 'AC',
      tone: 'medium',
      labelColor: '#a64c5a',
      secondaryLabel: 'OFF',
      secondaryTone: 'yellow',
    },
  ],
  [
    { label: '4', tone: 'light' },
    { label: '5', tone: 'light' },
    { label: '6', tone: 'light' },
    { label: '×', tone: 'medium' },
    { label: '÷', tone: 'medium' },
  ],
  [
    { label: '1', tone: 'light', secondaryLabel: 'S-SUM', secondaryTone: 'yellow' },
    { label: '2', tone: 'light', secondaryLabel: 'S-VAR', secondaryTone: 'yellow' },
    { label: '3', tone: 'light' },
    { label: '+', tone: 'medium' },
    { label: '−', tone: 'medium' },
  ],
  [
    { label: '0', tone: 'light', secondaryLabel: 'Rnd', secondaryTone: 'yellow' },
    { label: '.', tone: 'light', secondaryLabel: 'Ran#', secondaryTone: 'yellow' },
    { label: '×10ˣ', tone: 'medium', secondaryLabel: 'π', secondaryTone: 'yellow' },
    { label: 'Ans', tone: 'medium', secondaryLabel: 'DRG▶', secondaryTone: 'yellow' },
    { label: '=', tone: 'medium', secondaryLabel: '%', secondaryTone: 'yellow' },
  ],
]

const keypadRowY = [-0.45, -1.1, -1.75, -2.4, -3.14, -3.87, -4.6, -5.33] as const

function createKey(
  spec: KeySpec,
  rowIndex: number,
  keyIndex: number,
  x: number,
  y: number,
): CalculatorKeyDefinition {
  return {
    id: `key-${rowIndex + 1}-${keyIndex + 1}`,
    label: spec.label,
    tone: spec.tone ?? 'light',
    x: spec.x ?? x,
    y: spec.y ?? y,
    width: spec.width ?? keypad.keyWidth,
    height: spec.height ?? keypad.keyHeight,
    shape: spec.shape,
    secondaryLabel: spec.secondaryLabel,
    secondaryTone: spec.secondaryTone,
    labelColor: spec.labelColor,
  }
}

function createGridRow(
  row: (KeySpec | null)[],
  rowIndex: number,
  columns: number,
  y: number,
): CalculatorKeyDefinition[] {
  const width = columns === 6 ? 0.55 : keypad.keyWidth
  const gap = columns === 6 ? 0.12 : keypad.columnGap
  const totalWidth = columns * width + (columns - 1) * gap
  const leftEdge = -totalWidth / 2
  let column = 0
  const keys: CalculatorKeyDefinition[] = []

  row.forEach((spec, keyIndex) => {
    const span = spec?.span ?? 1
    const centerX = leftEdge + column * (width + gap) + (span * width + (span - 1) * gap) / 2

    if (spec) {
      keys.push(createKey(spec, rowIndex, keyIndex, centerX, y))
    }

    column += span
  })

  return keys
}

export function createKeypadKeys(rows: (KeySpec | null)[][]): CalculatorKeyDefinition[] {
  return rows.flatMap((row, rowIndex) =>
    createGridRow(row, rowIndex, row.length === 6 ? 6 : 5, keypadRowY[rowIndex] ?? -5.31),
  )
}

const actionKeys = actionRow.flatMap((spec, keyIndex) => {
  if (!spec) return []
  const key = createKey(spec, 0, keyIndex, 0, spec.y ?? 1.2)
  key.id = `action-${spec.label.toLowerCase()}`
  return [key]
})

export const dpadKeys: CalculatorKeyDefinition[] = [
  {
    id: 'dpad-up',
    label: '▲',
    tone: 'dark',
    x: 0,
    y: 0.58,
    width: 0.35,
    height: 0.32,
    shape: 'circle',
  },
  {
    id: 'dpad-left',
    label: '◀',
    tone: 'dark',
    x: -0.34,
    y: 0.24,
    width: 0.32,
    height: 0.35,
    shape: 'circle',
  },
  {
    id: 'dpad-center',
    label: '●',
    tone: 'dark',
    x: 0,
    y: 0.24,
    width: 0.3,
    height: 0.3,
    shape: 'circle',
  },
  {
    id: 'dpad-right',
    label: '▶',
    tone: 'dark',
    x: 0.34,
    y: 0.24,
    width: 0.32,
    height: 0.35,
    shape: 'circle',
  },
  {
    id: 'dpad-down',
    label: '▼',
    tone: 'dark',
    x: 0,
    y: -0.1,
    width: 0.35,
    height: 0.32,
    shape: 'circle',
  },
]

export const calculatorKeys = [...actionKeys, ...dpadKeys, ...createKeypadKeys(scientificKeyRows)]

export const scientificCalculator: CalculatorDefinition = {
  id: 'casio-fx-82ms',
  name: 'Scientific Calculator 01',
  display,
  keys: calculatorKeys,
}
