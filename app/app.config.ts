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
  // Update these as donations come in. The total is shown as-is, so keep it in sync with the places.
  prizePool: {
    total: 'RM250',
    places: [
      { place: '1st', amount: 'RM125' },
      { place: '2nd', amount: 'RM75' },
      { place: '3rd', amount: 'RM50' },
    ],
  },
  timeline: [
    { label: 'Registrations', start: '2026-10-10', end: '2026-11-29', display: '10 Oct – 29 Nov', note: 'Still open during prelims' },
    { label: 'Preliminary Rounds', start: '2026-11-15', end: '2026-11-29', display: '15 Nov – 29 Nov', note: 'Online' },
    { label: 'Knockout Rounds', start: '2026-12-12', end: '2026-12-12', display: '12 Dec', note: 'Sunway Wangsa Walk' },
  ],
  // Preliminary round. Keep opensAt/closesAt in sync with the timeline above.
  prelims: {
    opensAt: '2026-11-15T00:00:00+08:00',
    closesAt: '2026-11-29T23:59:59+08:00',
    window: '15 – 29 November 2026',
    deadline: '29 November 2026, 11:59 pm (MYT)',
    songs: [
      { title: 'Outer Science', artist: 'Jin', difficulty: 'MASTER', level: '13', type: 'Standard', img: '/img/Prelim 1.png' },
      { title: 'Sweet Requiem', artist: 'REDALiCE & aran', difficulty: 'MASTER', level: '13+', type: 'DX', img: '/img/Prelim 2.png' },
      { title: 'Paramount☆Showtime!!', artist: 'Hino Isuka', difficulty: 'MASTER', level: '14', type: 'DX', img: '/img/Prelim 3.png' },
    ],
  },
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
