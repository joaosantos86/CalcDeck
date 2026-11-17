<script setup lang="ts">
import { useLoop, useTresContext } from '@tresjs/core'
import { PerspectiveCamera, Vector3 } from 'three'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'
import { onUnmounted, shallowRef, watchEffect } from 'vue'

import { body } from '@/data/scientificCalculator'

const FOV = 34
const INITIAL_DIRECTION = new Vector3(0.16, 0.1, 1).normalize()

const { camera, renderer, sizes } = useTresContext()
const controls = shallowRef<OrbitControls>()
const { onBeforeRender } = useLoop()

const initialAzimuth = Math.atan2(INITIAL_DIRECTION.x, INITIAL_DIRECTION.z)
const initialPolar = Math.acos(INITIAL_DIRECTION.y)

function fitDistance(aspect: number): number {
  const fitMargin = aspect < 0.9 ? 1.16 : 1.3
  const halfVerticalFov = Math.tan((FOV * Math.PI) / 360)
  const distanceForHeight = (body.height * fitMargin) / (2 * halfVerticalFov)
  const distanceForWidth = (body.width * fitMargin) / (2 * halfVerticalFov * aspect)

  return Math.max(distanceForHeight, distanceForWidth)
}

function ensureControls(activeCamera: PerspectiveCamera): void {
  if (controls.value) {
    return
  }

  const domElement = renderer.instance?.domElement
  if (!domElement) {
    return
  }

  const orbitControls = new OrbitControls(activeCamera, domElement)
  orbitControls.target.set(0, 0, 0)
  orbitControls.enableDamping = true
  orbitControls.dampingFactor = 0.08
  orbitControls.enablePan = false
  orbitControls.rotateSpeed = 0.55
  orbitControls.zoomSpeed = 0.7
  orbitControls.minAzimuthAngle = initialAzimuth - 0.35
  orbitControls.maxAzimuthAngle = initialAzimuth + 0.35
  orbitControls.minPolarAngle = initialPolar - 0.26
  orbitControls.maxPolarAngle = initialPolar + 0.2
  orbitControls.update()

  controls.value = orbitControls
}

function applyFraming(aspect: number): void {
  const activeCamera = camera.activeCamera.value
  if (!(activeCamera instanceof PerspectiveCamera)) {
    return
  }

  const distance = fitDistance(aspect)
  activeCamera.aspect = aspect
  activeCamera.updateProjectionMatrix()
  activeCamera.position.copy(INITIAL_DIRECTION).multiplyScalar(distance)
  activeCamera.lookAt(0, 0, 0)

  ensureControls(activeCamera)

  if (controls.value) {
    controls.value.minDistance = distance * 0.68
    controls.value.maxDistance = distance * 1.6
    controls.value.update()
  }
}

const stopWatchingSetup = watchEffect(() => {
  if (!renderer.isInitialized.value) {
    return
  }

  applyFraming(sizes.aspectRatio.value)
})

const stopRendering = onBeforeRender(() => {
  controls.value?.update()
})

onUnmounted(() => {
  stopWatchingSetup()
  stopRendering.off()
  controls.value?.dispose()
})
</script>

<template>
  <TresPerspectiveCamera :fov="FOV" :near="0.1" :far="200" :position="[2.4, 1.5, 12]" />
</template>
