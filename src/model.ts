export type ServiceId = 'mow' | 'straw' | 'leaves' | 'trim' | 'beds'
export type YardId = 'small' | 'town' | 'large' | 'acre'
export type PlaceId =
  | 'blakely'
  | 'arlington'
  | 'damascus'
  | 'jakin'
  | 'bluffton'
  | 'colquitt'
  | 'cuthbert'
  | 'fort-gaines'
  | 'other'
export type Frequency = 'weekly' | 'biweekly' | 'once'
export type Status = 'new' | 'quoted' | 'won' | 'lost'
export type Source = 'sample' | 'request'

export type LeadInput = {
  name: string
  phone: string
  place: PlaceId
  street: string
  yard: YardId
  services: ServiceId[]
  bales: number
  frequency: Frequency
  dog: boolean
  note: string
}

export type Line = {
  label: string
  low: number
  high: number
  kind: 'visit' | 'once'
}

export type Quote = {
  lines: Line[]
  visitLow: number | null
  visitHigh: number | null
  recurringLow: number | null
  recurringHigh: number | null
  onceLow: number
  onceHigh: number
  needsVisit: boolean
  empty: boolean
}

export type Settings = {
  businessName: string
  owner: string
  phone: string
}

export type Pair = [number, number]

export type Rates = {
  mow: Record<YardId, Pair>
  strawBale: Pair
  leaves: Record<YardId, Pair>
  trim: Record<YardId, Pair>
  beds: Record<YardId, Pair>
  travel: Record<Exclude<PlaceId, 'blakely' | 'other'>, Pair>
}

export type Lead = {
  id: string
  createdAt: string
  followUpAt: string
  status: Status
  source: Source
  input: LeadInput
  quote: Quote
  draft: string
  draftEdited: boolean
  upsell: string | null
  events: string[]
}

export type Stop = {
  id: string
  leadId: string
  weekday: number
  title: string
  detail: string
}

export const DEFAULT_SETTINGS: Settings = {
  businessName: 'Blakely Yard Co',
  owner: 'Jon',
  phone: '',
}

export const YARDS: Array<{ id: YardId; label: string; phrase: string }> = [
  { id: 'small', label: 'Small', phrase: 'small yard' },
  { id: 'town', label: 'Town lot', phrase: 'town lot' },
  { id: 'large', label: 'Large', phrase: 'large lot' },
  { id: 'acre', label: 'Acre+', phrase: 'yard over an acre' },
]

export const SERVICES: Array<{ id: ServiceId; label: string; detail: string }> = [
  { id: 'mow', label: 'Mow & edge', detail: 'Cut, edge, and blow the walks and driveway.' },
  { id: 'straw', label: 'Pine straw', detail: 'Bales spread in the beds.' },
  { id: 'leaves', label: 'Leaves', detail: 'Hauled off, not mowed into the lawn.' },
  { id: 'trim', label: 'Shrubs', detail: 'Hedges and shrubs shaped with shears.' },
  { id: 'beds', label: 'Beds', detail: 'Weeds pulled by hand. No spray.' },
]

export const FREQUENCIES: Array<{ id: Frequency; label: string }> = [
  { id: 'weekly', label: 'Every week' },
  { id: 'biweekly', label: 'Every two weeks' },
  { id: 'once', label: 'One time' },
]

export const PLACES: Array<{ id: PlaceId; label: string }> = [
  { id: 'blakely', label: 'Blakely' },
  { id: 'arlington', label: 'Arlington' },
  { id: 'damascus', label: 'Damascus' },
  { id: 'jakin', label: 'Jakin' },
  { id: 'bluffton', label: 'Bluffton' },
  { id: 'colquitt', label: 'Colquitt' },
  { id: 'cuthbert', label: 'Cuthbert' },
  { id: 'fort-gaines', label: 'Fort Gaines' },
  { id: 'other', label: 'Somewhere else' },
]

export const NEAR_PLACES = ['arlington', 'damascus', 'jakin', 'bluffton'] as const
export const FAR_PLACES = ['colquitt', 'cuthbert', 'fort-gaines'] as const

export const SUGGESTED_BALES: Record<YardId, number> = {
  small: 12,
  town: 22,
  large: 36,
  acre: 60,
}

