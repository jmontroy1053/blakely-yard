import { useState } from 'react'
import { CustomerSite } from './CustomerSite'
import { Desk } from './Desk'
import { useStore, StoreProvider } from './store'

type Mode = 'site' | 'desk'

function Mark() {
  return (
    <svg className="mark" viewBox="0 0 32 32" aria-hidden="true">
      <rect width="32" height="32" rx="7" />
      <path d="M7 22h18M7 16h18M7 10h12" />
    </svg>
  )
}

function Shell() {
  const { settings } = useStore()
  const [mode, setMode] = useState<Mode>('site')
  const [highlight, setHighlight] = useState<string | null>(null)
  const phone = settings.phone.trim()

  return (
    <div className="page">
      <header className="topbar">
        <div className="brand">
          <Mark />
          <div>
            <div className="brand-name">{settings.businessName.trim() || 'Blakely Yard Co.'}</div>
            <div className="brand-place">Blakely, Georgia</div>
          </div>
        </div>
        <div className="top-actions">
          {phone && (
            <a className="phone" href={`tel:${phone.replace(/[^\d+]/g, '')}`}>
              {phone}
            </a>
          )}
          <div className="mode" role="tablist" aria-label="View">
            <button type="button" role="tab" aria-selected={mode === 'site'} onClick={() => setMode('site')}>
              Customer site
            </button>
            <button type="button" role="tab" aria-selected={mode === 'desk'} onClick={() => setMode('desk')}>
              Jon’s desk
            </button>
          </div>
        </div>
      </header>
      {mode === 'site' ? (
        <CustomerSite
          onOpenDesk={(id) => {
            setHighlight(id)
            setMode('desk')
          }}
        />
      ) : (
        <Desk highlight={highlight} />
      )}
    </div>
  )
}

export function App() {
  return (
    <StoreProvider>
      <Shell />
    </StoreProvider>
  )
}
