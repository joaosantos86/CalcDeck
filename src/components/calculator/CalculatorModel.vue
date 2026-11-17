<script setup lang="ts">
import { calculatorKeys, keyBaseZ } from '@/data/scientificCalculator'

import CalculatorBody from './CalculatorBody.vue'
import CalculatorDisplay from './CalculatorDisplay.vue'
import CalculatorKey from './CalculatorKey.vue'
import NavigationPad from './NavigationPad.vue'

const keys = calculatorKeys
</script>

<template>
  <TresGroup>
    <CalculatorBody />
    <CalculatorDisplay />
    <NavigationPad />
    <CalculatorKey
      v-for="key in keys"
      :key="key.id"
      :label="key.label"
      :tone="key.tone"
      :x="key.x"
      :y="key.y"
      :z="keyBaseZ + (key.id.startsWith('dpad-') ? 0.05 : 0)"
      :width="key.width"
      :height="key.height"
      :shape="key.shape"
      :secondary-label="key.secondaryLabel"
      :secondary-tone="key.secondaryTone"
      :label-color="key.labelColor"
    />
  </TresGroup>
</template>