export const WEEKDAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'] as const

const FREQUENCY_FACTOR: Record<Frequency, number> = {
  weekly: 1,
  biweekly: 1.15,
  once: 1.3,
}

export const DEFAULT_RATES: Rates = {
  mow: {
    small: [32, 45],
    town: [45, 65],
    large: [70, 100],
    acre: [130, 200],
  },
  strawBale: [8, 11],
  leaves: {
    small: [55, 85],
    town: [85, 130],
    large: [130, 200],
    acre: [200, 320],
  },
  trim: {
    small: [28, 40],
    town: [40, 65],
    large: [65, 100],
    acre: [110, 170],
  },
  beds: {
    small: [25, 40],
    town: [35, 60],
    large: [55, 90],
    acre: [90, 150],
  },
  travel: {
    arlington: [10, 15],
    damascus: [10, 15],
    jakin: [10, 15],
    bluffton: [10, 15],
    colquitt: [15, 25],
    cuthbert: [15, 25],
    'fort-gaines': [15, 25],
  },
}

export function money(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(value)
}

export function range(low: number, high: number): string {
  if (low === high) return money(low)
  return `${money(low)}–${money(high)}`
}

export function placeLabel(place: PlaceId): string {
  return PLACES.find((item) => item.id === place)?.label ?? place
}

export function yardPhrase(yard: YardId): string {
  return YARDS.find((item) => item.id === yard)?.phrase ?? 'yard'
}

export function customerSeason(now = new Date()): string {
  const month = now.getMonth()
  if (month >= 2 && month <= 4) {
    return 'Spring routes are open. Weekly cuts for bermuda, centipede, and the shady St. Augustine patches.'
  }
  if (month >= 5 && month <= 7) {
    return 'Summer routes. A weekly cut, before the grass gets ahead of the house.'
  }
  if (month >= 8 && month <= 10) {
    return 'Fall routes are open. Pine straw, leaf cleanup, and a cut while the grass is still moving.'
  }
  return 'Winter cleanup and shrub trimming, plus a place on the route before spring growth.'
}

export function seasonBrief(now = new Date()): string {
  const month = now.getMonth()
  if (month >= 2 && month <= 4) {
    return 'Spring growth. Bermuda and centipede get ahead of a biweekly cut. Book weekly routes.'
  }
  if (month >= 5 && month <= 7) {
    return 'Summer. Start routes early. Do not promise an afternoon window you cannot hit in this heat.'
  }
  if (month >= 8 && month <= 10) {
    return 'Fall in Early County is pine straw and leaves. Offer both on every mowing quote this month.'
  }
  return 'Winter. Growth slows. Fill the week with cleanup, trimming, and next spring’s route.'
}

export type Upsell = {
  text: string
  service: ServiceId | null
}

export function upsellFor(
  services: ServiceId[],
  yard: YardId,
  frequency: Frequency,
  now = new Date(),
): Upsell | null {
  const month = now.getMonth()
  if (month >= 8 && month <= 10 && !services.includes('straw')) {
    return {
      text: `Pine straw is going down around Blakely. A ${yardPhrase(yard)} usually takes about ${SUGGESTED_BALES[yard]} bales.`,
      service: 'straw',
    }
  }
  if ((month === 9 || month === 10 || month === 11 || month === 0) && !services.includes('leaves')) {
    return {
      text: 'Leaves are dropping. A one-time cleanup keeps the weekly mow from turning into a rake.',
      service: 'leaves',
    }
  }
  if (month >= 2 && month <= 4 && !services.includes('beds')) {
    return {
      text: 'Bed cleanup before the spring flush is an easy add-on, done by hand.',
      service: 'beds',
    }
  }
  if (month >= 5 && month <= 7 && services.includes('mow') && frequency === 'biweekly') {
    return {
      text: 'In this heat, biweekly bermuda gets away from you. Say so before you book every two weeks.',
      service: null,
    }
  }
  return null
}

export function nextMorning(from = new Date()): Date {
  const next = new Date(from)
  next.setDate(next.getDate() + 1)
  next.setHours(8, 0, 0, 0)
  return next
}

