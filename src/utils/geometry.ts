import { ExtrudeGeometry, Path, Shape } from 'three'

export interface RoundedRectShapeOptions {
  width: number
  height: number
  radius: number
}

export interface RoundedPanelOptions extends RoundedRectShapeOptions {
  depth: number
  bevelSize?: number
  bevelThickness?: number
  bevelSegments?: number
  curveSegments?: number
}

function traceRoundedRect(path: Path, { width, height, radius }: RoundedRectShapeOptions): void {
  const x = -width / 2
  const y = -height / 2
  const r = Math.min(radius, width / 2, height / 2)

  path.moveTo(x + r, y)
  path.lineTo(x + width - r, y)
  path.quadraticCurveTo(x + width, y, x + width, y + r)
  path.lineTo(x + width, y + height - r)
  path.quadraticCurveTo(x + width, y + height, x + width - r, y + height)
  path.lineTo(x + r, y + height)
  path.quadraticCurveTo(x, y + height, x, y + height - r)
  path.lineTo(x, y + r)
  path.quadraticCurveTo(x, y, x + r, y)
}

export function createRoundedRectShape(options: RoundedRectShapeOptions): Shape {
  const shape = new Shape()
  traceRoundedRect(shape, options)
  return shape
}

/**
 * Extruded rounded rectangle with softly beveled front and back edges.
 * The geometry is centered on X/Y and grows from `z = -bevelThickness` to
 * `z = depth + bevelThickness`, so it can be seated directly on a surface.
 */
export function createRoundedPanelGeometry({
  depth,
  bevelSize = 0.015,
  bevelThickness = 0.015,
  bevelSegments = 3,
  curveSegments = 8,
  ...shapeOptions
}: RoundedPanelOptions): ExtrudeGeometry {
  const geometry = new ExtrudeGeometry(createRoundedRectShape(shapeOptions), {
    depth,
    bevelEnabled: true,
    bevelSize,
    bevelThickness,
    bevelSegments,
    curveSegments,
    steps: 1,
  })

  geometry.computeVertexNormals()
  return geometry
}

/** Rounded rectangle with a rounded rectangular opening, used for display bezels. */
export function createRoundedFrameGeometry({
  outer,
  inner,
  depth,
  bevelSize = 0.012,
  bevelThickness = 0.012,
  curveSegments = 10,
}: {
  outer: RoundedRectShapeOptions
  inner: RoundedRectShapeOptions
  depth: number
  bevelSize?: number
  bevelThickness?: number
  curveSegments?: number
}): ExtrudeGeometry {
  const shape = createRoundedRectShape(outer)
  const hole = new Path()
  traceRoundedRect(hole, inner)
  shape.holes.push(hole)

  const geometry = new ExtrudeGeometry(shape, {
    depth,
    bevelEnabled: true,
    bevelSize,
    bevelThickness,
    bevelSegments: 2,
    curveSegments,
    steps: 1,
  })

  geometry.computeVertexNormals()
  return geometry
}
