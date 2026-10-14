import { useMemo, useState, type FormEvent } from 'react'
import {
  FREQUENCIES,
  PLACES,
  SERVICES,
  SUGGESTED_BALES,
  YARDS,
  customerSeason,
  quoteFollow,
  quoteHeadline,
  quoteJob,
  range,
  upsellFor,
  type Frequency,
  type Lead,
  type PlaceId,
  type ServiceId,
  type YardId,
} from './model'
import { useStore } from './store'

function ChoiceGroup<T extends string>({
  label,
  name,
  value,
  options,
  onChange,
}: {
  label: string
  name: string
  value: T
  options: Array<{ id: T; label: string }>
  onChange: (value: T) => void
}) {
  return (
    <div className="choices" role="radiogroup" aria-label={label}>
      {options.map((option) => (
        <label key={option.id} className={value === option.id ? 'choice on' : 'choice'}>
          <input type="radio" name={name} value={option.id} checked={value === option.id} onChange={() => onChange(option.id)} />
          {option.label}
        </label>
      ))}
    </div>
  )
}

export function CustomerSite({ onOpenDesk }: { onOpenDesk: (id: string) => void }) {
  const { rates, settings, addRequest } = useStore()
  const [place, setPlace] = useState<PlaceId>('blakely')
  const [yard, setYard] = useState<YardId>('town')
  const [services, setServices] = useState<ServiceId[]>(['mow'])
  const [bales, setBales] = useState(SUGGESTED_BALES.town)
  const [balesTouched, setBalesTouched] = useState(false)
  const [frequency, setFrequency] = useState<Frequency>('weekly')
  const [dog, setDog] = useState(false)
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [street, setStreet] = useState('')
  const [note, setNote] = useState('')
  const [error, setError] = useState('')
  const [confirmation, setConfirmation] = useState<Lead | null>(null)

  const quote = useMemo(
    () => quoteJob({ name, phone, place, street, yard, services, bales, frequency, dog, note }, rates),
    [name, phone, place, street, yard, services, bales, frequency, dog, note, rates],
  )
  const cue = upsellFor(services, yard, frequency)

  const selectYard = (next: YardId) => {
    setYard(next)
    if (!balesTouched) setBales(SUGGESTED_BALES[next])
  }

  const toggleService = (id: ServiceId) => {
    const turningOn = !services.includes(id)
    setServices((current) => (current.includes(id) ? current.filter((item) => item !== id) : [...current, id]))
    if (id === 'straw' && turningOn && !balesTouched) setBales(SUGGESTED_BALES[yard])
  }

  const submit = (event: FormEvent) => {
    event.preventDefault()
    if (!name.trim() || !phone.trim()) {
      setError('Name and a phone number, so the text has somewhere to go.')
      return
    }
    if (quote.empty) {
      setError('Pick at least one service.')
      return
    }
    const lead = addRequest({
      name: name.trim(),
      phone: phone.trim(),
      place,
      street: street.trim(),
      yard,
      services,
      bales,
      frequency,
      dog,
      note: note.trim(),
    })
    setError('')
    setConfirmation(lead)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <main>
      <section className="hero">
        <div>
          <h1>
            Your yard,
            <br />
            same day
            <br />
            each week.
          </h1>
          <p className="lede">{customerSeason()}</p>
          <p className="promise">You get a range before anyone drives out. A weekly stop stays on the same weekday.</p>
          <ul className="points">
            <li>Mow, edge, and blow the hard surfaces.</li>
            <li>Pine straw by the bale, spread in the beds.</li>
            <li>Leaves hauled off. Beds pulled by hand. No spray.</li>
          </ul>
          <p className="towns">
            Blakely, Arlington, Damascus, Jakin, and Bluffton, plus Colquitt, Cuthbert, and Fort Gaines.
          </p>
        </div>
        <form className="ticket" onSubmit={submit}>
          {confirmation ? (
            <div className="confirm">
              <p className="eyebrow">On the desk</p>
              <h2>The request is in.</h2>
              <p className="price">{quoteHeadline(confirmation.quote, confirmation.input.frequency)}</p>
              <p>A text is written, the follow-up is on tomorrow morning’s list, and the price came from the rate card.</p>
              <ul className="events">
                {confirmation.events.map((event) => (
                  <li key={event}>{event}</li>
                ))}
              </ul>
              <div className="actions">
                <button type="button" className="btn primary" onClick={() => onOpenDesk(confirmation.id)}>
                  Open Jon’s desk
                </button>
                <button type="button" className="btn ghost" onClick={() => setConfirmation(null)}>
                  Price another yard
                </button>
              </div>
            </div>
          ) : (
            <>
              <p className="eyebrow">Instant range</p>
              <h2>What needs doing?</h2>
              <div className="estimate" aria-live="polite">
                <p className="price">{quoteHeadline(quote, frequency)}</p>
                {quoteFollow(quote) && <p className="price-note">{quoteFollow(quote)}</p>}
                {quote.lines.length > 0 && (
                  <ul className="lines">
                    {quote.lines.map((line) => (
                      <li key={line.label}>
                        <span>{line.label}</span>
                        <span>{range(line.low, line.high)}</span>
                      </li>
                    ))}
                  </ul>
                )}
                {quote.needsVisit && (
                  <p className="price-note">Outside the starter towns. This one needs a drive-by before a number.</p>
                )}
                {cue &&
                  (cue.service ? (
                    <button type="button" className="upsell" onClick={() => toggleService(cue.service as ServiceId)}>
                      {cue.text}
                      <span>Add it to the range</span>
                    </button>
                  ) : (
                    <p className="upsell">{cue.text}</p>
                  ))}
                <p className="fine">Starter rates for Early County. Change them on the desk before this is a real quote.</p>
              </div>
              <label className="field">
                Town
                <select value={place} onChange={(event) => setPlace(event.target.value as PlaceId)}>
                  {PLACES.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.label}
                    </option>
                  ))}
                </select>
              </label>
              <div className="field">
                <span>Yard</span>
                <ChoiceGroup label="Yard size" name="yard" value={yard} options={YARDS} onChange={selectYard} />
              </div>
              <fieldset className="checks">
                <legend>Services</legend>
                {SERVICES.map((service) => (
                  <label key={service.id} className="check">
                    <input
                      type="checkbox"
                      checked={services.includes(service.id)}
                      onChange={() => toggleService(service.id)}
                    />
                    <span>
                      <strong>{service.label}</strong>
                      <small>{service.detail}</small>
                    </span>
                  </label>
                ))}
                {services.includes('straw') && (
                  <div className="stepper">
                    <button
                      type="button"
                      onClick={() => {
                        setBalesTouched(true)
                        setBales((count) => Math.max(1, count - 1))
                      }}
                      aria-label="Fewer bales"
                    >
                      −
                    </button>
                    <span>{bales} bales</span>
                    <button
                      type="button"
                      onClick={() => {
                        setBalesTouched(true)
                        setBales((count) => count + 1)
                      }}
                      aria-label="More bales"
                    >
                      +
                    </button>
                  </div>
                )}
              </fieldset>
              <div className="field">
                <span>How often</span>
                <ChoiceGroup
                  label="Frequency"
                  name="frequency"
                  value={frequency}
                  options={FREQUENCIES}
                  onChange={setFrequency}
                />
              </div>
              <label className="check dog">
                <input type="checkbox" checked={dog} onChange={(event) => setDog(event.target.checked)} />
                <span>
                  <strong>Dog in the yard</strong>
                  <small>The text will ask them to put the dog up.</small>
                </span>
              </label>
              <label className="field">
                Name
                <input value={name} autoComplete="name" onChange={(event) => setName(event.target.value)} />
              </label>
              <label className="field">
                Phone
                <input value={phone} autoComplete="tel" inputMode="tel" onChange={(event) => setPhone(event.target.value)} />
              </label>
              <label className="field">
                Street, if you have it
                <input value={street} autoComplete="street-address" onChange={(event) => setStreet(event.target.value)} />
              </label>
              <label className="field">
                Anything else
                <textarea value={note} rows={2} onChange={(event) => setNote(event.target.value)} />
              </label>
              {error && <p className="form-error">{error}</p>}
              <button type="submit" className="btn primary">
                Send this to the desk
              </button>
            </>
          )}
        </form>
      </section>
      <section className="offer">
        <h2>What a route actually covers</h2>
        <div className="service-grid">
          {SERVICES.map((service) => (
            <article key={service.id} className="service-card">
              <h3>{service.label}</h3>
              <p>{service.detail}</p>
            </article>
          ))}
        </div>
      </section>
      <footer className="footer">
        <p>
          Working concept for Jon’s landscaping business in Blakely. {settings.businessName.trim() || 'Blakely Yard Co.'}{' '}
          is a stand-in name until he sets his own. The desk link is only on this demo.
        </p>
      </footer>
    </main>
  )
}
