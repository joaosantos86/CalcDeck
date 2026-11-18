import { CanvasTexture, SRGBColorSpace } from 'three'

import type { CalculatorDisplayState } from '@/types/calculator'

const FONT_FAMILY = "'Helvetica Neue', 'Segoe UI', Arial, sans-serif"
const LABEL_TEXTURE_HEIGHT = 256

export interface LabelTextureOptions {
  color: string
  weight?: number
  /** Fraction of the texture height used by the glyphs. */
  scale?: number
  secondaryLabel?: string
  secondaryColor?: string
}

function fitFontSize(
  context: CanvasRenderingContext2D,
  text: string,
  width: number,
  height: number,
  maxFontSize: number,
  weight: number,
): number {
  let fontSize = maxFontSize

  while (fontSize > 8) {
    context.font = `${weight} ${fontSize}px ${FONT_FAMILY}`
    const metrics = context.measureText(text)
    const glyphHeight =
      (metrics.actualBoundingBoxAscent ?? fontSize * 0.7) +
      (metrics.actualBoundingBoxDescent ?? fontSize * 0.2)

    if (metrics.width <= width && glyphHeight <= height) {
      break
    }

    fontSize *= 0.92
  }

  return fontSize
}

function createCanvasTexture(canvas: HTMLCanvasElement): CanvasTexture {
  const texture = new CanvasTexture(canvas)
  texture.colorSpace = SRGBColorSpace
  texture.anisotropy = 8
  return texture
}

/** Label texture whose aspect ratio matches the plane it will be mapped onto. */
export function createLabelTexture(
  text: string,
  aspectRatio: number,
  {
    color,
    weight = 600,
    scale = 0.52,
    secondaryLabel,
    secondaryColor = '#d5c66a',
  }: LabelTextureOptions,
): CanvasTexture {
  const aspect = Math.max(aspectRatio, 0.1)
  const maxWidth = 1024
  let height = LABEL_TEXTURE_HEIGHT
  let width = Math.round(height * aspect)

  if (width > maxWidth) {
    width = maxWidth
    height = Math.max(48, Math.round(width / aspect))
  }

  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height

  const context = canvas.getContext('2d')
  if (!context) {
    return createCanvasTexture(canvas)
  }

  const mainScale = secondaryLabel ? Math.min(scale, 0.38) : scale
  const fontSize = fitFontSize(
    context,
    text,
    width * 0.84,
    height * mainScale,
    height * 0.54,
    weight,
  )
  context.font = `${weight} ${fontSize}px ${FONT_FAMILY}`
  context.fillStyle = color
  context.textAlign = 'center'
  context.textBaseline = 'middle'
  context.fillText(text, width / 2, height * (secondaryLabel ? 0.68 : 0.52))

  if (secondaryLabel) {
    const secondarySize = Math.max(
      11,
      fitFontSize(context, secondaryLabel, width * 0.84, height * 0.26, height * 0.26, 600),
    )
    context.font = `600 ${secondarySize}px ${FONT_FAMILY}`
    context.fillStyle = secondaryColor
    context.textBaseline = 'middle'
    context.fillText(secondaryLabel, width / 2, height * 0.155)
  }

  return createCanvasTexture(canvas)
}

function drawRoundedBar(
  context: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number,
): void {
  context.beginPath()
  context.roundRect(x, y, width, height, radius)
  context.fill()
}

const SEGMENT_PATTERNS: Record<string, string> = {
  '0': 'abcdef',
  '1': 'bc',
  '2': 'abged',
  '3': 'abgcd',
  '4': 'fgbc',
  '5': 'afgcd',
  '6': 'afgedc',
  '7': 'abc',
  '8': 'abcdefg',
  '9': 'abcfgd',
  A: 'abcefg',
  b: 'cdefg',
  C: 'adef',
  d: 'bcdeg',
  E: 'adefg',
  F: 'aefg',
  H: 'bcefg',
  L: 'def',
  n: 'ceg',
  o: 'cdeg',
  P: 'abefg',
  r: 'eg',
  S: 'acdfg',
  t: 'defg',
  U: 'bcdef',
  y: 'bcdfg',
  '-': 'g',
  '−': 'g',
  '°': 'abfg',
  ' ': '',
}

const LCD_WIDTH = 1616
const LCD_HEIGHT = 420
const LCD_SCALE = LCD_HEIGHT / 192
const LCD_INK = '#18230f'
const LCD_GHOST = 'rgba(24, 35, 15, 0.08)'

