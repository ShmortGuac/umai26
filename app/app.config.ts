// Everything an organiser is likely to change lives here.
// Replace the '#' placeholders with real links before going live.
export default defineAppConfig({
  event: {
    name: "U-mai '26",
    tagline: 'University maimai Tournament',
    venue: 'Sunway Wangsa Walk',
    venueAddress: 'Wangsa Walk Mall, Jalan Wangsa Perdana 1, Wangsa Maju, 53300 Kuala Lumpur',
    mapsUrl: 'https://maps.google.com/?q=Wangsa+Walk+Mall+Kuala+Lumpur',
    finalsDate: '2026-12-12T10:00:00+08:00',
    fee: 'RM20',
    donationGiftThreshold: 'RM15',
  },
  timeline: [
    { label: 'Registrations', start: '2026-10-10', end: '2026-11-29', display: '10 Oct – 29 Nov', note: 'Still open during prelims' },
    { label: 'Preliminary Rounds', start: '2026-11-15', end: '2026-11-29', display: '15 Nov – 29 Nov', note: 'Online' },
    { label: 'Knockout Rounds', start: '2026-12-12', end: '2026-12-12', display: '12 Dec', note: 'Sunway Wangsa Walk' },
  ],
  links: {
    registration: 'https://forms.gle/Z4g3ZGGrT1d4BSFU9',
    discord: 'https://discord.com/invite/qUEvdDE8XY',
    // Optional online payment link; the button is hidden while empty.
    donation: '',
    donationQr: '/img/donation-qr.png',
    rulebookPdf: '/U-mai26-Rulebook.pdf',
    instagram: '#',
    tiktok: '#',
  },
})
