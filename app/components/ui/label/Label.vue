<script setup lang="ts">
import { cn } from '~/lib/utils'

defineProps<{
  for?: string
  class?: string
}>()
</script>

<template>
  <label :for="for" :class="cn('text-sm font-medium leading-none text-foreground', $props.class)">
    <slot />
  </label>
</template>
