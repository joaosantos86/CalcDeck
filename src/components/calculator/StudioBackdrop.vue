<script setup lang="ts">
import { onUnmounted } from 'vue'

import { createSoftShadowTexture, createStudioBackdropTexture } from '@/utils/canvasTextures'

const backdropTexture = createStudioBackdropTexture()
const softShadowTexture = createSoftShadowTexture()

onUnmounted(() => {
  backdropTexture.dispose()
  softShadowTexture.dispose()
})
</script>

<template>
  <TresMesh :position="[0, 0.4, -5.5]">
    <TresPlaneGeometry :args="[46, 34]" />
    <TresMeshStandardMaterial :map="backdropTexture" :roughness="1" :metalness="0" />
  </TresMesh>

  <TresMesh :position="[0, -0.1, -0.55]">
    <TresPlaneGeometry :args="[13.5, 7.2]" />
    <TresMeshBasicMaterial
      :map="softShadowTexture"
      :transparent="true"
      :depth-write="false"
      :opacity="0.9"
    />
  </TresMesh>
</template>