function drawSevenSegmentDigit(
  context: CanvasRenderingContext2D,
  digit: string,
  x: number,
  y: number,
  width: number,
  height: number,
  thickness: number,
): void {
  const activeSegments = SEGMENT_PATTERNS[digit] ?? ''
  const inset = thickness * 0.5
  const middleY = y + height / 2
  const horizontalLength = width - inset * 2
  const verticalLength = height / 2 - inset - thickness / 2
  const segmentRadius = thickness / 2

  const segments: Record<string, [number, number, number, number]> = {
    a: [x + inset, y, horizontalLength, thickness],
    b: [x + width - thickness, y + inset, thickness, verticalLength],
    c: [x + width - thickness, middleY + thickness / 2, thickness, verticalLength],
    d: [x + inset, y + height - thickness, horizontalLength, thickness],
    e: [x, middleY + thickness / 2, thickness, verticalLength],
    f: [x, y + inset, thickness, verticalLength],
    g: [x + inset, middleY - thickness / 2, horizontalLength, thickness],
  }

  if (digit !== ' ') {
    context.fillStyle = LCD_GHOST
    for (const bounds of Object.values(segments)) {
      drawRoundedBar(context, ...bounds, segmentRadius)
    }
  }

  context.fillStyle = LCD_INK
  for (const [segment, bounds] of Object.entries(segments)) {
    if (activeSegments.includes(segment)) {
      drawRoundedBar(context, ...bounds, segmentRadius)
    }
  }
}

function characterWidth(character: string): number {
  if (character === '.') return 22
  if (character === '-' || character === '−') return 52
  if (character === '°') return 58
  if (character === ' ') return 34
  return 86
}

function drawLcdValue(
  context: CanvasRenderingContext2D,
  text: string,
  width: number,
  height: number,
): void {
  const characters = [...text]
  const representable = characters.every((character) => character in SEGMENT_PATTERNS)

  if (!representable) {
    const availableWidth = width - 100
    const availableHeight = 210
    let fontSize = Math.min(150, availableHeight)

    while (fontSize > 12) {
      context.font = `700 ${fontSize}px ${FONT_FAMILY}`
      if (context.measureText(text).width <= availableWidth) break
      fontSize *= 0.94
    }

    context.font = `700 ${fontSize}px ${FONT_FAMILY}`
    context.fillStyle = LCD_INK
    context.textAlign = 'right'
    context.textBaseline = 'middle'
    context.fillText(text, width - 50, height * 0.72)
    return
  }

  const gap = 16 * LCD_SCALE
  const naturalWidth =
    characters.reduce((total, character) => total + characterWidth(character), 0) +
    gap * Math.max(0, characters.length - 1)
  const fit = Math.min(1, (width - 110) / naturalWidth)
  const thickness = 12 * LCD_SCALE * fit
  const digitHeight = 96 * LCD_SCALE * fit
  const digitY = height * 0.72 - digitHeight / 2
  let cursor = width - 50 - naturalWidth * fit

  for (const character of characters) {
    const natural = characterWidth(character)
    const glyphWidth = natural * fit

    if (character === '.') {
      context.fillStyle = LCD_INK
      drawRoundedBar(
        context,
        cursor + glyphWidth * 0.1,
        digitY + digitHeight - thickness,
        thickness * 1.35,
        thickness * 1.35,
        3 * LCD_SCALE * fit,
      )
    } else if (character !== ' ') {
      drawSevenSegmentDigit(context, character, cursor, digitY, glyphWidth, digitHeight, thickness)
    }

    cursor += glyphWidth + gap * fit
  }
}

function drawIndicators(
  context: CanvasRenderingContext2D,
  state: CalculatorDisplayState,
  width: number,
): void {
  context.font = `700 ${26 * LCD_SCALE}px ${FONT_FAMILY}`
  context.fillStyle = '#2c3a26'
  context.textAlign = 'left'
  context.textBaseline = 'middle'
  context.fillText(state.mode, 44 * LCD_SCALE, 32 * LCD_SCALE)

  const flags = [
    state.shift ? 'S' : '',
    state.alpha ? 'A' : '',
    state.hyp ? 'hyp' : '',
    state.memory ? 'M' : '',
    state.insert ? '' : 'INS',
  ]
    .filter(Boolean)
    .join(' ')

  context.textAlign = 'right'
  const rightX = width - 44 * LCD_SCALE

  if (state.hint) {
    context.fillText(state.hint, rightX, 32 * LCD_SCALE)
    context.fillText(
      flags,
      rightX - context.measureText(state.hint).width - 30 * LCD_SCALE,
      32 * LCD_SCALE,
    )
    return
  }

  context.fillText(flags, rightX, 32 * LCD_SCALE)
}

