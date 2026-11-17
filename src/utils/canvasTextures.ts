import { CanvasTexture, SRGBColorSpace } from 'three'

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
  { color, weight = 600, scale = 0.52, secondaryLabel, secondaryColor = '#d5c66a' }: LabelTextureOptions,
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
  const fontSize = fitFontSize(context, text, width * 0.84, height * mainScale, height * 0.54, weight)
  context.font = `${weight} ${fontSize}px ${FONT_FAMILY}`
  context.fillStyle = color
  context.textAlign = 'center'
  context.textBaseline = 'middle'
  context.fillText(text, width / 2, height * (secondaryLabel ? 0.68 : 0.52))

  if (secondaryLabel) {
    const secondarySize = Math.max(10, fitFontSize(context, secondaryLabel, width * 0.84, height * 0.22, height * 0.24, 500))
    context.font = `500 ${secondarySize}px ${FONT_FAMILY}`
    context.fillStyle = secondaryColor
    context.textBaseline = 'middle'
    context.fillText(secondaryLabel, width / 2, height * 0.16)
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

function drawSevenSegmentDigit(
  context: CanvasRenderingContext2D,
  digit: string,
  x: number,
  y: number,
  width: number,
  height: number,
  thickness: number,
): void {
  const patterns: Record<string, string> = {
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
  }
  const activeSegments = patterns[digit] ?? ''
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

  for (const [segment, bounds] of Object.entries(segments)) {
    if (activeSegments.includes(segment)) {
      drawRoundedBar(context, ...bounds, segmentRadius)
    }
  }
}

export function createLcdTexture(value: string): CanvasTexture {
  const width = 1728
  const height = 192
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height

  const context = canvas.getContext('2d')
  if (!context) {
    return createCanvasTexture(canvas)
  }

  const background = context.createLinearGradient(0, 0, 0, height)
  background.addColorStop(0, '#bfd2a3')
  background.addColorStop(0.55, '#b2c894')
  background.addColorStop(1, '#a4ba86')
  context.fillStyle = background
  context.fillRect(0, 0, width, height)

  const vignette = context.createRadialGradient(
    width / 2,
    height / 2,
    height * 0.2,
    width / 2,
    height / 2,
    width * 0.62,
  )
  vignette.addColorStop(0, 'rgba(255, 255, 255, 0)')
  vignette.addColorStop(1, 'rgba(40, 52, 32, 0.24)')
  context.fillStyle = vignette
  context.fillRect(0, 0, width, height)

  context.fillStyle = '#3a4433'
  context.font = `600 24px ${FONT_FAMILY}`
  context.textAlign = 'left'
  context.textBaseline = 'middle'
  context.fillText('DEG', 44, 38)

  const digitHeight = 128
  const digitWidth = 76
  const thickness = 14
  const digitY = (height - digitHeight) / 2
  const gap = 16
  const periodWidth = 18
  const rightEdge = width - 62
  const totalWidth = digitWidth * 2 + gap + 8 + periodWidth
  let cursor = rightEdge - totalWidth

  context.fillStyle = '#202a1c'

  for (const character of value.replace('.', '')) {
    drawSevenSegmentDigit(context, character, cursor, digitY, digitWidth, digitHeight, thickness)
    cursor += digitWidth + gap
  }

  if (value.includes('.')) {
    drawRoundedBar(
      context,
      cursor + 2,
      digitY + digitHeight - periodWidth,
      periodWidth,
      periodWidth,
      3,
    )
  }

  return createCanvasTexture(canvas)
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
