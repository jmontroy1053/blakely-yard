import { useEffect, useState } from 'react'
import {
  WEEKDAYS,
  YARDS,
  isDue,
  isFresh,
  morningLabel,
  placeLabel,
  quoteFollow,
  quoteHeadline,
  range,
  seasonBrief,
  sortLeads,
  weekdayIndex,
  type Lead,
} from './model'
import { useStore } from './store'

function MoneyInput({
  label,
  value,
  onChange,
}: {
  label: string
  value: number
  onChange: (value: number) => void
}) {
  return (
    <input
      className="money"
      type="number"
      min={0}
      step={1}
      aria-label={label}
      value={value}
      onChange={(event) => {
        if (Number.isNaN(event.target.valueAsNumber)) return
        onChange(event.target.valueAsNumber)
      }}
    />
  )
}

function statusLabel(lead: Lead, now: Date): string {
  if (isDue(lead, now)) return 'Due now'
  if (lead.status === 'new') return 'Needs a text'
  if (lead.status === 'quoted') return 'Text sent'
  if (lead.status === 'won') return 'On the route'
  return 'Passed'
}

export function Desk({ highlight }: { highlight: string | null }) {
  const {
    settings,
    rates,
    leads,
    stops,
    setSettings,
    setMowRate,
    setBaleRate,
    setAddon,
    setTrip,
    resetRates,
    updateDraft,
    markQuoted,
    markWon,
    markLost,
    resetDesk,
  } = useStore()
  const [copied, setCopied] = useState<string | null>(null)
  const now = new Date()
  const ordered = sortLeads(leads, now)
  const due = leads.filter((lead) => isDue(lead, now)).length
  const fresh = leads.filter((lead) => isFresh(lead, now)).length
  const today = weekdayIndex(now)
  const todayCount = today == null ? 0 : stops.filter((stop) => stop.weekday === today).length

  useEffect(() => {
    if (!highlight) return
    document.getElementById(`lead-${highlight}`)?.scrollIntoView({ block: 'center' })
  }, [highlight])

  const copyText = async (lead: Lead) => {
    try {
      await navigator.clipboard.writeText(lead.draft)
      setCopied(lead.id)
      markQuoted(lead.id)
      window.setTimeout(() => {
        setCopied((current) => (current === lead.id ? null : current))
      }, 1800)
    } catch {
      setCopied(`failed-${lead.id}`)
    }
  }

  return (
    <main className="desk">
      <section className="brief">
        <div>
          <p className="eyebrow light">Morning brief</p>
          <h1>{now.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</h1>
          <p>{seasonBrief(now)}</p>
        </div>
        <div className="stats">
          <p>
            <strong>{due}</strong>
            <span>Due for a text</span>
          </p>
          <p>
            <strong>{fresh}</strong>
            <span>Just in</span>
          </p>
          <p>
            <strong>{todayCount}</strong>
            <span>{today == null ? 'Weekend' : `On ${WEEKDAYS[today]}`}</span>
          </p>
        </div>
      </section>

      <section className="settings">
        <label>
          Business name
          <input
            value={settings.businessName}
            onChange={(event) => setSettings({ businessName: event.target.value })}
          />
        </label>
        <label>
          Your name
          <input value={settings.owner} onChange={(event) => setSettings({ owner: event.target.value })} />
        </label>
        <label>
          Cell on the site
          <input
            value={settings.phone}
            placeholder="Add your cell"
            onChange={(event) => setSettings({ phone: event.target.value })}
          />
        </label>
      </section>

      <div className="desk-grid">
        <section>
          <div className="section-head">
            <h2>Requests</h2>
            <button type="button" className="btn text" onClick={resetDesk}>
              Restore samples
            </button>
          </div>
          <div className="leads">
            {ordered.map((lead) => {
              const dueNow = isDue(lead, now)
              const classes = [
                'lead',
                highlight === lead.id ? 'is-highlight' : '',
                dueNow ? 'is-due' : '',
                lead.status === 'lost' ? 'is-lost' : '',
              ]
                .filter(Boolean)
                .join(' ')
              return (
                <article key={lead.id} id={`lead-${lead.id}`} className={classes}>
                  <div className="lead-top">
                    <div>
                      <h3>
                        {lead.input.name}
                        {lead.source === 'sample' && <span className="chip">Sample</span>}
                      </h3>
                      <p className="meta">
                        {placeLabel(lead.input.place)}
                        {lead.input.street.trim() ? ` · ${lead.input.street.trim()}` : ''}
                        {' · '}
                        {lead.input.phone}
                      </p>
                    </div>
                    <div className="lead-price">
                      <strong>{quoteHeadline(lead.quote, lead.input.frequency)}</strong>
                      {quoteFollow(lead.quote) && <span>{quoteFollow(lead.quote)}</span>}
                      <em className={dueNow ? 'pill due' : 'pill'}>{statusLabel(lead, now)}</em>
                    </div>
                  </div>
                  {lead.quote.lines.length > 0 && (
                    <ul className="lines">
                      {lead.quote.lines.map((line) => (
                        <li key={line.label}>
                          <span>{line.label}</span>
                          <span>{range(line.low, line.high)}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                  {lead.upsell && <p className="upsell">{lead.upsell}</p>}
                  <label className="draft-label">
                    Text ready to send
                    <textarea
                      className="draft"
                      rows={4}
                      value={lead.draft}
                      onChange={(event) => updateDraft(lead.id, event.target.value)}
                    />
                  </label>
                  <p className="fine">{lead.draft.length} characters</p>
                  <ul className="events">
                    {lead.events.map((event, index) => (
                      <li key={`${lead.id}-${index}`}>{event}</li>
                    ))}
                  </ul>
                  <div className="actions">
                    <button type="button" className="btn primary" onClick={() => void copyText(lead)}>
                      {copied === lead.id ? 'Copied' : copied === `failed-${lead.id}` ? 'Select the text' : 'Copy text'}
                    </button>
                    {lead.status !== 'won' && lead.status !== 'lost' && (
                      <button type="button" className="btn ghost" onClick={() => markWon(lead.id)}>
                        Put on the route
                      </button>
                    )}
                    {lead.status !== 'lost' && (
                      <button type="button" className="btn text" onClick={() => markLost(lead.id)}>
                        Not a fit
                      </button>
                    )}
                  </div>
                  {lead.status === 'quoted' && (
                    <p className="fine">Follow-up {morningLabel(new Date(lead.followUpAt))} if they go quiet.</p>
                  )}
                </article>
              )
            })}
          </div>
        </section>
        <section>
          <div className="section-head">
            <h2>Route</h2>
            <p className="fine">{today == null ? 'No route on the weekend. Monday is next.' : `Today is ${WEEKDAYS[today]}.`}</p>
          </div>
          <div className="week">
            {WEEKDAYS.map((day, index) => {
              const dayStops = stops.filter((stop) => stop.weekday === index)
              return (
                <section key={day} className={index === today ? 'day is-today' : 'day'}>
                  <h3>{day}</h3>
                  <div className="day-body">
                    {dayStops.map((stop) => (
                      <article key={stop.id} className="stop">
                        <strong>{stop.title}</strong>
                        <p>{stop.detail}</p>
                      </article>
                    ))}
                    {dayStops.length === 0 && <p className="open">Open</p>}
                  </div>
                </section>
              )
            })}
          </div>
        </section>
      </div>
      <section className="roadmap">
        <h2>Where a model helps, and where it should not</h2>
        <p>
          The price, the follow-up, and the route are rules. Keep them rules. A model earns its place on the wording:
          rewriting texts in your voice, turning a rambling voicemail into a job, answering a review.
        </p>
        <ul>
          <li>Missed call texts back with a link to this estimate.</li>
          <li>Rain day texts the route and slides jobs to the next open morning.</li>
          <li>Friday turns finished stops into invoices.</li>
          <li>After the third mow, ask for a Google review.</li>
          <li>Before-and-after photos stay on the stop.</li>
        </ul>
        <p className="fine">Spraying weeds is a Georgia pesticide license, not a side task. Beds stay hand-pulled until that exists.</p>
      </section>

      <details className="rates">
        <summary>Starter rates — put your numbers in before a real quote</summary>
        <p className="fine">
          These are Early County guesses. A request already on the desk keeps the price it was given. New requests use
          what you type here.
        </p>
        <h3>Mowing and edging</h3>
        <div className="rate-table">
          <div className="rate-head">
            <span>Yard</span>
            <span>Low</span>
            <span>High</span>
          </div>
          {YARDS.map((yard) => (
            <div className="rate-row" key={yard.id}>
              <span>{yard.label}</span>
              <MoneyInput
                label={`${yard.label} mow low`}
                value={rates.mow[yard.id][0]}
                onChange={(value) => setMowRate(yard.id, 0, value)}
              />
              <MoneyInput
                label={`${yard.label} mow high`}
                value={rates.mow[yard.id][1]}
                onChange={(value) => setMowRate(yard.id, 1, value)}
              />
            </div>
          ))}
        </div>
        <h3>Pine straw, per bale installed</h3>
        <div className="rate-row compact">
          <MoneyInput label="Bale low" value={rates.strawBale[0]} onChange={(value) => setBaleRate(0, value)} />
          <MoneyInput label="Bale high" value={rates.strawBale[1]} onChange={(value) => setBaleRate(1, value)} />
        </div>
        <h3>One-time work on a town lot</h3>
        <p className="fine">Smaller and larger yards keep the same proportions as these.</p>
        {(
          [
            ['leaves', 'Leaf cleanup'],
            ['trim', 'Shrub trimming'],
            ['beds', 'Bed cleanup'],
          ] as const
        ).map(([key, label]) => (
          <div className="rate-row" key={key}>
            <span>{label}</span>
            <MoneyInput
              label={`${label} low`}
              value={rates[key].town[0]}
              onChange={(value) => setAddon(key, 0, value)}
            />
            <MoneyInput
              label={`${label} high`}
              value={rates[key].town[1]}
              onChange={(value) => setAddon(key, 1, value)}
            />
          </div>
        ))}
        <h3>Drive fee, added every visit</h3>
        <div className="rate-row">
          <span>Arlington, Damascus, Jakin, Bluffton</span>
          <MoneyInput
            label="Near town low"
            value={rates.travel.arlington[0]}
            onChange={(value) => setTrip('near', 0, value)}
          />
          <MoneyInput
            label="Near town high"
            value={rates.travel.arlington[1]}
            onChange={(value) => setTrip('near', 1, value)}
          />
        </div>
        <div className="rate-row">
          <span>Colquitt, Cuthbert, Fort Gaines</span>
          <MoneyInput
            label="Farther town low"
            value={rates.travel.colquitt[0]}
            onChange={(value) => setTrip('far', 0, value)}
          />
          <MoneyInput
            label="Farther town high"
            value={rates.travel.colquitt[1]}
            onChange={(value) => setTrip('far', 1, value)}
          />
        </div>
        <button type="button" className="btn ghost" onClick={resetRates}>
          Reset rates
        </button>
      </details>
    </main>
  )
}
