<script setup lang="ts">
import CalculatorScene from '@/components/calculator/CalculatorScene.vue'
</script>

<template>
  <main class="relative h-dvh overflow-hidden bg-surface text-foreground">
    <section
      class="absolute inset-0"
      aria-label="Visualização tridimensional da Scientific Calculator 01"
    >
      <CalculatorScene />
    </section>

    <header
      class="pointer-events-none absolute inset-x-0 top-0 z-10 flex items-baseline gap-3 px-5 pt-5 sm:px-8 sm:pt-6 [@media(max-height:520px)]:pt-3"
    >
      <p class="text-xs font-medium tracking-[0.32em] text-brand-400 uppercase">CalcDeck</p>
      <span class="h-3 w-px bg-border-subtle" aria-hidden="true"></span>
      <h1 class="text-xs font-medium tracking-tight text-muted sm:text-sm">
        Scientific Calculator 01
      </h1>
    </header>

    <footer
      class="pointer-events-none absolute inset-x-0 bottom-0 z-10 px-5 pb-5 text-center sm:pb-6 [@media(max-height:520px)]:pb-3"
    >
      <p class="text-[11px] tracking-wide text-muted/75">
        Arraste para girar · Role ou pinça para aproximar
      </p>
    </footer>
  </main>
</template>
