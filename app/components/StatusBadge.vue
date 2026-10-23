<script setup lang="ts">
defineProps<{ status: 'pending' | 'approved' | 'rejected' }>()

const styles = {
  pending: 'bg-gold/15 text-gold',
  approved: 'bg-emerald-400/15 text-emerald-300',
  rejected: 'bg-rose/15 text-rose-light',
}
const labels = { pending: 'Under review', approved: 'Approved', rejected: 'Needs resubmission' }
</script>

<template>
  <span class="inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold" :class="styles[status]">
    {{ labels[status] }}
  </span>
</template>
