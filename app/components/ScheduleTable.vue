<template>
  <div class="overflow-hidden rounded-xl border border-rose-light/30">
    <table class="w-full text-left text-sm sm:text-base">
      <thead class="bg-rose-light/90 text-ink-900">
        <tr>
          <th scope="col" class="w-32 px-4 py-2.5 font-semibold sm:w-40">Time</th>
          <th scope="col" class="px-4 py-2.5 font-semibold">Event</th>
        </tr>
      </thead>
      <tbody>
        <tr
          v-for="row in daySchedule"
          :key="row.time"
          class="border-t border-rose-light/20"
          :class="row.highlight ? 'bg-orchid/15' : ''"
        >
          <td class="px-4 py-3 whitespace-nowrap text-fg-muted tabular-nums">{{ row.time }}</td>
          <td class="px-4 py-3" :class="row.highlight ? 'font-semibold text-white' : row.match ? 'text-fg' : 'text-fg-muted'">
            {{ row.event }}
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