export function laterMorning(from = new Date(), days = 2): Date {
  const next = new Date(from)
  next.setDate(next.getDate() + days)
  next.setHours(8, 0, 0, 0)
  return next
}

export function morningLabel(date: Date): string {
  const day = date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
  return `${day}, 8:00 AM`
}

export function weekdayIndex(now = new Date()): number | null {
  const day = now.getDay()
  if (day === 0 || day === 6) return null
  return day - 1
}

export function lightestWeekday(stops: Stop[]): number {
  const counts = [0, 0, 0, 0, 0]
  for (const stop of stops) {
    if (stop.weekday >= 0 && stop.weekday < 5) counts[stop.weekday] += 1
  }
  let best = 0
  for (let index = 1; index < 5; index += 1) {
    if (counts[index] < counts[best]) best = index
  }
  return best
}

function ordered(pair: Pair): Pair {
  const low = Math.max(0, Math.round(Number.isFinite(pair[0]) ? pair[0] : 0))
  const high = Math.max(0, Math.round(Number.isFinite(pair[1]) ? pair[1] : 0))
  return low <= high ? [low, high] : [high, low]
}

function scale(pair: Pair, factor: number): Pair {
  const [low, high] = ordered(pair)
  return ordered([Math.round(low * factor), Math.round(high * factor)])
}

function sumLines(lines: Line[]): Pair {
  return lines.reduce((total, line) => [total[0] + line.low, total[1] + line.high] as Pair, [0, 0])
}

export function scaleAddon(defaults: Record<YardId, Pair>, townLow: number, townHigh: number): Record<YardId, Pair> {
  const baseLow = defaults.town[0] || 1
  const baseHigh = defaults.town[1] || 1
  const lowFactor = townLow / baseLow
  const highFactor = townHigh / baseHigh
  return {
    small: ordered([defaults.small[0] * lowFactor, defaults.small[1] * highFactor]),
    town: ordered([townLow, townHigh]),
    large: ordered([defaults.large[0] * lowFactor, defaults.large[1] * highFactor]),
    acre: ordered([defaults.acre[0] * lowFactor, defaults.acre[1] * highFactor]),
  }
}

export function quoteJob(input: LeadInput, rates: Rates): Quote {
  if (input.services.length === 0) {
    return {
      lines: [],
      visitLow: null,
      visitHigh: null,
      recurringLow: null,
      recurringHigh: null,
      onceLow: 0,
      onceHigh: 0,
      needsVisit: false,
      empty: true,
    }
  }

  if (input.place === 'other') {
    return {
      lines: [],
      visitLow: null,
      visitHigh: null,
      recurringLow: null,
      recurringHigh: null,
      onceLow: 0,
      onceHigh: 0,
      needsVisit: true,
      empty: false,
    }
  }

  const visit: Line[] = []
  const once: Line[] = []

  if (input.services.includes('mow')) {
    const [low, high] = scale(rates.mow[input.yard], FREQUENCY_FACTOR[input.frequency])
    const label =
      input.frequency === 'weekly'
        ? 'Weekly mowing and edging'
        : input.frequency === 'biweekly'
          ? 'Mowing and edging, every two weeks'
          : 'One-time mowing and edging'
    visit.push({ label, low, high, kind: 'visit' })
  }

  if (input.place !== 'blakely') {
    const [low, high] = ordered(rates.travel[input.place])
    if (high > 0) {
      const line = { label: `Drive to ${placeLabel(input.place)}`, low, high, kind: 'visit' as const }
      if (input.services.includes('mow')) visit.push(line)
      else once.push({ ...line, kind: 'once' })
    }
  }

  if (input.services.includes('straw')) {
    const bales = Math.max(1, Math.round(input.bales || SUGGESTED_BALES[input.yard]))
    const [low, high] = ordered(rates.strawBale)
    once.push({
      label: `Pine straw, ${bales} bales`,
      low: low * bales,
      high: high * bales,
      kind: 'once',
    })
  }

  if (input.services.includes('leaves')) {
    const [low, high] = ordered(rates.leaves[input.yard])
    once.push({ label: 'Leaf cleanup', low, high, kind: 'once' })
  }

  if (input.services.includes('trim')) {
    const [low, high] = ordered(rates.trim[input.yard])
    once.push({ label: 'Shrub trimming', low, high, kind: 'once' })
  }

  if (input.services.includes('beds')) {
    const [low, high] = ordered(rates.beds[input.yard])
    once.push({ label: 'Bed cleanup by hand', low, high, kind: 'once' })
  }

  const [visitPartLow, visitPartHigh] = sumLines(visit)
  const [onceLow, onceHigh] = sumLines(once)
  const hasRecurring = visit.length > 0

  return {
    lines: [...visit, ...once],
    visitLow: visitPartLow + onceLow,
    visitHigh: visitPartHigh + onceHigh,
    recurringLow: hasRecurring ? visitPartLow : null,
    recurringHigh: hasRecurring ? visitPartHigh : null,
    onceLow,
    onceHigh,
    needsVisit: false,
    empty: false,
  }
}

