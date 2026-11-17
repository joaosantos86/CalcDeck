<script setup lang="ts">
import { useTresContext } from '@tresjs/core'
import { PMREMGenerator, type Texture, WebGLRenderer } from 'three'
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js'
import { onUnmounted, watch } from 'vue'

const { scene, renderer } = useTresContext()
let environmentTexture: Texture | null = null

const stopWatchingRenderer = watch(
  () => renderer.isInitialized.value,
  (initialized) => {
    if (!initialized || environmentTexture) {
      return
    }

    const instance = renderer.instance
    if (!(instance instanceof WebGLRenderer)) {
      return
    }

    const generator = new PMREMGenerator(instance)
    const room = new RoomEnvironment()
    environmentTexture = generator.fromScene(room, 0.045).texture

    scene.value.environment = environmentTexture
    scene.value.environmentIntensity = 0.4

    generator.dispose()
    room.dispose()
  },
  { immediate: true },
)

onUnmounted(() => {
  stopWatchingRenderer()
  if (environmentTexture) {
    if (scene.value.environment === environmentTexture) {
      scene.value.environment = null
    }
    environmentTexture.dispose()
    environmentTexture = null
  }
})
</script>

<template>
  <slot />
</template>
