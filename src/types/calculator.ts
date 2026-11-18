export type KeyTone = 'light' | 'medium' | 'dark' | 'red' | 'orange'
export type SecondaryTone = 'yellow' | 'red'
export type KeyShape = 'rect' | 'circle'

export type AngleMode = 'DEG' | 'RAD' | 'GRA'

/** Every key press is described by one of these serializable commands. */
export type KeyAction =
  | 'shift'
  | 'alpha'
  | 'mode'
  | 'drg'
  | 'hyp'
  | 'on'
  | 'clear'
  | 'delete'
  | 'insert'
  | 'equals'
  | 'decimal'
  | 'sign'
  | 'comma'
  | 'exponent'
  | 'lparen'
  | 'rparen'
  | 'fraction'
  | 'engineering'
  | 'dms'
  | 'memory-add'
  | 'memory-recall'
  | 'store'
  | 'unsupported'
  | `digit:${string}`
  | `op:${'+' | '-' | '*' | '/' | '^'}`
  | `postfix:${'!' | '²' | '³' | '⁻¹' | '%'}`
  | `fn:${CalculatorFunction}`
  | `const:${'pi' | 'e' | 'ans' | 'random' | 'rnd'}`
  | `var:${CalculatorVariable}`
  | `cursor:${'left' | 'right' | 'start' | 'end'}`

export type CalculatorFunction =
  | 'sin'
  | 'cos'
  | 'tan'
  | 'asin'
  | 'acos'
  | 'atan'
  | 'sinh'
  | 'cosh'
  | 'tanh'
  | 'asinh'
  | 'acosh'
  | 'atanh'
  | 'sqrt'
  | 'cbrt'
  | 'log'
  | 'ln'
  | 'exp10'
  | 'exp'
  | 'nCr'
  | 'nPr'
  | 'Pol'
  | 'Rec'
  | 'root'

export type CalculatorVariable = 'A' | 'B' | 'C' | 'D' | 'X' | 'Y' | 'M'

export interface CalculatorKeyDefinition {
  id: string
  label: string
  tone: KeyTone
  /** Key center on the X axis, in calculator units. */
  x: number
  /** Key center on the Y axis, in calculator units. */
  y: number
  width: number
  height: number
  shape?: KeyShape
  secondaryLabel?: string
  secondaryTone?: SecondaryTone
  labelColor?: string
  /** Action performed on a plain press. */
  action: KeyAction
  /** Action performed while SHIFT is active (yellow secondary label). */
  shiftAction?: KeyAction
  /** Action performed while ALPHA is active (red secondary label). */
  alphaAction?: KeyAction
}

export type KeySpec = Partial<Omit<CalculatorKeyDefinition, 'label'>> & {
  label: string
  /** Number of grid columns occupied by the key. Defaults to 1. */
  span?: number
}

export interface DisplayLayout {
  centerY: number
  frameWidth: number
  frameHeight: number
  frameRadius: number
  frameDepth: number
  panelWidth: number
  panelHeight: number
  panelRadius: number
  panelDepth: number
  value: string
}

export interface CalculatorDefinition {
  id: string
  name: string
  display: DisplayLayout
  keys: CalculatorKeyDefinition[]
}

/** Everything the LCD needs in order to draw itself. */
export interface CalculatorDisplayState {
  expression: string
  caret: number | null
  value: string
  mode: AngleMode
  shift: boolean
  alpha: boolean
  hyp: boolean
  memory: boolean
  insert: boolean
  error: string | null
  hint?: string
}
