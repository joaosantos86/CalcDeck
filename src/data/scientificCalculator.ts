import type { CalculatorDefinition, CalculatorKeyDefinition, KeySpec } from '@/types/calculator'

export const body = {
  width: 6.25,
  height: 12.6,
  depth: 0.72,
  radius: 0.5,
  segments: 8,
} as const

/** Body front face is at z = depth / 2. */
export const bodyFrontZ = body.depth / 2

export const frontPanel = {
  width: 6.04,
  height: 12.36,
  depth: 0.065,
  radius: 0.44,
  bevelSize: 0.012,
  bevelThickness: 0.012,
  z: bodyFrontZ - 0.008,
  get topZ() {
    return this.z + this.depth + this.bevelThickness
  },
} as const

export const keypadPlate = {
  width: 5.86,
  height: 8.02,
  depth: 0.028,
  radius: 0.22,
  bevelSize: 0.008,
  bevelThickness: 0.008,
  centerY: -2.04,
  z: frontPanel.topZ,
  get topZ() {
    return this.z + this.depth + this.bevelThickness
  },
} as const

export const display = {
  centerY: 2.92,
  // Wider bezel and a taller LCD improve readability from the default camera angle.
  frameWidth: 5.42,
  frameHeight: 1.74,
  frameRadius: 0.2,
  frameDepth: 0.13,
  frameBevel: 0.011,
  frameZ: frontPanel.topZ,
  get frameTopZ() {
    return this.frameZ + this.frameDepth + this.frameBevel
  },
  panelWidth: 5.0,
  panelHeight: 1.33,
  panelRadius: 0.1,
  panelDepth: 0.04,
  panelBevel: 0.007,
  panelZ: frontPanel.topZ + 0.06,
  get panelTopZ() {
    return this.panelZ + this.panelDepth + this.panelBevel
  },
  value: '0',
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
  keyWidth: 0.84,
  keyHeight: 0.52,
  keyDepth: 0.12,
  keyRadius: 0.095,
  keyBevel: 0.01,
  // Wider gaps separate the keys clearly without making them look cramped.
  columnGap: 0.28,
  rowGap: 0.2,
  centerY: keypadPlate.centerY,
} as const

/** Keys sit on the keypad plate, slightly embedded by their bevel. */
export const keyBaseZ = keypadPlate.topZ

export const actionRow: (KeySpec | null)[] = [
  {
    label: 'SHIFT',
    tone: 'medium',
    x: -1.98,
    y: 1.4,
    width: 0.6,
    height: 0.6,
    shape: 'circle',
    action: 'shift',
  },
  {
    label: 'ALPHA',
    tone: 'medium',
    x: -1.0,
    y: 1.4,
    width: 0.6,
    height: 0.6,
    shape: 'circle',
    action: 'alpha',
  },
  null,
  {
    label: 'MODE',
    tone: 'medium',
    x: 1.0,
    y: 1.4,
    width: 0.6,
    height: 0.6,
    shape: 'circle',
    action: 'mode',
  },
  {
    label: 'ON',
    tone: 'medium',
    x: 1.98,
    y: 1.4,
    width: 0.6,
    height: 0.6,
    shape: 'circle',
    action: 'on',
  },
]

