<script setup lang="ts">
import { cn } from '~/lib/utils'

defineProps<{
  modelValue?: string | number
  type?: string
  placeholder?: string
  class?: string
  min?: string | number
  max?: string | number
  required?: boolean
}>()

defineEmits<{
  'update:modelValue': [value: string]
}>()
</script>

<template>
  <input
    :value="modelValue"
    :type="type || 'text'"
    :placeholder="placeholder"
    :min="min"
    :max="max"
    :required="required"
    :class="cn('flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none transition-colors placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring', $props.class)"
    @input="$emit('update:modelValue', ($event.target as HTMLInputElement).value)"
  >
</template>