function drawExpressionLine(
  context: CanvasRenderingContext2D,
  state: CalculatorDisplayState,
  width: number,
): void {
  const fontSize = 28 * LCD_SCALE
  const availableWidth = width - 100 * LCD_SCALE
  const characters = [...state.expression]

  context.font = `700 ${fontSize}px ${FONT_FAMILY}`
  context.textAlign = 'left'
  context.textBaseline = 'middle'

  let start = 0
  let end = characters.length

  const measure = (from: number, to: number): number =>
    context.measureText(characters.slice(from, to).join('')).width

  while (end - start > 1 && measure(start, end) > availableWidth) {
    const caret = state.caret ?? characters.length
    if (caret <= (start + end) / 2) end -= 1
    else start += 1
  }

  const visible = characters.slice(start, end).join('')
  const textWidth = context.measureText(visible).width
  const originX = width - 52 * LCD_SCALE - textWidth
  const baselineY = 72 * LCD_SCALE

  context.fillStyle = '#2c3a26'
  context.fillText(visible, originX, baselineY)

  if (state.caret !== null && state.caret >= start && state.caret <= end) {
    const prefix = characters.slice(start, state.caret).join('')
    const caretX = originX + context.measureText(prefix).width
    context.fillStyle = 'rgba(24, 35, 15, 0.8)'
    context.fillRect(caretX, baselineY - fontSize * 0.62, 3 * LCD_SCALE, fontSize * 1.15)
  }
}

export interface LcdRenderer {
  texture: CanvasTexture
  draw: (state: CalculatorDisplayState) => void
}

/** Creates a canvas-backed LCD that can be redrawn whenever the state changes. */
export function createLcdRenderer(state: CalculatorDisplayState): LcdRenderer {
  const width = LCD_WIDTH
  const height = LCD_HEIGHT
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height

  const texture = createCanvasTexture(canvas)
  const context = canvas.getContext('2d')

  const draw = (next: CalculatorDisplayState): void => {
    if (!context) return

    const background = context.createLinearGradient(0, 0, 0, height)
    background.addColorStop(0, '#d2e3b6')
    background.addColorStop(0.5, '#c3d8a4')
    background.addColorStop(1, '#b2c992')
    context.fillStyle = background
    context.fillRect(0, 0, width, height)

    const vignette = context.createRadialGradient(
      width / 2,
      height / 2,
      height * 0.22,
      width / 2,
      height / 2,
      width * 0.62,
    )
    vignette.addColorStop(0, 'rgba(255, 255, 255, 0.05)')
    vignette.addColorStop(0.75, 'rgba(40, 52, 32, 0.06)')
    vignette.addColorStop(1, 'rgba(40, 52, 32, 0.22)')
    context.fillStyle = vignette
    context.fillRect(0, 0, width, height)

    drawIndicators(context, next, width)
    drawExpressionLine(context, next, width)
    drawLcdValue(context, next.value, width, height)

    texture.needsUpdate = true
  }

  draw(state)

  return { texture, draw }
}

export function createLcdTexture(value: string): CanvasTexture {
  return createLcdRenderer({
    expression: '',
    caret: null,
    value,
    mode: 'DEG',
    shift: false,
    alpha: false,
    hyp: false,
    memory: false,
    insert: true,
    error: null,
  }).texture
}

export function createSoftShadowTexture(): CanvasTexture {
  const size = 512
  const canvas = document.createElement('canvas')
  canvas.width = size
  canvas.height = size

  const context = canvas.getContext('2d')
  if (!context) {
    return createCanvasTexture(canvas)
  }

  const gradient = context.createRadialGradient(
    size / 2,
    size / 2,
    size * 0.05,
    size / 2,
    size / 2,
    size * 0.5,
  )
  gradient.addColorStop(0, 'rgba(0, 0, 0, 0.5)')
  gradient.addColorStop(0.45, 'rgba(0, 0, 0, 0.26)')
  gradient.addColorStop(0.75, 'rgba(0, 0, 0, 0.08)')
  gradient.addColorStop(1, 'rgba(0, 0, 0, 0)')
  context.fillStyle = gradient
  context.fillRect(0, 0, size, size)

  return createCanvasTexture(canvas)
}

export function createStudioBackdropTexture(): CanvasTexture {
  const size = 1024
  const canvas = document.createElement('canvas')
  canvas.width = size
  canvas.height = size

  const context = canvas.getContext('2d')
  if (!context) {
    return createCanvasTexture(canvas)
  }

  context.fillStyle = '#08080b'
  context.fillRect(0, 0, size, size)

  const glow = context.createRadialGradient(
    size / 2,
    size * 0.47,
    0,
    size / 2,
    size * 0.47,
    size * 0.62,
  )
  glow.addColorStop(0, '#23222c')
  glow.addColorStop(0.45, '#15151b')
  glow.addColorStop(0.78, '#0c0c10')
  glow.addColorStop(1, '#070709')
  context.fillStyle = glow
  context.fillRect(0, 0, size, size)

  const violet = context.createRadialGradient(
    size / 2,
    size * 0.52,
    0,
    size / 2,
    size * 0.52,
    size * 0.3,
  )
  violet.addColorStop(0, 'rgba(99, 102, 241, 0.09)')
  violet.addColorStop(1, 'rgba(99, 102, 241, 0)')
  context.fillStyle = violet
  context.fillRect(0, 0, size, size)

  const texture = createCanvasTexture(canvas)
  texture.anisotropy = 4
  return texture
}
