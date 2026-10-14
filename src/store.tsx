import { createContext, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import {
  DEFAULT_RATES,
  DEFAULT_SETTINGS,
  FAR_PLACES,
  NEAR_PLACES,
  WEEKDAYS,
  buildLead,
  laterMorning,
  lightestWeekday,
  morningLabel,
  sampleDesk,
  scaleAddon,
  stopFromLead,
  writeDraft,
  type Lead,
  type LeadInput,
  type Pair,
  type Rates,
  type Settings,
  type Stop,
  type YardId,
} from './model'

const KEYS = {
  settings: 'blakely-yard-settings-v1',
  rates: 'blakely-yard-rates-v1',
  leads: 'blakely-yard-leads-v1',
  stops: 'blakely-yard-stops-v1',
}

type StoreValue = {
  settings: Settings
  rates: Rates
  leads: Lead[]
  stops: Stop[]
  setSettings: (patch: Partial<Settings>) => void
  setMowRate: (yard: YardId, index: 0 | 1, value: number) => void
  setBaleRate: (index: 0 | 1, value: number) => void
  setAddon: (key: 'leaves' | 'trim' | 'beds', index: 0 | 1, value: number) => void
  setTrip: (group: 'near' | 'far', index: 0 | 1, value: number) => void
  resetRates: () => void
  addRequest: (input: LeadInput) => Lead
  updateDraft: (id: string, draft: string) => void
  markQuoted: (id: string) => void
  markWon: (id: string) => void
  markLost: (id: string) => void
  resetDesk: () => void
}

const StoreContext = createContext<StoreValue | null>(null)

function loadJson<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(key)
    if (!raw) return null
    return JSON.parse(raw) as T
  } catch {
    return null
  }
}

function copyRates(rates: Rates): Rates {
  return JSON.parse(JSON.stringify(rates)) as Rates
}

function withIndex(pair: Pair, index: 0 | 1, value: number): Pair {
  const next: Pair = [pair[0], pair[1]]
  next[index] = Math.max(0, Math.round(value))
  return next
}

function starterDesk() {
  return sampleDesk(DEFAULT_SETTINGS, DEFAULT_RATES)
}

export function StoreProvider({ children }: { children: ReactNode }) {
  const [settings, setSettingsState] = useState<Settings>(() => loadJson<Settings>(KEYS.settings) ?? DEFAULT_SETTINGS)
  const [rates, setRates] = useState<Rates>(() => loadJson<Rates>(KEYS.rates) ?? copyRates(DEFAULT_RATES))
  const [leads, setLeads] = useState<Lead[]>(() => loadJson<Lead[]>(KEYS.leads) ?? starterDesk().leads)
  const [stops, setStops] = useState<Stop[]>(() => loadJson<Stop[]>(KEYS.stops) ?? starterDesk().stops)
  const stopsRef = useRef(stops)
  const leadsRef = useRef(leads)
  const placing = useRef(new Set<string>())
  stopsRef.current = stops
  leadsRef.current = leads

  useEffect(() => {
    localStorage.setItem(KEYS.settings, JSON.stringify(settings))
  }, [settings])

  useEffect(() => {
    localStorage.setItem(KEYS.rates, JSON.stringify(rates))
  }, [rates])

  useEffect(() => {
    localStorage.setItem(KEYS.leads, JSON.stringify(leads))
  }, [leads])

  useEffect(() => {
    localStorage.setItem(KEYS.stops, JSON.stringify(stops))
  }, [stops])

  useEffect(() => {
    setLeads((current) => {
      let changed = false
      const next = current.map((lead) => {
        if (lead.draftEdited) return lead
        const draft = writeDraft(lead.input, lead.quote, settings)
        if (draft === lead.draft) return lead
        changed = true
        return { ...lead, draft }
      })
      return changed ? next : current
    })
  }, [settings])

  const value = useMemo<StoreValue>(() => {
    const setSettings = (patch: Partial<Settings>) => {
      setSettingsState((current) => ({ ...current, ...patch }))
    }

    const setMowRate = (yard: YardId, index: 0 | 1, value: number) => {
      setRates((current) => ({
        ...current,
        mow: { ...current.mow, [yard]: withIndex(current.mow[yard], index, value) },
      }))
    }

    const setBaleRate = (index: 0 | 1, value: number) => {
      setRates((current) => ({ ...current, strawBale: withIndex(current.strawBale, index, value) }))
    }

    const setAddon = (key: 'leaves' | 'trim' | 'beds', index: 0 | 1, value: number) => {
      setRates((current) => {
        const town = withIndex(current[key].town, index, value)
        return { ...current, [key]: scaleAddon(DEFAULT_RATES[key], town[0], town[1]) }
      })
    }

    const setTrip = (group: 'near' | 'far', index: 0 | 1, value: number) => {
      const ids = group === 'near' ? NEAR_PLACES : FAR_PLACES
      setRates((current) => {
        const travel = { ...current.travel }
        for (const id of ids) travel[id] = withIndex(current.travel[id], index, value)
        return { ...current, travel }
      })
    }

    const addRequest = (input: LeadInput) => {
      const lead = buildLead(input, settings, rates, { source: 'request' })
      setLeads((current) => [lead, ...current])
      return lead
    }

    const updateDraft = (id: string, draft: string) => {
      setLeads((current) =>
        current.map((lead) => (lead.id === id ? { ...lead, draft, draftEdited: true } : lead)),
      )
    }

    const markQuoted = (id: string) => {
      const follow = laterMorning(new Date(), 2)
      setLeads((current) =>
        current.map((lead) => {
          if (lead.id !== id || lead.status !== 'new') return lead
          return {
            ...lead,
            status: 'quoted',
            followUpAt: follow.toISOString(),
            events: [...lead.events, `Text copied. If they go quiet, this comes back ${morningLabel(follow)}.`],
          }
        }),
      )
    }

    const markWon = (id: string) => {
      if (placing.current.has(id)) return
      const lead = leadsRef.current.find((item) => item.id === id)
      if (!lead || lead.status === 'won') return
      placing.current.add(id)
      const weekday = lightestWeekday(stopsRef.current)
      setStops((current) =>
        current.some((stop) => stop.leadId === id) ? current : [...current, stopFromLead(lead, weekday)],
      )
      setLeads((current) =>
        current.map((item) =>
          item.id === id && item.status !== 'won'
            ? { ...item, status: 'won', events: [...item.events, `Placed on the ${WEEKDAYS[weekday]} route.`] }
            : item,
        ),
      )
    }

    const markLost = (id: string) => {
      setLeads((current) => current.map((lead) => (lead.id === id ? { ...lead, status: 'lost' } : lead)))
      setStops((current) => current.filter((stop) => stop.leadId !== id))
    }

    const resetDesk = () => {
      placing.current.clear()
      const fresh = sampleDesk(settings, rates, new Date())
      setLeads(fresh.leads)
      setStops(fresh.stops)
    }

    return {
      settings,
      rates,
      leads,
      stops,
      setSettings,
      setMowRate,
      setBaleRate,
      setAddon,
      setTrip,
      resetRates: () => setRates(copyRates(DEFAULT_RATES)),
      addRequest,
      updateDraft,
      markQuoted,
      markWon,
      markLost,
      resetDesk,
    }
  }, [settings, rates, leads, stops])

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>
}

export function useStore(): StoreValue {
  const value = useContext(StoreContext)
  if (!value) throw new Error('Store missing')
  return value
}
