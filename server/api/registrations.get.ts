// Returns how many people have registered, read from a published Google Sheet CSV whose
// first cell holds the count. Only the number is ever sent to the browser.
// Cached for 5 minutes so Google isn't hit on every page view.
export default defineCachedEventHandler(async () => {
  const url = useRuntimeConfig().registrationCountCsv
  if (!url) return { count: null }

  try {
    const csv = await $fetch<string>(url, { responseType: 'text', timeout: 5000 })
    const firstCell = csv.trim().split(/[\r\n,]/)[0]?.replace(/"/g, '') ?? ''
    const count = Number.parseInt(firstCell, 10)
    return { count: Number.isFinite(count) && count >= 0 ? count : null }
  }
  catch {
    return { count: null }
  }
}, { name: 'registrations', maxAge: 300, swr: true })
