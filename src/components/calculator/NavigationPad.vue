<script setup lang="ts">
import { CylinderGeometry } from 'three'
import { onUnmounted } from 'vue'

import { keyBaseZ } from '@/data/scientificCalculator'

const geometry = new CylinderGeometry(0.57, 0.57, 0.055, 40, 1)
geometry.rotateX(Math.PI / 2)

onUnmounted(() => geometry.dispose())
</script>

<template>
  <TresMesh :position="[0, 0.24, keyBaseZ + 0.022]" :geometry="geometry" receive-shadow>
    <TresMeshStandardMaterial color="#383a37" :roughness="0.58" :metalness="0.08" />
  </TresMesh>
</template>
