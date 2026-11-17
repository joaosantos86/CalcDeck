export type KeyTone = 'light' | 'medium' | 'dark' | 'red' | 'orange'
export type SecondaryTone = 'yellow' | 'red'
export type KeyShape = 'rect' | 'circle'

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
}

export type KeySpec = Pick<CalculatorKeyDefinition, 'label'> &
  Partial<Pick<CalculatorKeyDefinition, 'tone' | 'width' | 'height' | 'shape' | 'secondaryLabel' | 'secondaryTone' | 'labelColor' | 'x' | 'y'>> & {
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