export const scientificKeyRows: (KeySpec | null)[][] = [
  [
    {
      label: 'x⁻¹',
      tone: 'medium',
      action: 'postfix:⁻¹',
      secondaryLabel: 'n!',
      secondaryTone: 'yellow',
      shiftAction: 'postfix:!',
    },
    {
      label: 'nCr',
      tone: 'medium',
      action: 'fn:nCr',
      secondaryLabel: 'nPr',
      secondaryTone: 'yellow',
      shiftAction: 'fn:nPr',
    },
    null,
    {
      label: 'Pol(',
      tone: 'medium',
      action: 'fn:Pol',
      secondaryLabel: 'Rec(',
      secondaryTone: 'yellow',
      shiftAction: 'fn:Rec',
    },
    {
      label: 'x³',
      tone: 'medium',
      action: 'postfix:³',
      secondaryLabel: '∛',
      secondaryTone: 'yellow',
      shiftAction: 'fn:cbrt',
    },
  ],
  [
    {
      label: 'a b/c',
      tone: 'medium',
      action: 'fraction',
      secondaryLabel: 'd/c',
      secondaryTone: 'yellow',
      shiftAction: 'fraction',
    },
    { label: '√', tone: 'medium', action: 'fn:sqrt' },
    { label: 'x²', tone: 'medium', action: 'postfix:²' },
    {
      label: '^',
      tone: 'medium',
      action: 'op:^',
      secondaryLabel: 'x√',
      secondaryTone: 'yellow',
      shiftAction: 'fn:root',
    },
    {
      label: 'log',
      tone: 'medium',
      action: 'fn:log',
      secondaryLabel: '10ˣ',
      secondaryTone: 'yellow',
      shiftAction: 'fn:exp10',
    },
    {
      label: 'ln',
      tone: 'medium',
      action: 'fn:ln',
      secondaryLabel: 'eˣ',
      secondaryTone: 'yellow',
      shiftAction: 'fn:exp',
    },
  ],
  [
    {
      label: '(−)',
      tone: 'medium',
      action: 'sign',
      secondaryLabel: 'A',
      secondaryTone: 'red',
      alphaAction: 'var:A',
    },
    {
      label: '° ′ ″',
      tone: 'medium',
      action: 'dms',
      secondaryLabel: '←',
      secondaryTone: 'yellow',
      shiftAction: 'cursor:left',
    },
    {
      label: 'hyp',
      tone: 'medium',
      action: 'hyp',
      secondaryLabel: 'B',
      secondaryTone: 'red',
      alphaAction: 'var:B',
    },
    {
      label: 'sin',
      tone: 'medium',
      action: 'fn:sin',
      secondaryLabel: 'sin⁻¹',
      secondaryTone: 'yellow',
      shiftAction: 'fn:asin',
    },
    {
      label: 'cos',
      tone: 'medium',
      action: 'fn:cos',
      secondaryLabel: 'cos⁻¹',
      secondaryTone: 'yellow',
      shiftAction: 'fn:acos',
    },
    {
      label: 'tan',
      tone: 'medium',
      action: 'fn:tan',
      secondaryLabel: 'tan⁻¹',
      secondaryTone: 'yellow',
      shiftAction: 'fn:atan',
    },
  ],
  [
    {
      label: 'RCL',
      tone: 'medium',
      action: 'memory-recall',
      secondaryLabel: 'STO',
      secondaryTone: 'yellow',
      shiftAction: 'store',
    },
    {
      label: 'ENG',
      tone: 'medium',
      action: 'engineering',
      secondaryLabel: '←',
      secondaryTone: 'yellow',
      shiftAction: 'cursor:right',
    },
    {
      label: '(',
      tone: 'medium',
      action: 'lparen',
      secondaryLabel: 'C',
      secondaryTone: 'red',
      alphaAction: 'var:C',
    },
    {
      label: ')',
      tone: 'medium',
      action: 'rparen',
      secondaryLabel: 'D',
      secondaryTone: 'red',
      alphaAction: 'var:D',
    },
    {
      label: ',',
      tone: 'medium',
      action: 'comma',
      secondaryLabel: 'X',
      secondaryTone: 'red',
      alphaAction: 'var:X',
    },
    {
      label: 'M+',
      tone: 'medium',
      action: 'memory-add',
      secondaryLabel: 'M',
      secondaryTone: 'red',
      alphaAction: 'var:M',
    },
  ],
  [
    { label: '7', tone: 'light', action: 'digit:7' },
    { label: '8', tone: 'light', action: 'digit:8' },
    { label: '9', tone: 'light', action: 'digit:9' },
    {
      label: 'DEL',
      tone: 'medium',
      labelColor: '#f08a94',
      action: 'delete',
      secondaryLabel: 'INS',
      secondaryTone: 'yellow',
      shiftAction: 'insert',
    },
    {
      label: 'AC',
      tone: 'medium',
      labelColor: '#f08a94',
      action: 'clear',
      secondaryLabel: 'OFF',
      secondaryTone: 'yellow',
      shiftAction: 'on',
    },
  ],
  [
    { label: '4', tone: 'light', action: 'digit:4' },
    { label: '5', tone: 'light', action: 'digit:5' },
    { label: '6', tone: 'light', action: 'digit:6' },
    { label: '×', tone: 'medium', action: 'op:*' },
    { label: '÷', tone: 'medium', action: 'op:/' },
  ],
  [
    {
      label: '1',
      tone: 'light',
      action: 'digit:1',
      secondaryLabel: 'S-SUM',
      secondaryTone: 'yellow',
      shiftAction: 'unsupported',
    },
    {
      label: '2',
      tone: 'light',
      action: 'digit:2',
      secondaryLabel: 'S-VAR',
      secondaryTone: 'yellow',
      shiftAction: 'unsupported',
    },
    { label: '3', tone: 'light', action: 'digit:3' },
    { label: '+', tone: 'medium', action: 'op:+' },
    { label: '−', tone: 'medium', action: 'op:-' },
  ],
  [
    {
      label: '0',
      tone: 'light',
      action: 'digit:0',
      secondaryLabel: 'Rnd',
      secondaryTone: 'yellow',
      shiftAction: 'const:rnd',
    },
    {
      label: '.',
      tone: 'light',
      action: 'decimal',
      secondaryLabel: 'Ran#',
      secondaryTone: 'yellow',
      shiftAction: 'const:random',
    },
    {
      label: '×10ˣ',
      tone: 'medium',
      action: 'exponent',
      secondaryLabel: 'π',
      secondaryTone: 'yellow',
      shiftAction: 'const:pi',
    },
    {
      label: 'Ans',
      tone: 'medium',
      action: 'const:ans',
      secondaryLabel: 'DRG▶',
      secondaryTone: 'yellow',
      shiftAction: 'drg',
    },
    {
      label: '=',
      tone: 'medium',
      action: 'equals',
      secondaryLabel: '%',
      secondaryTone: 'yellow',
      shiftAction: 'postfix:%',
    },
  ],
]

