import {
  DEFAULT_RATES,
  DEFAULT_SETTINGS,
  laterMorning,
  nextMorning,
  quoteJob,
  upsellFor,
  writeDraft,
  type LeadInput,
} from './model.ts'

const base: LeadInput = {
  name: 'Alex',
  phone: '(229) 555-0148',
  place: 'arlington',
  street: 'Church Street',
  yard: 'town',
  services: ['mow', 'straw'],
  bales: 22,
  frequency: 'weekly',
  dog: true,
  note: 'Gate code is on the post',
}

let failures = 0

function expect(condition: boolean, message: string) {
  if (!condition) {
    failures += 1
    console.error(message)
  }
}

const priced = quoteJob(base, DEFAULT_RATES)
expect(priced.visitLow === 231 && priced.visitHigh === 322, `visit range ${priced.visitLow}–${priced.visitHigh}`)
expect(priced.recurringLow === 55 && priced.recurringHigh === 80, `recurring ${priced.recurringLow}–${priced.recurringHigh}`)
expect(priced.onceLow === 176 && priced.onceHigh === 242, `straw ${priced.onceLow}–${priced.onceHigh}`)

const withoutDog = quoteJob({ ...base, dog: false }, DEFAULT_RATES)
expect(withoutDog.visitLow === priced.visitLow && withoutDog.visitHigh === priced.visitHigh, 'dog changed the price')

const empty = quoteJob({ ...base, services: [] }, DEFAULT_RATES)
expect(empty.empty && empty.visitLow == null, 'empty services still priced')

const outside = quoteJob({ ...base, place: 'other' }, DEFAULT_RATES)
expect(outside.needsVisit && outside.visitLow == null, 'outside town was priced')

const biweekly = quoteJob({ ...base, services: ['mow'], place: 'blakely' }, DEFAULT_RATES)
expect(biweekly.visitLow === 45 && biweekly.visitHigh === 65, `weekly blakely ${biweekly.visitLow}–${biweekly.visitHigh}`)

const tall = quoteJob({ ...base, services: ['mow'], place: 'blakely', frequency: 'biweekly' }, DEFAULT_RATES)
expect(tall.visitLow === 52 && tall.visitHigh === 75, `biweekly ${tall.visitLow}–${tall.visitHigh}`)

const october = new Date(2026, 9, 14, 15, 0, 0)
const fallCue = upsellFor(['mow'], 'town', 'weekly', october)
expect(Boolean(fallCue && /pine straw/i.test(fallCue.text)), `october cue: ${fallCue?.text}`)

const july = upsellFor(['mow'], 'town', 'biweekly', new Date(2026, 6, 14, 15, 0, 0))
expect(Boolean(july && !/pine straw/i.test(july.text)), `july cue: ${july?.text}`)

const draft = writeDraft(base, priced, DEFAULT_SETTINGS)
expect(draft.includes('Alex'), 'draft missing name')
expect(draft.includes('Jon'), 'draft missing owner')
expect(draft.includes('$231'), `draft missing price: ${draft}`)
expect(draft.includes('dog'), 'draft missing dog')
expect(draft.includes('note'), 'draft missing note')

const follow = nextMorning(october)
expect(follow.getDate() === 15 && follow.getHours() === 8, 'next morning missed')
const later = laterMorning(october, 2)
expect(later.getDate() === 16 && later.getHours() === 8, 'later morning missed')

if (failures > 0) {
  console.error(`${failures} model checks failed`)
  process.exit(1)
}

console.log('model checks passed')
