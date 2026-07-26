<script setup lang="ts">
import { computed } from 'vue'
import { cn } from '~/lib/utils'

const props = withDefaults(defineProps<{
  variant?: 'default' | 'secondary' | 'outline' | 'ghost' | 'destructive'
  size?: 'default' | 'sm' | 'icon'
  disabled?: boolean
  type?: 'button' | 'submit' | 'reset'
  class?: string
}>(), {
  variant: 'default',
  size: 'default',
  type: 'button'
})

const classes = computed(() => cn(
  'inline-flex items-center justify-center gap-2 rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50',
  props.variant === 'default' && 'bg-primary text-primary-foreground hover:bg-primary/90',
  props.variant === 'secondary' && 'bg-muted text-foreground hover:bg-muted/80',
  props.variant === 'outline' && 'border border-input bg-background hover:bg-muted',
  props.variant === 'ghost' && 'hover:bg-muted',
  props.variant === 'destructive' && 'bg-destructive text-destructive-foreground hover:bg-destructive/90',
  props.size === 'default' && 'h-10 px-4 py-2',
  props.size === 'sm' && 'h-9 px-3',
  props.size === 'icon' && 'h-10 w-10',
  props.class
))
</script>

<template>
  <button :type="type" :disabled="disabled" :class="classes">
    <slot />
  </button>
</template>