export function quoteHeadline(quote: Quote, frequency: Frequency): string {
  if (quote.empty) return 'Pick a service'
  if (quote.needsVisit || quote.visitLow == null || quote.visitHigh == null) return 'Needs a look'
  if (quote.recurringLow != null && quote.onceLow > 0) return `${range(quote.visitLow, quote.visitHigh)} first visit`
  if (quote.recurringLow != null) {
    const cadence = frequency === 'weekly' ? 'each week' : frequency === 'biweekly' ? 'every two weeks' : 'one time'
    return `${range(quote.visitLow, quote.visitHigh)} ${cadence}`
  }
  return `${range(quote.visitLow, quote.visitHigh)} this job`
}

function businessName(settings: Settings): string {
  return settings.businessName.trim() || DEFAULT_SETTINGS.businessName
}

function ownerName(settings: Settings): string {
  return settings.owner.trim() || DEFAULT_SETTINGS.owner
}

export function writeDraft(input: LeadInput, quote: Quote, settings: Settings): string {
  const first = input.name.trim().split(/\s+/)[0] || 'there'
  const place = placeLabel(input.place)
  const spot = input.street.trim()
    ? `a ${yardPhrase(input.yard)} on ${input.street.trim()} in ${place}`
    : `a ${yardPhrase(input.yard)} in ${place}`
  const company = businessName(settings).replace(/[.\s]+$/, '')
  const who = `Hey ${first}, this is ${ownerName(settings)} with ${company}.`

  let price: string
  if (quote.empty) {
    price = 'Tell me what you need done and I’ll price it.'
  } else if (quote.needsVisit || quote.visitLow == null || quote.visitHigh == null) {
    price = `${spot[0].toUpperCase()}${spot.slice(1)} is outside the towns I already price, so I’ll ride by before I give a number.`
  } else if (quote.recurringLow != null && quote.onceLow > 0) {
    price = `First visit for ${spot} is about ${range(quote.visitLow, quote.visitHigh)}. After that, ${range(quote.recurringLow, quote.recurringHigh ?? quote.recurringLow)} each time I come.`
  } else if (quote.recurringLow != null) {
    const how = input.frequency === 'weekly' ? 'each week' : input.frequency === 'biweekly' ? 'every two weeks' : 'for the one-time cut'
    price = `${spot[0].toUpperCase()}${spot.slice(1)} comes out to about ${range(quote.visitLow, quote.visitHigh)} ${how}.`
  } else {
    price = `${spot[0].toUpperCase()}${spot.slice(1)} comes out to about ${range(quote.visitLow, quote.visitHigh)} for this job.`
  }

  const dog = input.dog ? ' I’ll need the dog put up before I come through.' : ''
  const note = input.note.trim() ? ' I got your note.' : ''
  const phone = settings.phone.trim() ? ` Text me at ${settings.phone.trim()}.` : ''
  return `${who} ${price}${dog}${note}${phone}`.replace(/\s+/g, ' ').trim()
}

