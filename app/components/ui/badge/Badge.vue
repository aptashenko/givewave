<script setup lang="ts">
import { computed } from 'vue'
import { cn } from '~/lib/utils'

const props = withDefaults(defineProps<{
  variant?: 'default' | 'secondary' | 'outline'
  class?: string
}>(), {
  variant: 'default'
})

const classes = computed(() => cn(
  'inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium',
  props.variant === 'default' && 'bg-primary text-primary-foreground',
  props.variant === 'secondary' && 'bg-muted text-muted-foreground',
  props.variant === 'outline' && 'border border-border bg-background',
  props.class
))
</script>

<template>
  <span :class="classes">
    <slot />
  </span>
</template>
