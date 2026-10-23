// Rulebook content, mirrored from the official U-mai '26 rulebook PDF.
// `**text**` renders as a highlight.
export interface RuleSection {
  id: string
  title: string
  items: string[]
}

export const rules: RuleSection[] = [
  {
    id: 'overview',
    title: 'Tournament Overview',
    items: [
      'U-mai is a maimai tournament made for University Students.',
      'The tournament format is **Double-Elimination**.',
    ],
  },
  {
    id: 'eligibility',
    title: 'Registration & Eligibility',
    items: [
      'Registration is limited to **One Entry per Person**.',
      'A **RM20** fee is required for each registration. This is to cover the costs that come with hosting the tournament.',
      'The tournament is open only to University and Higher Education students with an active matric/student number.',
      'For proof, we require participants to provide a photo of their Student ID.',
      'Participants will be contacted through Discord if there are any discrepancies or clarifications needed regarding their student status.',
      'Participants must join the Discord Server for further announcements and notices regarding the tournament.',
      'Each player must use the same Aime or Banapassport account and the same maimai DX in-game name throughout the tournament.',
    ],
  },
  {
    id: 'format',
    title: 'Tournament Format',
    items: [
      'The tournament consists of two parts: the **Preliminary** and the **Final Stage**.',
      'The top 16 participants from the Preliminary Stage move on to the Final Stage.',
      'The Preliminary round is held **ONLINE** and the Final Stage is held **PHYSICALLY**.',
    ],
  },
  {
    id: 'prelims',
    title: 'Preliminary Round',
    items: [
      'The Preliminary round is held **ONLINE** until **29th November 2026**.',
      'It features 3 songs to be played by the participants.',
      'Participants are required to record themselves playing the 3 songs, in any order, in **one credit**, and upload their video submission.',
      'Seedings and qualifying players are determined from the video submissions.',
      'Preliminary songs will be announced in the Discord Server and on all U-mai socials.',
    ],
  },
  {
    id: 'match',
    title: 'Match Rules',
    items: [
      'Each match is played as a **4-song set**.',
      'The songs played in a match are determined from a chart pool of 8 charts.',
      'Each player gets to **ban 1 chart** from being played in the match.',
      'Each player gets to **pick 2 charts** to play.',
      'Each match starts with a coin flip to determine the first ban.',
      'The winner is determined by the total **Achievement Score (%)** achieved by the player.',
      'If the Achievement Score is tied, the winner is determined by the **DX Score**.',
      'If both the Achievement and DX Score are tied, a tiebreaker chart will be played.',
      'Grand Finals are played **without Bracket Reset**.',
    ],
  },
  {
    id: 'pools',
    title: 'Chart Pools',
    items: [
      'Each round has a unique chart pool (including Upper and Lower bracket).',
      'Each chart pool consists of 8 charts: **4 Standard** and **4 Deluxe**.',
      'Each pool is given a minimum and maximum difficulty level for each round.',
      'The pool is revealed during the round in session (e.g. the Round 1 pool is revealed during Round 1).',
      'However, hints for charts in certain pools may be given to tease the players :)',
    ],
  },
  {
    id: 'donations',
    title: 'Donations',
    items: [
      'As U-mai is a self-hosted event, we gladly accept donations of any amount :D',
      'Donations are used to fund the event and contribute directly towards the prize pool.',
      'As a token of appreciation, a special gift will be given to those who donate **more than RM15**.',
    ],
  },
]

export const daySchedule = [
  { time: '10:00 – 11:00', event: 'Venue setup / Player warm-up / Registration' },
  { time: '11:00 – 11:15', event: 'Introduction' },
  { time: '11:15 – 12:45', event: 'Upper Bracket Round 1 & Lower Bracket Round 1', match: true },
  { time: '12:45 – 14:00', event: 'Lunch Break' },
  { time: '14:00 – 14:30', event: 'Upper Bracket Quarter Finals', match: true },
  { time: '14:30 – 15:00', event: 'Lower Bracket Round 2', match: true },
  { time: '15:30 – 16:00', event: 'Upper Bracket Semi Finals & Lower Bracket Round 3', match: true },
  { time: '16:30 – 17:00', event: 'Lower Bracket Round 4', match: true },
  { time: '17:00 – 17:30', event: 'Upper Bracket Finals & Lower Bracket Round 5', match: true },
  { time: '18:15 – 18:30', event: 'Lower Bracket Finals', match: true },
  { time: '19:00 – 19:30', event: 'Grand Finals', match: true, highlight: true },
  { time: '19:45 – 20:00', event: 'Prize Giving Ceremony / Photoshoot' },
]

// Minimal, safe markdown: escape HTML first, then turn **x** into <strong>.
export function renderRule(text: string) {
  const escaped = text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
  return escaped.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
}