export function buildLead(
  input: LeadInput,
  settings: Settings,
  rates: Rates,
  options: { now?: Date; id?: string; source?: Source } = {},
): Lead {
  const now = options.now ?? new Date()
  const quote = quoteJob(input, rates)
  const upsell = upsellFor(input.services, input.yard, input.frequency, now)
  const follow = nextMorning(now)
  const draft = writeDraft(input, quote, settings)
  const events = [
    quote.needsVisit
      ? 'Flagged for a drive-by. This address is outside the starter towns.'
      : quote.empty
        ? 'Waiting on a service before it can price.'
        : 'Priced from the rate card.',
    `Wrote a ${draft.length}-character text.`,
    `Follow-up set for ${morningLabel(follow)}.`,
  ]
  if (upsell) events.push('Added a seasonal cue.')
  if (input.dog) events.push('Noted the dog, and the text asks them to put it up.')

  return {
    id: options.id ?? crypto.randomUUID(),
    createdAt: now.toISOString(),
    followUpAt: follow.toISOString(),
    status: 'new',
    source: options.source ?? 'request',
    input,
    quote,
    draft,
    draftEdited: false,
    upsell: upsell?.text ?? null,
    events,
  }
}

export function quoteFollow(quote: Quote): string | null {
  if (quote.recurringLow == null || quote.onceLow <= 0 || quote.recurringHigh == null) return null
  return `Then ${range(quote.recurringLow, quote.recurringHigh)} each visit.`
}

export function isDue(lead: Lead, now = new Date()): boolean {
  if (lead.status !== 'new' && lead.status !== 'quoted') return false
  return new Date(lead.followUpAt).getTime() <= now.getTime()
}

export function isFresh(lead: Lead, now = new Date()): boolean {
  if (lead.status !== 'new' && lead.status !== 'quoted') return false
  if (isDue(lead, now)) return false
  const age = now.getTime() - new Date(lead.createdAt).getTime()
  return age >= 0 && age <= 18 * 60 * 60 * 1000
}

export function sortLeads(leads: Lead[], now = new Date()): Lead[] {
  const rank = (lead: Lead) => {
    if (isDue(lead, now)) return 0
    if (isFresh(lead, now)) return 1
    if (lead.status === 'lost') return 3
    return 2
  }
  return leads.slice().sort((left, right) => rank(left) - rank(right) || right.createdAt.localeCompare(left.createdAt))
}

export function stopFromLead(lead: Lead, weekday: number, id: string = crypto.randomUUID()): Stop {
  const street = lead.input.street.trim()
  return {
    id,
    leadId: lead.id,
    weekday,
    title: street ? `${lead.input.name} · ${street}` : lead.input.name,
    detail: `${placeLabel(lead.input.place)} · ${quoteHeadline(lead.quote, lead.input.frequency)}${lead.input.dog ? ' · dog' : ''}`,
  }
}

export function sampleDesk(settings: Settings, rates: Rates, now = new Date()): { leads: Lead[]; stops: Stop[] } {
  const yesterday = new Date(now)
  yesterday.setDate(now.getDate() - 1)
  yesterday.setHours(9, 15, 0, 0)
  const due = new Date(now)
  due.setHours(now.getHours() - 1)

  const alex = buildLead(
    {
      name: 'Alex',
      phone: '(229) 555-0148',
      place: 'blakely',
      street: 'River Street',
      yard: 'town',
      services: ['mow'],
      bales: SUGGESTED_BALES.town,
      frequency: 'weekly',
      dog: false,
      note: '',
    },
    settings,
    rates,
    { now: yesterday, id: 'sample-alex', source: 'sample' },
  )
  alex.followUpAt = due.toISOString()
  alex.events = alex.events.map((event) =>
    event.startsWith('Follow-up') ? 'Follow-up was set for this morning.' : event,
  )

  const booked = new Date(now)
  booked.setDate(now.getDate() - 5)
  const jordan = buildLead(
    {
      name: 'Jordan',
      phone: '(229) 555-0174',
      place: 'arlington',
      street: 'Church Street',
      yard: 'town',
      services: ['mow'],
      bales: SUGGESTED_BALES.town,
      frequency: 'weekly',
      dog: false,
      note: '',
    },
    settings,
    rates,
    { now: booked, id: 'sample-jordan', source: 'sample' },
  )
  jordan.status = 'won'
  const weekday = weekdayIndex(now) ?? 0
  jordan.events = [...jordan.events, `Placed on the ${WEEKDAYS[weekday]} route.`]

  return {
    leads: [alex, jordan],
    stops: [stopFromLead(jordan, weekday, 'sample-jordan-stop')],
  }
}