const keypadRowY = [-0.58, -1.295, -2.01, -2.725, -3.44, -4.155, -4.87, -5.585] as const

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
    action: spec.action ?? 'unsupported',
    shiftAction: spec.shiftAction,
    alphaAction: spec.alphaAction,
  }
}

function createGridRow(
  row: (KeySpec | null)[],
  rowIndex: number,
  columns: number,
  y: number,
): CalculatorKeyDefinition[] {
  const width = columns === 6 ? 0.7 : keypad.keyWidth
  const gap = columns === 6 ? 0.22 : keypad.columnGap
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
    y: 0.84,
    width: 0.46,
    height: 0.44,
    shape: 'circle',
    action: 'cursor:start',
  },
  {
    id: 'dpad-left',
    label: '◀',
    tone: 'dark',
    x: -0.43,
    y: 0.4,
    width: 0.44,
    height: 0.46,
    shape: 'circle',
    action: 'cursor:left',
  },
  {
    id: 'dpad-center',
    label: '●',
    tone: 'dark',
    x: 0,
    y: 0.4,
    width: 0.4,
    height: 0.4,
    shape: 'circle',
    action: 'equals',
  },
  {
    id: 'dpad-right',
    label: '▶',
    tone: 'dark',
    x: 0.43,
    y: 0.4,
    width: 0.44,
    height: 0.46,
    shape: 'circle',
    action: 'cursor:right',
  },
  {
    id: 'dpad-down',
    label: '▼',
    tone: 'dark',
    x: 0,
    y: -0.04,
    width: 0.46,
    height: 0.44,
    shape: 'circle',
    action: 'cursor:end',
  },
]

export const calculatorKeys = [...actionKeys, ...dpadKeys, ...createKeypadKeys(scientificKeyRows)]

export const scientificCalculator: CalculatorDefinition = {
  id: 'casio-fx-82ms',
  name: 'Scientific Calculator 01',
  display,
  keys: calculatorKeys,
}
