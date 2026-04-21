import { useState, useEffect, Component } from 'react'
import MapView from './MapView.jsx'

// Error boundary - catches React render errors and shows them instead of blank screen
class ErrorBoundary extends Component {
  constructor(props) { super(props); this.state = { error: null } }
  static getDerivedStateFromError(error) { return { error } }
  componentDidCatch(error, info) { console.error('React crash:', error, info) }
  render() {
    if (this.state.error) {
      return (
        <div style={{padding:'2rem',background:'#fee2e2',borderRadius:'1rem',margin:'2rem',color:'#991b1b'}}>
          <strong>Greška pri prikazu</strong>
          <pre style={{fontSize:'12px',marginTop:'8px',whiteSpace:'pre-wrap'}}>{this.state.error?.message}</pre>
          <button onClick={() => this.setState({ error: null })} style={{marginTop:'8px',padding:'4px 12px',background:'#ef4444',color:'white',border:'none',borderRadius:'6px',cursor:'pointer'}}>
            Pokušaj ponovo
          </button>
        </div>
      )
    }
    return this.props.children
  }
}

const today = new Date()
const iso = (d) => d.toISOString().slice(0, 10)
const plusDays = (date, n) => { const d = new Date(date); d.setDate(d.getDate() + n); return d }

function formatEUR(v) {
  if (v === null || v === undefined || v === '') return '—'
  if (typeof v === 'string') return v
  if (typeof v === 'number' && !Number.isFinite(v)) return '—'
  return new Intl.NumberFormat('bs-BA', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(v)
}

function travelerSummary(adults, children, ages) {
  const total = adults + children
  if (total === 0) return '—'
  if (children === 0) return `${adults} ${adults === 1 ? 'odrasla osoba' : 'odrasle osobe'}`
  const agesText = ages?.trim() ? `, uzrasti ${ages.trim()}` : ''
  return `${total} osoba: ${adults} odrasl${adults === 1 ? 'a' : 'e'} + ${children} djece${agesText}`
}

function parseErrorMessage(raw) {
  if (!raw) return 'Nepoznata greška.'
  try {
    const parsed = JSON.parse(raw)
    let msg = parsed.error || parsed.message || raw
    if (parsed.details?.length) msg += '\n\n' + parsed.details.map(d => '• ' + d).join('\n')
    if (parsed.hint) msg += '\n\n💡 ' + parsed.hint
    return msg
  } catch {
    return raw
  }
}

// Obrnuta geokodifikacija preko OpenStreetMap Nominatim (besplatno, bez ključa)
async function reverseGeocode(lat, lng) {
  try {
    const r = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=10&addressdetails=1`, {
      headers: { 'Accept-Language': 'bs,en' }
    })
    if (!r.ok) return null
    const data = await r.json()
    const a = data.address || {}
    // Pokušaj izgraditi "Grad, Država" ili "Grad, Regija, Država"
    const city = a.city || a.town || a.village || a.municipality || a.county
    const country = a.country
    if (city && country) return `${city}, ${country}`
    if (city) return city
    if (data.display_name) return data.display_name.split(',').slice(0, 2).join(',').trim()
    return null
  } catch {
    return null
  }
}

// Fetch public holidays from date.nager.at (free, no key)
async function fetchHolidays(destination, departDate, returnDate) {
  try {
    // Get country code from Nominatim
    const city = destination.split(',')[0].trim()
    const geo = await fetch('https://nominatim.openstreetmap.org/search?q=' +
      encodeURIComponent(city) + '&format=json&limit=1&addressdetails=1',
      { headers: { 'Accept-Language': 'en', 'User-Agent': 'PutniPlaner/1.0' } })
    const geoData = await geo.json()
    const countryCode = geoData?.[0]?.address?.country_code?.toUpperCase()
    if (!countryCode) return null

    const year = departDate.slice(0, 4)
    const resp = await fetch('https://date.nager.at/api/v3/PublicHolidays/' + year + '/' + countryCode)
    if (!resp.ok) return null
    const all = await resp.json()

    // Filter to trip dates
    const dep = new Date(departDate)
    const ret = new Date(returnDate || departDate)
    const inTrip = all.filter(h => {
      const d = new Date(h.date)
      return d >= dep && d <= ret
    })

    return { countryCode, all: inTrip, country: geoData?.[0]?.address?.country }
  } catch { return null }
}
// Izvuci samo naziv grada (prije zareza)
const cityOnly = (str) => str ? str.split(',')[0].trim() : ''
// Slug za URL (lowercase, razmaci -> crtice)
const citySlug = (str) => cityOnly(str).toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')

// Centralni generator linkova za sve vidove prevoza
function buildLinks(form) {
  const from     = cityOnly(form.origin)
  const to       = cityOnly(form.destination)
  const fromFull = form.origin || from
  const toFull   = form.destination || to
  const fromSlug = citySlug(form.origin)
  const toSlug   = citySlug(form.destination)
  const dep      = form.departDate
  const ret      = form.returnDate
  const adults   = form.adults || 2
  const children = form.children || 0

  return {
    // === LETOVI ===
    googleFlights: `https://www.google.com/travel/flights?q=${encodeURIComponent(`flights from ${from} to ${to} on ${dep} returning ${ret} ${adults} adults${children ? ' ' + children + ' children' : ''}`)}`,

    kiwi: `https://www.kiwi.com/en/search/results/${encodeURIComponent(fromSlug)}/${encodeURIComponent(toSlug)}/${dep}/${ret}?adults=${adults}&children=${children}&infants=0&cabinClass=economy`,

    kayak: `https://www.kayak.com/flights/${encodeURIComponent(from)}-${encodeURIComponent(to)}/${dep}/${ret}/${adults}adults${children ? '/' + children + 'children' : ''}`,

    momondo: `https://www.momondo.com/flight-search/${encodeURIComponent(from)}/${encodeURIComponent(to)}/${dep}/${ret}/?adults=${adults}&children=${children}`,

    ryanair: `https://www.ryanair.com/en/cheap-flights/from/${fromSlug}/to/${toSlug}/?departureMonth=${dep.slice(0, 7)}&adults=${adults}&teens=0&children=${children}&infants=0`,

    wizzair: `https://wizzair.com/en-gb/flights/search#/search?departureStation=${encodeURIComponent(from)}&arrivalStation=${encodeURIComponent(to)}&departureDate=${dep}&returnDate=${ret}&isReturn=true&adult=${adults}&child=${children}&infant=0`,

    // === AUTO ===
    googleMaps: `https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(fromFull)}&destination=${encodeURIComponent(toFull)}&travelmode=driving`,

    googleMapsNamed: `https://www.google.com/maps/dir/${encodeURIComponent(fromFull)}/${encodeURIComponent(toFull)}`,

    waze: `https://www.waze.com/live-map/directions?from=${encodeURIComponent(fromFull)}&to=${encodeURIComponent(toFull)}`,

    // === AUTOBUS ===
    flixbus: `https://www.flixbus.com/bus-tickets/${fromSlug}-${toSlug}`,

    omio_bus: `https://www.omio.com/results?origin=${encodeURIComponent(from)}&destination=${encodeURIComponent(to)}&outboundDate=${dep}&returnDate=${ret}&passengers=${adults + children}&transportModes=bus`,

    rome2rio: `https://www.rome2rio.com/s/${encodeURIComponent(from)}/${encodeURIComponent(to)}`,

    busbud: `https://www.busbud.com/en/bus/${fromSlug}/${toSlug}`,

    // === VOZ ===
    omio_train: `https://www.omio.com/results?origin=${encodeURIComponent(from)}&destination=${encodeURIComponent(to)}&outboundDate=${dep}&returnDate=${ret}&passengers=${adults + children}&transportModes=train`,

    trainline: `https://www.thetrainline.com/book/results?origin=${encodeURIComponent(from)}&destination=${encodeURIComponent(to)}&outwardDate=${dep}T00%3A00%3A00&returnDate=${ret}T00%3A00%3A00&adults=${adults}&children=${children}`,

    raileurope: `https://www.raileurope.com/en/search?origin=${encodeURIComponent(from)}&destination=${encodeURIComponent(to)}&outwardDate=${dep}&returnDate=${ret}&adults=${adults}&children=${children}`,
  }
}

const URLS = {
  googleFlights: (f) => buildLinks(f).googleFlights,
  booking: (f) => `https://www.booking.com/searchresults.html?${new URLSearchParams({
    ss: f.destination, checkin: f.departDate, checkout: f.returnDate,
    group_adults: String(f.adults), group_children: String(f.children),
    no_rooms: String(Math.max(1, Math.ceil((f.adults + f.children) / 2))),
  })}`,
  airbnb: (f) => `https://www.airbnb.com/s/${encodeURIComponent(f.destination)}/homes?${new URLSearchParams({
    checkin: f.departDate, checkout: f.returnDate,
    adults: String(f.adults), children: String(f.children),
  })}`,
  googleMaps: (f) => buildLinks(f).googleMaps,
  placeSearch: (name, destination, lat, lng) => {
    if (lat && lng && lat !== 0 && lng !== 0) {
      return `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`
    }
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(name + ', ' + destination)}`
  },
  momondo: (f) => buildLinks(f).momondo,
  chainOfficial: {
    "McDonald's": 'https://www.mcdonalds.com/',
    'KFC': 'https://global.kfc.com/',
    'Burger King': 'https://www.burgerking.com/',
    'Subway': 'https://www.subway.com/',
    'Starbucks': 'https://www.starbucks.com/',
    'Pizza Hut': 'https://www.pizzahut.com/',
    "Domino's": 'https://www.dominos.com/',
    'Taco Bell': 'https://www.tacobell.com/',
  },
}

export default function App() {
  const [form, setForm] = useState({
    origin: '',
    destination: '',
    departDate: iso(plusDays(today, 14)),
    returnDate: iso(plusDays(today, 21)),
    adults: 2,
    children: 2,
    childrenAges: '13, 16',
    transport: 'plane',
  })
  const [loading, setLoading] = useState(false)
  const [loadingStep, setLoadingStep] = useState(0)
  const [error, setError] = useState(null)
  const [plan, setPlan] = useState(null)
  const [planForm, setPlanForm] = useState(null)
  const [showAbout, setShowAbout] = useState(false)
  const [theme, setTheme] = useState(() => {
    try { return localStorage.getItem('pp_theme') || 'dark' } catch { return 'dark' }
  })

  // Geolokacija state
  const [geoStatus, setGeoStatus] = useState('idle') // 'idle' | 'loading' | 'granted' | 'denied' | 'error'
  const [geoOffered, setGeoOffered] = useState(false) // da li smo već pitali

  // Primijeni temu na body
  useEffect(() => {
    document.body.classList.toggle('light', theme === 'light')
    try { localStorage.setItem('pp_theme', theme) } catch {}
  }, [theme])

  const toggleTheme = () => setTheme(t => t === 'dark' ? 'light' : 'dark')

  const totalPeople = form.adults + form.children

  const [exploreLoading, setExploreLoading] = useState(false)
  const [exploreSuggestions, setExploreSuggestions] = useState(null)
  const [exploreError, setExploreError] = useState(null)
  const [groqLimits, setGroqLimits] = useState(null)

  const handleExplore = async () => {
    if (!form.origin.trim()) { setExploreError('Unesi polazak da bismo znali odakle kreces.'); return }
    if (!form.departDate) { setExploreError('Izaberi datum polaska.'); return }
    setExploreError(null)
    setExploreLoading(true)
    setExploreSuggestions(null)
    try {
      const response = await fetch('/api/explore', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          origin: form.origin,
          departDate: form.departDate,
          returnDate: form.returnDate,
          adults: form.adults,
          children: form.children,
        }),
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || 'HTTP ' + response.status)
      if (data.error) throw new Error(data.error)
      if (!data.suggestions?.length) throw new Error('Backend vratio prazan niz. Groq odgovor: ' + (data.debug || 'nepoznato'))
      setExploreSuggestions(data.suggestions)
      if (data.groq_limits) setGroqLimits(data.groq_limits)
      // Show source info
      if (data.source === 'live_prices') {
        setExploreError(null)
        setExploreSuggestions(prev => prev ? prev.map(s => ({ ...s, _source: 'live' })) : prev)
      }
    } catch (err) {
      setExploreError(err.message || 'Nije moguce dohvatiti prijedloge. Pokusaj ponovo.')
    } finally {
      setExploreLoading(false)
    }
  }

  const handlePickDestination = (suggestion) => {
    setForm(f => ({ ...f, destination: suggestion.city, transport: 'plane' }))
    setExploreSuggestions(null)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  // Share link — read URL params on mount
  useEffect(() => {
    try {
      const p = new URLSearchParams(window.location.search)
      if (p.get('from') || p.get('to')) {
        setForm(f => ({
          ...f,
          origin:      p.get('from')      || f.origin,
          destination: p.get('to')        || f.destination,
          departDate:  p.get('dep')       || f.departDate,
          returnDate:  p.get('ret')       || f.returnDate,
          adults:      parseInt(p.get('adults'))   || f.adults,
          children:    parseInt(p.get('children')) || f.children,
          childrenAges:p.get('ages')      || f.childrenAges,
          transport:   p.get('transport') || f.transport,
        }))
        // Clean URL after reading
        window.history.replaceState({}, '', window.location.pathname)
      }
    } catch {}
  }, [])

  const [copied, setCopied] = useState(false)
  const handleShareLink = () => {
    const p = new URLSearchParams({
      from: form.origin, to: form.destination,
      dep: form.departDate, ret: form.returnDate,
      adults: form.adults, children: form.children,
      ages: form.childrenAges, transport: form.transport,
    })
    const url = window.location.origin + window.location.pathname + '?' + p.toString()
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2500)
    }).catch(() => {
      // Fallback: select + copy
      const el = document.createElement('textarea')
      el.value = url
      document.body.appendChild(el)
      el.select()
      document.execCommand('copy')
      document.body.removeChild(el)
      setCopied(true)
      setTimeout(() => setCopied(false), 2500)
    })
  }

  // Holidays state (fetched after plan loads)
  const [holidays, setHolidays] = useState(null)

  // Auto-clear childrenAges kad children=0
  useEffect(() => {
    if (form.children === 0 && form.childrenAges !== '') {
      setForm(f => ({ ...f, childrenAges: '' }))
    }
  }, [form.children])

  // Pri mount-u, pokušaj iz localStorage dohvatiti sačuvani origin
  useEffect(() => {
    try {
      const saved = localStorage.getItem('putniplaner_origin')
      if (saved && !form.origin) {
        setForm(f => ({ ...f, origin: saved }))
      }
    } catch {}
  }, [])

  // Spremi origin u localStorage kad se promijeni
  useEffect(() => {
    try {
      if (form.origin) localStorage.setItem('putniplaner_origin', form.origin)
    } catch {}
  }, [form.origin])

  const requestGeolocation = () => {
    if (!navigator.geolocation) {
      setGeoStatus('error')
      return
    }
    setGeoStatus('loading')
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords
        const name = await reverseGeocode(latitude, longitude)
        if (name) {
          setForm(f => ({ ...f, origin: name }))
          setGeoStatus('granted')
        } else {
          // Ako reverse geocoding padne, barem upiši koordinate
          setForm(f => ({ ...f, origin: `${latitude.toFixed(4)}, ${longitude.toFixed(4)}` }))
          setGeoStatus('granted')
        }
      },
      (err) => {
        setGeoStatus(err.code === err.PERMISSION_DENIED ? 'denied' : 'error')
      },
      { enableHighAccuracy: false, timeout: 10000, maximumAge: 3600000 }
    )
  }

  const isStale = plan && planForm && (
    planForm.origin !== form.origin ||
    planForm.destination !== form.destination ||
    planForm.departDate !== form.departDate ||
    planForm.returnDate !== form.returnDate ||
    planForm.adults !== form.adults ||
    planForm.children !== form.children ||
    planForm.transport !== form.transport
  )

  const LOADING_STEPS = [
    { icon: '📍', text: 'Geocodiram destinaciju...' },
    { icon: '✈️', text: 'Tražim letove i prevoz...' },
    { icon: '🏛️', text: 'Dohvatam atrakcije i muzeje...' },
    { icon: '🌤️', text: 'Provjera vremenske prognoze...' },
    { icon: '🤖', text: 'AI analizira grad i zamke...' },
    { icon: '🏠', text: 'Tražim smještaj u blizini...' },
    { icon: '💱', text: 'Valuta i lokalne informacije...' },
    { icon: '🛂', text: 'Provjera vize za BiH pasoš...' },
    { icon: '💰', text: 'Računam okvirni budžet...' },
  ]

  const handleSubmit = async (e) => {
    e?.preventDefault?.()
    if (!form.origin.trim()) { setError('Unesi polazak ili dozvoli lokaciju.'); return }
    if (!form.destination.trim()) { setError('Unesi destinaciju.'); return }
    if (form.returnDate <= form.departDate) { setError('Datum povratka mora biti nakon polaska.'); return }
    if (new Date(form.departDate) < new Date(iso(today))) {
      setError('Datum polaska je u prošlosti.'); return
    }
    if (totalPeople < 1) { setError('Mora biti barem jedna osoba.'); return }
    setError(null); setLoading(true); setLoadingStep(0); setPlan(null); setPlanForm(null); setHolidays(null)

    // Animate loading steps
    let stepIdx = 0
    const stepTimer = setInterval(() => {
      stepIdx = Math.min(stepIdx + 1, LOADING_STEPS.length - 1)
      setLoadingStep(stepIdx)
    }, 2800)

    try {
      const r = await fetch('/api/plan', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(form),
      })
      const rawText = await r.text()
      if (!r.ok) throw new Error(rawText)
      let data
      try { data = JSON.parse(rawText) }
      catch { throw new Error('Server je vratio nevažeći JSON: ' + rawText.slice(0, 200)) }
      setPlan(data)
      setPlanForm({ ...form })
      if (data.groq_limits) setGroqLimits(data.groq_limits)

      // Fetch holidays for destination country
      if (data.destination_coords) {
        fetchHolidays(form.destination, form.departDate, form.returnDate).then(setHolidays)
      }
    } catch (err) {
      setError(parseErrorMessage(err.message || String(err)))
    } finally {
      clearInterval(stepTimer)
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen">
      <Header hasPlan={!!plan} onAbout={() => setShowAbout(true)} theme={theme} onToggleTheme={toggleTheme} />
      <main className="max-w-6xl mx-auto px-4 sm:px-6 pb-24">
        <div className="no-print">
          <Hero />
          {!geoOffered && !form.origin && (
            <GeoPrompt
              onAllow={() => { setGeoOffered(true); requestGeolocation() }}
              onSkip={() => setGeoOffered(true)}
            />
          )}
          <FormCard
            form={form} setForm={setForm} onSubmit={handleSubmit}
            loading={loading} error={error} onRetry={handleSubmit}
            onExplore={handleExplore} exploreLoading={exploreLoading} exploreError={exploreError}
            geoStatus={geoStatus} onGeoRequest={requestGeolocation}
            onShare={handleShareLink} copied={copied}
          />
          {exploreLoading && (
            <div className="card mt-4 flex items-center gap-3 text-white/70">
              <div className="w-5 h-5 border-2 border-accent-400 border-t-transparent rounded-full animate-spin flex-shrink-0"></div>
              <span>AI analizira europske destinacije za tvoj polazak... ✈️</span>
            </div>
          )}
          {exploreSuggestions && !exploreLoading && (
            <ExploreSuggestions
              data={exploreSuggestions}
              form={form}
              onPick={handlePickDestination}
              onClose={() => setExploreSuggestions(null)}
            />
          )}
          {groqLimits && <GroqStatusBar limits={groqLimits} />}
          {loading && <LoadingState step={loadingStep} steps={LOADING_STEPS} />}
          {isStale && !loading && <StaleBanner onRefresh={handleSubmit} />}
          {plan?._partial_failures?.length > 0 && !loading && <PartialWarning plan={plan} />}
        </div>
        {plan && <ErrorBoundary><Results plan={plan} form={planForm || form} totalPeople={(planForm || form).adults + (planForm || form).children} holidays={holidays} /></ErrorBoundary>}
      </main>
      <Footer onAbout={() => setShowAbout(true)} />
      <ScrollToTop />
      {showAbout && <AboutModal onClose={() => setShowAbout(false)} />}
    </div>
  )
}

function Header({ hasPlan, onAbout, theme, onToggleTheme }) {
  return (
    <header className="max-w-6xl mx-auto px-4 sm:px-6 pt-6 pb-2 flex items-center justify-between no-print">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-accent-400 to-accent-500 flex items-center justify-center">
          <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5 text-white"><path d="M2 12l20-9-9 20-2-9-9-2z" fill="currentColor"/></svg>
        </div>
        <div>
          <div className="text-white font-bold tracking-tight">Putni Planer</div>
          <div className="text-white/40 text-xs -mt-0.5">Live planiranje putovanja • besplatno</div>
        </div>
      </div>
      <div className="flex items-center gap-2 sm:gap-3">
        <button
          onClick={onToggleTheme}
          title={theme === 'dark' ? 'Prebaci na svijetlu temu' : 'Prebaci na tamnu temu'}
          className="text-sm bg-white/10 hover:bg-white/20 text-white rounded-lg px-3 py-2 transition-colors flex items-center gap-1.5"
        >
          {theme === 'dark' ? '☀️' : '🌙'}
          <span className="hidden sm:inline">{theme === 'dark' ? 'Svijetla' : 'Tamna'}</span>
        </button>
        <button onClick={onAbout} className="text-sm bg-white/10 hover:bg-white/20 text-white rounded-lg px-3 py-2 transition-colors flex items-center gap-1.5">
          <span>ℹ️</span> <span className="hidden sm:inline">O aplikaciji</span>
        </button>
        {hasPlan && (
          <button onClick={() => window.print()} className="text-sm bg-white/10 hover:bg-white/20 text-white rounded-lg px-3 py-2 transition-colors flex items-center gap-1.5">
            <span>📄</span> <span className="hidden sm:inline">Export PDF</span>
          </button>
        )}
      </div>
    </header>
  )
}

function Hero() {
  return (
    <section className="pt-6 pb-8">
      <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white leading-tight">
        Isplaniraj <span className="text-accent-400">savršeno putovanje</span><br />
        <span className="text-white/60 text-xl sm:text-2xl font-semibold">Prevoz, smještaj, 15 atrakcija, itinerarij, mapa, viza i više — na jednom mjestu.</span>
      </h1>
    </section>
  )
}

function GeoPrompt({ onAllow, onSkip }) {
  return (
    <div className="card mb-4 bg-gradient-to-br from-sky-900/40 to-ink-800/40 border-sky-500/20">
      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        <div className="flex-grow">
          <div className="font-semibold text-white flex items-center gap-2">
            <span>📍</span>Želiš li da automatski otkrijemo tvoj grad?
          </div>
          <div className="text-white/60 text-sm mt-1">
            Koristimo tvoju lokaciju samo da popunimo polje "Polazak". Ništa se ne sprema van tvog uređaja.
          </div>
        </div>
        <div className="flex gap-2 flex-shrink-0">
          <button onClick={onAllow} className="bg-sky-500 hover:bg-sky-400 text-white text-sm font-semibold rounded-lg px-4 py-2 transition-colors">
            Dozvoli
          </button>
          <button onClick={onSkip} className="bg-white/10 hover:bg-white/20 text-white text-sm font-semibold rounded-lg px-4 py-2 transition-colors">
            Preskoči
          </button>
        </div>
      </div>
    </div>
  )
}

function FormCard({ form, setForm, onSubmit, loading, error, onRetry, geoStatus, onGeoRequest, onExplore, exploreLoading, exploreError, onShare, copied }) {
  const update = (k) => (e) => setForm({ ...form, [k]: e.target.value })
  const updateNum = (k) => (e) => setForm({ ...form, [k]: Math.max(0, parseInt(e.target.value) || 0) })

  return (
    <form onSubmit={onSubmit} className="card space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div>
          <label className="label flex items-center justify-between">
            <span>Polazak</span>
            <button
              type="button"
              onClick={onGeoRequest}
              disabled={geoStatus === 'loading'}
              className="text-xs text-sky-400 hover:text-sky-300 disabled:opacity-50 flex items-center gap-1"
              title="Koristi moju lokaciju"
            >
              {geoStatus === 'loading' ? (
                <><span className="inline-block w-3 h-3 border border-sky-400 border-t-transparent rounded-full animate-spin"></span>Tražim...</>
              ) : geoStatus === 'granted' ? (
                <>📍 Osvježi</>
              ) : (
                <>📍 Koristi lokaciju</>
              )}
            </button>
          </label>
          <input className="input" value={form.origin} onChange={update('origin')} placeholder="npr. Sarajevo" />
          {geoStatus === 'denied' && (
            <div className="text-xs text-amber-300/80 mt-1">Pristup lokaciji odbijen. Unesi ručno.</div>
          )}
          {geoStatus === 'error' && (
            <div className="text-xs text-amber-300/80 mt-1">Lokacija nedostupna. Unesi ručno.</div>
          )}
        </div>
        <div>
          <label className="label">Destinacija</label>
          <input className="input" value={form.destination} onChange={update('destination')} placeholder="Grad (npr. Rim)" />
        </div>
        <div>
          <label className="label">Datum polaska</label>
          <input type="date" className="input" value={form.departDate} onChange={update('departDate')} min={iso(today)} />
        </div>
        <div>
          <label className="label">Datum povratka</label>
          <input type="date" className="input" value={form.returnDate} onChange={update('returnDate')} min={form.departDate} />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-2 border-t border-white/5">
        <div>
          <label className="label">Odrasli <span className="text-white/40">(18+)</span></label>
          <input type="number" min="0" max="20" className="input" value={form.adults} onChange={updateNum('adults')} />
        </div>
        <div>
          <label className="label">Djeca / tinejdžeri</label>
          <input type="number" min="0" max="20" className="input" value={form.children} onChange={updateNum('children')} />
        </div>
        <div>
          <label className="label">Uzrasti djece <span className="text-white/40">(opc.)</span></label>
          <input className="input" value={form.childrenAges} onChange={update('childrenAges')} placeholder={form.children === 0 ? '—' : 'npr. 13, 16'} disabled={form.children === 0} />
        </div>
        <div>
          <label className="label">Prevoz</label>
          <select className="input" value={form.transport} onChange={update('transport')}>
            <option value="plane">✈️ Avion</option>
            <option value="car">🚗 Auto</option>
            <option value="bus">🚌 Autobus</option>
            <option value="train">🚆 Voz</option>
          </select>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center gap-3 pt-1">
        <button type="submit" disabled={loading || exploreLoading} className="btn-primary">
          {loading ? 'Planiram…' : 'Isplaniraj putovanje'}
        </button>
        <button
          type="button"
          onClick={onExplore}
          disabled={loading || exploreLoading}
          className="flex items-center gap-2 bg-violet-600/80 hover:bg-violet-500 disabled:opacity-50 text-white font-semibold rounded-xl px-5 py-3 transition-colors"
        >
          {exploreLoading ? (
            <><span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>Tražim...</>
          ) : <>🌍 Gdje da idem?</>}
        </button>
        <button
          type="button"
          onClick={onShare}
          disabled={loading}
          className="flex items-center gap-2 bg-white/8 hover:bg-white/15 text-white/70 font-semibold rounded-xl px-4 py-3 transition-colors border border-white/10"
          title="Kopiraj link sa podacima iz forme"
        >
          {copied ? '✓ Kopirano!' : '🔗 Dijeli plan'}
        </button>
        <div className="text-white/50 text-sm">
          {travelerSummary(form.adults, form.children, form.childrenAges)}
        </div>
      </div>
      {exploreError && (
        <div className="text-sm text-amber-300 bg-amber-900/20 border border-amber-500/30 rounded-xl px-4 py-3">{exploreError}</div>
      )}
      {error && (
        <div className="text-sm text-red-300 bg-red-900/30 border border-red-500/30 rounded-xl px-4 py-3 whitespace-pre-line">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-grow">{error}</div>
            <button type="button" onClick={onRetry} className="flex-shrink-0 bg-red-500/30 hover:bg-red-500/50 text-white text-xs font-semibold rounded-lg px-3 py-1.5 transition-colors">
              ↻ Pokušaj ponovo
            </button>
          </div>
        </div>
      )}
    </form>
  )
}

function ExploreSuggestions({ data, form, onPick, onClose }) {
  if (!data?.length) return null

  const tagColors = {
    culture: 'bg-violet-500/20 text-violet-300', history: 'bg-amber-500/20 text-amber-300',
    beaches: 'bg-sky-500/20 text-sky-300', nightlife: 'bg-pink-500/20 text-pink-300',
    food: 'bg-orange-500/20 text-orange-300', nature: 'bg-emerald-500/20 text-emerald-300',
    architecture: 'bg-indigo-500/20 text-indigo-300', shopping: 'bg-rose-500/20 text-rose-300',
    family: 'bg-cyan-500/20 text-cyan-300', romance: 'bg-red-500/20 text-red-300',
    adventure: 'bg-lime-500/20 text-lime-300', art: 'bg-purple-500/20 text-purple-300',
  }

  const crowdColor = { 'Low': 'text-emerald-400', 'Moderate': 'text-amber-400', 'High': 'text-orange-400', 'Very High': 'text-red-400' }

  const origin = form.origin.split(',')[0].trim()

  return (
    <div className="card mt-4 border-violet-500/20" style={{background: 'var(--explore-bg, rgba(139,92,246,0.08))'}}>
      <style>{`
        body:not(.light) { --explore-bg: rgba(139,92,246,0.08); --explore-card: rgba(15,20,50,0.6); --explore-card-top: rgba(139,92,246,0.12); }
        body.light { --explore-bg: rgba(237,233,254,0.7); --explore-card: rgba(255,255,255,0.95); --explore-card-top: rgba(237,233,254,0.95); }
        .explore-card { background: var(--explore-card); }
        .explore-card-top { background: var(--explore-card-top); }
      `}</style>
      <div className="flex items-center justify-between mb-4">
        <div>
          <div className="section-title mb-0">🌍 Gdje da idem? <span className="text-violet-400 text-base font-normal">— AI preporuke</span></div>
          <div className="text-white/50 text-sm mt-1">
            Polazak: <span className="text-white/70">{origin}</span> · {form.departDate} · avion
            {data[0]?.live_prices && (
              <span className="ml-2 bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 text-[10px] font-bold px-2 py-0.5 rounded-full">
                ✓ LIVE CIJENE
              </span>
            )}
            {data[0]?.live_prices === false && (
              <span className="ml-2 text-white/30 text-[10px]">(AI procjene cijena)</span>
            )}
          </div>
        </div>
        <button onClick={onClose} className="text-white/30 hover:text-white/70 text-2xl w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/10 transition-colors">×</button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-5 gap-4">
        {data.map((s, i) => (
          <div key={i} className={`explore-card rounded-2xl border p-4 flex flex-col gap-3 transition-all hover:scale-[1.01] ${i === 0 ? 'explore-card-top border-violet-500/40' : 'border-black/5 dark:border-white/8'}`}>
            {/* Header */}
            <div className="flex items-start justify-between gap-2">
              <div>
                {i === 0 && <div className="text-violet-500 text-[10px] font-bold uppercase tracking-wide mb-1">AI top izbor</div>}
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{s.flag}</span>
                  <div>
                    <div className="text-gray-900 dark-text font-bold text-base leading-tight">{s.city}</div>
                    <div className="text-gray-500 dark-text-muted text-xs">{s.country}</div>
                  </div>
                </div>
              </div>
              <div className="text-right flex-shrink-0">
                <div className="text-gray-400 text-[10px] uppercase tracking-wide">Score</div>
                <div className={`text-xl font-black ${s.score >= 85 ? 'text-emerald-500' : s.score >= 70 ? 'text-amber-500' : 'text-gray-400'}`}>{s.score}</div>
              </div>
            </div>

            {/* Tagline */}
            <p className="text-gray-600 dark-text-muted text-xs leading-snug">{s.tagline}</p>

            {/* Why now */}
            {s.why_now && (
              <div className="flex gap-1.5 text-xs">
                <span className="text-violet-400 flex-shrink-0">✦</span>
                <span className="text-violet-300/80 italic">{s.why_now}</span>
              </div>
            )}

            {/* Stats */}
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-white/5 rounded-lg p-2 text-center">
                <div className="text-white/40 text-[10px] uppercase tracking-wide">
                  Let {s.live_prices ? <span className="text-emerald-400">● LIVE</span> : '(procjena)'}
                </div>
                <div className="text-accent-400 font-bold text-sm">~€{s.estimated_flight_eur}</div>
              </div>
              <div className="bg-white/5 rounded-lg p-2 text-center">
                <div className="text-white/40 text-[10px] uppercase tracking-wide">Dnevni budžet</div>
                <div className="text-white font-bold text-sm">~€{s.avg_daily_budget_eur}</div>
              </div>
            </div>

            {/* Weather + crowd */}
            <div className="flex items-center justify-between text-xs text-white/50">
              <span>🌡️ {s.weather_in_month}</span>
              <span className={crowdColor[s.crowd_level] || 'text-white/40'}>👥 {s.crowd_level}</span>
            </div>

            {/* Visa + direct */}
            <div className="flex gap-2">
              {s.visa_needed === false && (
                <span className="bg-emerald-500/15 border border-emerald-500/25 text-emerald-400 text-[10px] font-semibold px-2 py-0.5 rounded-full">✓ Bez vize</span>
              )}
              {s.visa_needed === true && (
                <span className="bg-amber-500/15 border border-amber-500/25 text-amber-400 text-[10px] font-semibold px-2 py-0.5 rounded-full">⚠ Treba viza</span>
              )}
              {s.direct_flight && (
                <span className="bg-sky-500/15 border border-sky-500/25 text-sky-400 text-[10px] font-semibold px-2 py-0.5 rounded-full">✈ Direktan let</span>
              )}
            </div>

            {/* Top 3 */}
            {(() => {
              const t3 = Array.isArray(s.top_3) ? s.top_3 : (typeof s.top_3 === 'string' ? s.top_3.split(',').map(x=>x.trim()) : [])
              return t3.length > 0 && (
                <div className="text-xs text-white/50">
                  <span className="text-white/30 mr-1">Top:</span>
                  {t3.join(' · ')}
                </div>
              )
            })()}

            {/* Tags */}
            {(() => {
              const bf = Array.isArray(s.best_for) ? s.best_for : (typeof s.best_for === 'string' ? s.best_for.split(',').map(x=>x.trim()) : [])
              return bf.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {bf.map(tag => (
                    <span key={tag} className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${tagColors[tag] || 'bg-white/8 text-white/50'}`}>{tag}</span>
                  ))}
                </div>
              )
            })()}

            {/* Actions */}
            <div className="flex gap-2 mt-auto pt-2 border-t border-white/5 no-print">
              <button
                onClick={() => onPick(s)}
                className="flex-1 bg-accent-500 hover:bg-accent-400 text-white text-sm font-semibold rounded-lg px-3 py-2 transition-colors"
              >
                Isplaniraj →
              </button>
              {s.google_flights_url && (
                <a href={s.google_flights_url} target="_blank" rel="noreferrer"
                  className="bg-white/10 hover:bg-white/20 text-white/70 text-sm font-semibold rounded-lg px-3 py-2 transition-colors flex-shrink-0"
                  title="Provjeri letove">
                  ✈
                </a>
              )}
            </div>
          </div>
        ))}
      </div>
      <div className="mt-4 text-white/30 text-xs">
        Prijedlozi generisani AI-jem na osnovu polaska, datuma i tipičnih cijena. Klikni "Isplaniraj →" za detaljan plan putovanja.
      </div>
    </div>
  )
}

function StaleBanner({ onRefresh }) {
  return (
    <div className="card mt-4 bg-amber-500/10 border-amber-500/30">
      <div className="flex items-center justify-between gap-3">
        <div className="text-amber-200 text-sm">
          ⚠️ Promijenio si parametre putovanja. Plan ispod je iz prethodnog upita.
        </div>
        <button onClick={onRefresh} className="bg-amber-500 hover:bg-amber-400 text-white text-sm font-semibold rounded-lg px-3 py-1.5 transition-colors flex-shrink-0">
          Osvježi plan
        </button>
      </div>
    </div>
  )
}

function PartialWarning({ plan }) {
  return (
    <div className="card mt-4 bg-amber-500/10 border-amber-500/30">
      <div className="text-amber-200 text-sm">
        ⚠️ Neki dijelovi plana nisu imali javno dostupne podatke: <strong>{plan._partial_failures.join(', ')}</strong>. Te stavke su namjerno ostavljene prazne umjesto da budu izmišljene.
      </div>
    </div>
  )
}

function LoadingState({ step = 0, steps = [] }) {
  const pct = steps.length ? Math.round(((step + 1) / steps.length) * 100) : 10
  const current = steps[step] || { icon: '⏳', text: 'Učitavam...' }
  return (
    <div className="card mt-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-6 h-6 border-2 border-accent-400 border-t-transparent rounded-full animate-spin flex-shrink-0"></div>
        <div>
          <div className="font-semibold text-white text-base">
            {current.icon} {current.text}
          </div>
          <div className="text-white/40 text-xs mt-0.5">Obično 15–25 sekundi ukupno</div>
        </div>
      </div>

      {/* Progress bar */}
      <div className="h-1.5 bg-white/8 rounded-full overflow-hidden mb-4">
        <div
          className="h-full bg-accent-500 rounded-full transition-all duration-[2600ms] ease-out"
          style={{ width: pct + '%' }}
        />
      </div>

      {/* Step grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
        {steps.map((s, i) => (
          <div key={i} className={`flex items-center gap-1.5 text-xs rounded-lg px-2 py-1.5 transition-all ${
            i < step ? 'text-emerald-400 bg-emerald-500/10' :
            i === step ? 'text-accent-400 bg-accent-500/10 font-semibold' :
            'text-white/25'
          }`}>
            <span>{i < step ? '✓' : s.icon}</span>
            <span className="truncate">{s.text.replace('...', '')}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

function Results({ plan, form, totalPeople, holidays }) {
  const days = Math.max(1, Math.round((new Date(form.returnDate) - new Date(form.departDate)) / 86400000))
  return (
    <div className="mt-8 space-y-6 print-container">
      {/* Print-only header */}
      <div className="hidden print:block mb-6 pb-4 border-b-2 border-gray-300">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-2xl font-bold" style={{color:'#111'}}>Putni Planer</div>
            <div className="text-sm" style={{color:'#666'}}>putni-planer.pages.dev</div>
          </div>
          <div className="text-right">
            <div className="text-xl font-bold" style={{color:'#111'}}>{form.origin} — {form.destination}</div>
            <div style={{color:'#444'}}>{form.departDate} — {form.returnDate} · {days} {days === 1 ? 'dan' : 'dana'} · {totalPeople} osoba</div>
            <div className="text-xs mt-1" style={{color:'#888'}}>Generisano: {new Date().toISOString().slice(0,10)}</div>
          </div>
        </div>
      </div>

      <TripSummary plan={plan} form={form} totalPeople={totalPeople} />
      <CityInfoCard data={plan.city_info} destination={form.destination} />
      <MapCard plan={plan} />
      <TransportCard plan={plan} form={form} totalPeople={totalPeople} />
      {form.transport === 'plane' && plan.alternative_dates?.length > 0 && (
        <AlternativeDatesCard data={plan.alternative_dates} currentDepart={form.departDate} currentReturn={form.returnDate} />
      )}
      <HolidaysCard data={holidays} departDate={form.departDate} returnDate={form.returnDate} />
      <AccommodationCard data={plan.accommodation} options={plan.accommodation_options} form={form} totalPeople={totalPeople} />
      <AttractionsCard data={plan.attractions} form={form} />
      <ItineraryCard data={plan.itinerary} attractions={plan.attractions} />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 avoid-break">
        <TransitCard data={plan.transit} />
        <WeatherCard data={plan.weather} destination={form.destination} />
      </div>
      <FoodCard data={plan.food} form={form} />
      <ChainRestaurantsCard data={plan.chain_restaurants} form={form} />
      <TouristTrapsCard data={plan.tourist_traps} />
      <CurrencyCard data={plan.currency} destination={form.destination} />
      <VisaCard data={plan.visa} />
      <EmergencyCard data={plan.emergency} />
      {plan.budget && <BudgetCard data={plan.budget} notes={plan.budget_notes} totalPeople={totalPeople} plan={plan} form={form} />}
      {plan.tips && <TipsCard data={plan.tips} />}
    </div>
  )
}

function CityInfoCard({ data, destination }) {
  if (!data) return null

  const cityName = destination ? destination.split(',')[0].trim() : ''

  const crimeColor = {
    'Very Low': 'text-emerald-400', 'Low': 'text-emerald-400',
    'Moderate': 'text-amber-400', 'High': 'text-rose-400', 'Very High': 'text-rose-500',
  }[data.crime_level] || 'text-white/60'

  const crimeBarColor = {
    'Very Low': 'bg-emerald-500', 'Low': 'bg-emerald-400',
    'Moderate': 'bg-amber-400', 'High': 'bg-rose-400', 'Very High': 'bg-rose-600',
  }[data.crime_level] || 'bg-white/20'

  // Build religion chart data sorted by %
  const religions = data.religion_pct
    ? Object.entries(data.religion_pct).sort((a, b) => b[1] - a[1])
    : []

  const relColors = ['bg-sky-500', 'bg-violet-500', 'bg-emerald-500', 'bg-amber-500', 'bg-rose-500', 'bg-slate-500']

  return (
    <div className="card">
      <div className="section-title">🏙️ O gradu — {cityName}</div>

      {/* Summary */}
      {data.summary && (
        <p className="text-white/75 text-sm leading-relaxed mb-5">{data.summary}</p>
      )}

      {/* Quick stats grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
        {data.population && (
          <div className="bg-ink-900/50 rounded-xl p-3 border border-white/5">
            <div className="text-white/40 text-[10px] uppercase tracking-wide mb-1">Stanovništvo</div>
            <div className="text-white font-bold text-base">{data.population.toLocaleString('bs-BA')}</div>
            {data.population_year && <div className="text-white/30 text-[10px]">({data.population_year})</div>}
          </div>
        )}
        {data.area_km2 && (
          <div className="bg-ink-900/50 rounded-xl p-3 border border-white/5">
            <div className="text-white/40 text-[10px] uppercase tracking-wide mb-1">Površina</div>
            <div className="text-white font-bold text-base">{data.area_km2.toLocaleString()} km²</div>
          </div>
        )}
        {data.founded_year && (() => {
          // Only show if it looks like a real year (> 100 or negative for BC)
          const yr = parseInt(data.founded_year)
          if (!yr || (yr > 0 && yr < 100)) return null
          const label = typeof data.founded_year === 'string' && data.founded_year.toString().length > 6
            ? data.founded_year  // already a descriptive string like "4th century BC"
            : yr < 0 ? Math.abs(yr) + ' p.n.e.' : yr
          return (
            <div className="bg-ink-900/50 rounded-xl p-3 border border-white/5">
              <div className="text-white/40 text-[10px] uppercase tracking-wide mb-1">Osnovano</div>
              <div className="text-white font-bold text-base">{label}</div>
            </div>
          )
        })()}
        {data.timezone && (
          <div className="bg-ink-900/50 rounded-xl p-3 border border-white/5">
            <div className="text-white/40 text-[10px] uppercase tracking-wide mb-1">Vremenska zona</div>
            <div className="text-white font-bold text-sm">{data.timezone}</div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
        {/* Religijska struktura */}
        {religions.length > 0 && (
          <div>
            <div className="text-white/50 text-xs uppercase tracking-wide mb-3">Religijska struktura</div>
            <div className="space-y-2">
              {religions.map(([name, pct], i) => (
                <div key={name}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-white/70">{name}</span>
                    <span className="text-white/50">{pct}%</span>
                  </div>
                  <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                    <div className={`h-full rounded-full ${relColors[i] || 'bg-slate-500'}`} style={{ width: `${pct}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Stopa kriminala */}
        <div>
          <div className="text-white/50 text-xs uppercase tracking-wide mb-3">Stopa kriminala</div>
          {data.crime_level && (
            <div className="flex items-center gap-3 mb-2">
              <span className={`font-bold text-lg ${crimeColor}`}>{data.crime_level}</span>
              {data.crime_index !== null && data.crime_index !== undefined && (
                <span className="text-white/40 text-xs">Index: {data.crime_index}/100</span>
              )}
            </div>
          )}
          {data.crime_index !== null && data.crime_index !== undefined && (
            <div className="h-2 bg-white/5 rounded-full overflow-hidden mb-3">
              <div className={`h-full rounded-full ${crimeBarColor}`} style={{ width: `${Math.min(data.crime_index, 100)}%` }} />
            </div>
          )}
          {data.crime_note && <p className="text-white/60 text-xs mb-2">{data.crime_note}</p>}
          {data.safety_tips?.length > 0 && (
            <ul className="space-y-1">
              {data.safety_tips.map((tip, i) => (
                <li key={i} className="flex gap-1.5 text-xs text-white/55">
                  <span className="text-amber-400 flex-shrink-0">⚠</span>
                  <span>{tip}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* Linkovi */}
      <div className="pt-4 border-t border-white/5">
        <div className="text-white/40 text-xs uppercase tracking-wide mb-3">Saznaj više</div>
        <div className="flex flex-wrap gap-2 no-print">
          {data.youtube_city_tour && (
            <a href={data.youtube_city_tour} target="_blank" rel="noreferrer"
              className="flex items-center gap-2 bg-red-500/15 hover:bg-red-500/25 border border-red-500/30 text-red-400 text-sm font-semibold rounded-lg px-4 py-2 transition-all">
              ▶ YouTube — obilazak grada
            </a>
          )}
          {data.wikipedia_url && (
            <a href={data.wikipedia_url} target="_blank" rel="noreferrer"
              className="flex items-center gap-2 bg-white/8 hover:bg-white/15 border border-white/10 text-white/70 text-sm font-semibold rounded-lg px-4 py-2 transition-all">
              📖 Wikipedia — {cityName}
            </a>
          )}
          {data.history_url && (
            <a href={data.history_url} target="_blank" rel="noreferrer"
              className="flex items-center gap-2 bg-white/8 hover:bg-white/15 border border-white/10 text-white/70 text-sm font-semibold rounded-lg px-4 py-2 transition-all">
              📜 Historija grada
            </a>
          )}
          {data.numbeo_url && (
            <a href={data.numbeo_url} target="_blank" rel="noreferrer"
              className="flex items-center gap-2 bg-white/8 hover:bg-white/15 border border-white/10 text-white/70 text-sm font-semibold rounded-lg px-4 py-2 transition-all">
              🔒 Kriminal — Numbeo
            </a>
          )}
          {data.worldometers_url && (
            <a href={data.worldometers_url} target="_blank" rel="noreferrer"
              className="flex items-center gap-2 bg-white/8 hover:bg-white/15 border border-white/10 text-white/70 text-sm font-semibold rounded-lg px-4 py-2 transition-all">
              👥 Stanovništvo — Worldometers
            </a>
          )}
        </div>
      </div>
    </div>
  )
}

function TripSummary({ plan, form, totalPeople }) {
  const days = Math.max(1, Math.round((new Date(form.returnDate) - new Date(form.departDate)) / 86400000))
  const transportEmoji = { plane: '✈️', car: '🚗', bus: '🚌', train: '🚆' }[form.transport] || '🧭'
  const transportName = { plane: 'Avion', car: 'Auto', bus: 'Autobus', train: 'Voz' }[form.transport] || 'Prevoz'
  return (
    <div className="card bg-gradient-to-br from-ink-800/80 to-ink-700/40 avoid-break">
      <div className="flex flex-wrap items-center gap-3">
        <span className="chip">📍 {form.origin} → {form.destination}</span>
        <span className="chip">🗓️ {form.departDate} — {form.returnDate}</span>
        <span className="chip">⏱️ {days} {days === 1 ? 'dan' : 'dana'}</span>
        <span className="chip">{transportEmoji} {transportName}</span>
        <span className="chip">👥 {travelerSummary(form.adults, form.children, form.childrenAges)}</span>
      </div>
      {plan.summary && <p className="text-white/80 mt-4 leading-relaxed">{plan.summary}</p>}
    </div>
  )
}

function MapCard({ plan }) {
  const hasCoords = plan.destination_coords?.lat || plan.attractions?.some(a => a.lat)
  if (!hasCoords) return null
  return (
    <div className="card avoid-break no-print-map">
      <div className="section-title">🗺️ Mapa destinacije</div>
      <MapView plan={plan} />
      <div className="flex flex-wrap gap-3 mt-3 text-xs text-white/60">
        <LegendItem color="#ef6b1f" label="Atrakcije" />
        <LegendItem color="#0ea5e9" label="Smještaj" />
        <LegendItem color="#10b981" label="Hrana" />
      </div>
    </div>
  )
}

function LegendItem({ color, label }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span className="w-3 h-3 rounded-full" style={{ background: color }}></span>
      {label}
    </span>
  )
}

function TransportCard({ plan, form, totalPeople }) {
  const mode = form.transport
  const emptyMsg = (label) => (
    <div className="card">
      <div className="section-title">🧭 Prevoz: {label}</div>
      <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4 text-amber-200 text-sm">
        {plan.transport_notice || 'Javni live podaci za ovaj tip prevoza nisu dostupni preko besplatnog univerzalnog API-ja. Koristi direktnu pretragu ispod.'}
      </div>
      <div className="mt-4 flex flex-wrap gap-2 no-print">
        <ExternalSearchButtons form={form} mode={mode} />
      </div>
    </div>
  )

  if (mode === 'plane') {
    if (!plan.flights?.length) {
      return (
        <div className="card">
          <div className="section-title">✈️ Prevoz: Avion <span className="text-white/40 text-sm font-normal">({totalPeople} {totalPeople === 1 ? 'putnik' : 'putnika'})</span></div>
          {plan.transport_notice && (
            <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4 text-amber-200 text-sm mb-4">
              {plan.transport_notice}
            </div>
          )}
          <div className="text-white/60 text-sm mb-4">
            Pretražuj live letove na više platformi — cijene se ažuriraju u realnom vremenu:
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-4 no-print">
            {(() => {
              const L = buildLinks(form)
              const links = plan.flight_search_links?.length ? plan.flight_search_links.map(l => ({
                ...l,
                url: l.name === 'Google Flights' ? L.googleFlights
                   : l.name === 'Kiwi.com' ? L.kiwi
                   : l.name === 'Kayak' ? L.kayak
                   : l.name === 'Momondo' ? L.momondo
                   : l.name === 'Ryanair' ? L.ryanair
                   : l.name === 'Wizz Air' ? L.wizzair
                   : l.url
              })).concat([
                { name: 'Ryanair',  url: L.ryanair,  emoji: '🔵' },
                { name: 'Wizz Air', url: L.wizzair,  emoji: '🟣' },
              ].filter(extra => !plan.flight_search_links.some(l => l.name === extra.name))) : [
                { name: 'Google Flights', url: L.googleFlights, emoji: '✈️' },
                { name: 'Kiwi.com',       url: L.kiwi,          emoji: '🥝' },
                { name: 'Kayak',          url: L.kayak,          emoji: '🛩️' },
                { name: 'Momondo',        url: L.momondo,        emoji: '🌐' },
                { name: 'Ryanair',        url: L.ryanair,        emoji: '🔵' },
                { name: 'Wizz Air',       url: L.wizzair,        emoji: '🟣' },
              ]
              return links.map((link) => (
                <a key={link.name} href={link.url} target="_blank" rel="noreferrer"
                  className="flex flex-col items-center gap-2 bg-ink-900/50 hover:bg-accent-500/20 border border-white/10 hover:border-accent-500/40 rounded-xl p-4 transition-all group text-center">
                  <span className="text-2xl">{link.emoji}</span>
                  <span className="text-white font-semibold text-sm group-hover:text-accent-400 transition-colors">{link.name}</span>
                  <span className="text-white/40 text-xs">{cityOnly(form.origin)} → {cityOnly(form.destination)}</span>
                </a>
              ))
            })()}
          </div>
          <div className="bg-ink-900/30 border border-white/5 rounded-xl p-4 text-sm text-white/60">
            <span className="text-white/80 font-semibold">💡 Savjet:</span> Kiwi.com često pronalazi kombinovane letove koji su jeftiniji. Poredjaj po cijeni, pa provjeri na Google Flights za direktne opcije.
          </div>
        </div>
      )
    }
    return <FlightsCard data={plan.flights} form={form} totalPeople={totalPeople} />
  }
  if (mode === 'car') {
    if (!plan.car_route) return emptyMsg('Auto')
    return <CarRouteCard data={plan.car_route} form={form} />
  }
  if (mode === 'bus') {
    if (!plan.bus_routes?.length) return emptyMsg('Autobus')
    return <GroundRoutesCard data={plan.bus_routes} form={form} type="bus" totalPeople={totalPeople} />
  }
  if (mode === 'train') {
    if (!plan.train_routes?.length) return emptyMsg('Voz')
    return <GroundRoutesCard data={plan.train_routes} form={form} type="train" totalPeople={totalPeople} />
  }
  return null
}

function ExternalSearchButtons({ form, mode }) {
  const L = buildLinks(form)
  const from = cityOnly(form.origin)
  const to = cityOnly(form.destination)
  const label = `${from} → ${to}`

  if (mode === 'plane') return (
    <div className="flex flex-wrap gap-2">
      <LinkBtn href={L.googleFlights} primary>✈️ Google Flights</LinkBtn>
      <LinkBtn href={L.kiwi}>🥝 Kiwi.com</LinkBtn>
      <LinkBtn href={L.kayak}>🛩️ Kayak</LinkBtn>
      <LinkBtn href={L.momondo}>🌐 Momondo</LinkBtn>
      <LinkBtn href={L.ryanair}>🔵 Ryanair</LinkBtn>
      <LinkBtn href={L.wizzair}>🟣 Wizz Air</LinkBtn>
      <div className="w-full text-white/40 text-xs mt-1">{label} • {form.departDate} – {form.returnDate} • {form.adults + form.children} putnika</div>
    </div>
  )

  if (mode === 'car') return (
    <div className="flex flex-wrap gap-2">
      <LinkBtn href={L.googleMaps} primary>🗺️ Google Maps ruta</LinkBtn>
      <LinkBtn href={L.waze}>📍 Waze</LinkBtn>
      <LinkBtn href={L.rome2rio}>🔍 Rome2Rio</LinkBtn>
      <div className="w-full text-white/40 text-xs mt-1">{label}</div>
    </div>
  )

  if (mode === 'bus') return (
    <div className="flex flex-wrap gap-2">
      <LinkBtn href={L.flixbus} primary>🚌 FlixBus</LinkBtn>
      <LinkBtn href={L.omio_bus}>🎟️ Omio</LinkBtn>
      <LinkBtn href={L.rome2rio}>🗺️ Rome2Rio</LinkBtn>
      <LinkBtn href={L.busbud}>🔎 BusBud</LinkBtn>
      <div className="w-full text-white/40 text-xs mt-1">{label} • {form.departDate}</div>
    </div>
  )

  if (mode === 'train') return (
    <div className="flex flex-wrap gap-2">
      <LinkBtn href={L.omio_train} primary>🎟️ Omio</LinkBtn>
      <LinkBtn href={L.trainline}>🚆 Trainline</LinkBtn>
      <LinkBtn href={L.raileurope}>🚄 Rail Europe</LinkBtn>
      <LinkBtn href={L.rome2rio}>🗺️ Rome2Rio</LinkBtn>
      <div className="w-full text-white/40 text-xs mt-1">{label} • {form.departDate} – {form.returnDate}</div>
    </div>
  )

  return null
}

function LinkBtn({ href, children, primary }) {
  return (
    <a href={href} target="_blank" rel="noreferrer"
      className={`text-sm font-semibold rounded-lg px-4 py-2 transition-colors ${primary ? 'bg-accent-500 hover:bg-accent-400 text-white' : 'bg-white/10 hover:bg-white/20 text-white'}`}>
      {children} →
    </a>
  )
}

function FlightsCard({ data, form, totalPeople }) {
  return (
    <div className="card">
      <div className="section-title">✈️ Letovi <span className="text-white/40 text-sm font-normal">({totalPeople} {totalPeople === 1 ? 'putnik' : 'putnika'})</span></div>
      <ul className="space-y-3">
        {data.map((f, i) => (
          <li key={i} className="bg-ink-900/50 rounded-xl p-4 border border-white/5">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="font-semibold text-white truncate">{f.airline || 'Avio kompanija'}</div>
                <div className="text-white/60 text-sm mt-0.5">{f.departure} → {f.arrival}</div>
                <div className="text-white/40 text-xs mt-1">
                  {f.stops === 0 ? 'Direktan let' : `${f.stops} presjedanja`}
                  {f.duration ? ` • ${f.duration}` : ''}
                </div>
              </div>
              <div className="text-right">
                <div className="text-accent-400 font-bold">{formatEUR(f.price_total_eur)}</div>
                <div className="text-white/40 text-xs">ukupno za {totalPeople}</div>
              </div>
            </div>
          </li>
        ))}
      </ul>
      <div className="mt-4 pt-4 border-t border-white/5 flex flex-wrap gap-2 no-print">
        {[
          { name: 'Google Flights', href: buildLinks(form).googleFlights },
          { name: 'Kiwi.com',       href: buildLinks(form).kiwi },
          { name: 'Kayak',          href: buildLinks(form).kayak },
          { name: 'Momondo',        href: buildLinks(form).momondo },
          { name: 'Ryanair',        href: buildLinks(form).ryanair },
          { name: 'Wizz Air',       href: buildLinks(form).wizzair },
        ].map((s, i) => (
          <a key={s.name} href={s.href} target="_blank" rel="noreferrer"
            className={`text-sm font-semibold rounded-lg px-4 py-2 transition-colors ${i === 0 ? 'bg-accent-500 hover:bg-accent-400 text-white' : 'bg-white/10 hover:bg-white/20 text-white'}`}>
            {s.name} →
          </a>
        ))}
      </div>
    </div>
  )
}

function CarRouteCard({ data, form }) {
  const primaryCost = data.round_trip_total_eur || data.total_cost_eur
  const primaryLabel = data.round_trip_total_eur ? 'Ukupan trošak povratnog puta' : 'Procijenjeni trošak jednog smjera'

  return (
    <div className="card">
      <div className="section-title">🚗 Auto ruta <span className="text-white/40 text-sm font-normal">{form.origin} → {form.destination}</span></div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
        {data.distance_km ? <StatBox label="Udaljenost" value={`${data.distance_km} km`} /> : null}
        {data.duration_hours ? <StatBox label="Vrijeme vožnje" value={`${data.duration_hours} h`} /> : null}
        {data.fuel_cost_eur !== undefined && data.fuel_cost_eur !== null ? <StatBox label="Gorivo" value={formatEUR(data.fuel_cost_eur)} /> : null}
        {data.toll_cost_eur !== undefined && data.toll_cost_eur !== null ? <StatBox label="Putarine" value={formatEUR(data.toll_cost_eur)} /> : null}
      </div>
      {primaryCost !== undefined && primaryCost !== null && primaryCost > 0 && (
        <div className="bg-accent-500/20 border border-accent-500/40 rounded-xl p-3 mb-4">
          <div className="text-white/60 text-xs uppercase tracking-wide">{primaryLabel}</div>
          <div className="text-accent-400 font-bold text-xl">{formatEUR(primaryCost)}</div>
          {data.round_trip_total_eur > 0 && data.total_cost_eur > 0 && (
            <div className="text-white/40 text-xs mt-1">Jedan smjer ≈ {formatEUR(data.total_cost_eur)}</div>
          )}
        </div>
      )}
      {data.route_summary && (
        <div className="mb-3">
          <div className="text-white/50 text-xs uppercase tracking-wide mb-1">Preporučena ruta</div>
          <p className="text-white/80 text-sm">{data.route_summary}</p>
        </div>
      )}
      {data.border_crossings && (
        <div className="mb-3">
          <div className="text-white/50 text-xs uppercase tracking-wide mb-1">Granični prelazi</div>
          <p className="text-white/80 text-sm">{data.border_crossings}</p>
        </div>
      )}
      {data.vignettes_required && (
        <div className="mb-3">
          <div className="text-white/50 text-xs uppercase tracking-wide mb-1">Vinjete / putarine</div>
          <p className="text-white/80 text-sm">{data.vignettes_required}</p>
        </div>
      )}
      {data.suggested_stops?.length > 0 && (
        <div className="mb-3">
          <div className="text-white/50 text-xs uppercase tracking-wide mb-2">Predložene pauze</div>
          <ul className="space-y-2">
            {data.suggested_stops.map((s, i) => (
              <li key={i} className="bg-ink-900/50 rounded-lg p-3 border border-white/5 text-sm">
                <div className="font-semibold text-white">{s.name} {s.duration && <span className="text-white/40 font-normal text-xs">• {s.duration}</span>}</div>
                {s.description && <div className="text-white/60 mt-1">{s.description}</div>}
              </li>
            ))}
          </ul>
        </div>
      )}
      {data.tips && <p className="text-white/70 text-sm pt-3 border-t border-white/5">💡 {data.tips}</p>}
      <div className="mt-4 pt-4 border-t border-white/5 flex flex-wrap gap-2 no-print">
        <a href={buildLinks(form).googleMaps} target="_blank" rel="noreferrer" className="bg-accent-500 hover:bg-accent-400 text-white text-sm font-semibold rounded-lg px-4 py-2 transition-colors">
          🗺️ Otvori rutu na Google Maps →
        </a>
        <a href={buildLinks(form).waze} target="_blank" rel="noreferrer" className="bg-white/10 hover:bg-white/20 text-white text-sm font-semibold rounded-lg px-4 py-2 transition-colors">
          📍 Waze →
        </a>
      </div>
    </div>
  )
}

function GroundRoutesCard({ data, form, type, totalPeople }) {
  const emoji = type === 'bus' ? '🚌' : '🚆'
  const title = type === 'bus' ? 'Autobus' : 'Voz'
  const searchUrl = type === 'bus' ? URLS.flixbus(form) : URLS.omio(form)
  const searchName = type === 'bus' ? 'FlixBus' : 'Omio'
  return (
    <div className="card">
      <div className="section-title">{emoji} {title} <span className="text-white/40 text-sm font-normal">({totalPeople} {totalPeople === 1 ? 'putnik' : 'putnika'})</span></div>
      <ul className="space-y-3">
        {data.map((r, i) => (
          <li key={i} className="bg-ink-900/50 rounded-xl p-4 border border-white/5">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="font-semibold text-white">{r.provider || r.company || 'Prevoznik'}</div>
                <div className="text-white/60 text-sm mt-0.5">{r.departure} → {r.arrival}</div>
                <div className="text-white/40 text-xs mt-1">
                  {r.duration ? r.duration : ''}
                  {r.transfers !== undefined ? ` • ${r.transfers === 0 ? 'direktno' : r.transfers + ' presjedanja'}` : ''}
                </div>
                {r.notes && <div className="text-white/60 text-xs mt-1.5">{r.notes}</div>}
              </div>
              <div className="text-right flex-shrink-0">
                <div className="text-accent-400 font-bold">{formatEUR(r.price_total_eur)}</div>
                <div className="text-white/40 text-xs">ukupno za {totalPeople}</div>
              </div>
            </div>
          </li>
        ))}
      </ul>
      <div className="mt-4 pt-4 border-t border-white/5 flex flex-wrap gap-2 no-print">
        <a href={searchUrl} target="_blank" rel="noreferrer" className="bg-accent-500 hover:bg-accent-400 text-white text-sm font-semibold rounded-lg px-4 py-2 transition-colors">
          🔎 Traži na {searchName} →
        </a>
      </div>
    </div>
  )
}

function StatBox({ label, value }) {
  return (
    <div className="bg-ink-900/50 rounded-xl p-3 border border-white/5">
      <div className="text-white/50 text-xs uppercase tracking-wide">{label}</div>
      <div className="text-white font-bold text-base">{value}</div>
    </div>
  )
}

function AlternativeDatesCard({ data, currentDepart, currentReturn }) {
  return (
    <div className="card avoid-break">
      <div className="section-title">📅 Alternativni datumi (±3 dana)</div>
      <div className="text-white/50 text-sm mb-3">Možda možeš uštedjeti promjenom datuma leta.</div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-white/50 text-left border-b border-white/10">
              <th className="pb-2 pr-4">Polazak</th>
              <th className="pb-2 pr-4">Povratak</th>
              <th className="pb-2 pr-4">Cijena</th>
              <th className="pb-2">Ušteda</th>
            </tr>
          </thead>
          <tbody>
            {data.map((d, i) => {
              const isCurrent = d.depart === currentDepart && d.return === currentReturn
              return (
                <tr key={i} className={`border-b border-white/5 last:border-0 ${isCurrent ? 'bg-white/5' : ''}`}>
                  <td className="py-2 pr-4 text-white">{d.depart} {isCurrent && <span className="text-white/40 text-xs">(trenutno)</span>}</td>
                  <td className="py-2 pr-4 text-white/80">{d.return}</td>
                  <td className="py-2 pr-4 text-white font-semibold">{formatEUR(d.price_total_eur)}</td>
                  <td className="py-2">
                    {d.savings_eur > 0 ? <span className="text-emerald-400 font-semibold">−{formatEUR(d.savings_eur)}</span> : <span className="text-white/40">—</span>}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function AccommodationCard({ data, options, form, totalPeople }) {
  const normalized = (Array.isArray(options) ? options : [])
    .filter(item => item?.name)
    .slice(0, 6)
  const primary = data?.name ? data : normalized[0]
  if (!primary || !primary.name) return null

  const nights = Math.max(1, Math.round((new Date(form.returnDate) - new Date(form.departDate)) / 86400000))
  const rooms = Math.max(1, Math.ceil(totalPeople / 2))
  const allOptions = normalized.length > 0 ? normalized : [primary]
  const priceRange = primary.price_range || allOptions[0]?.price_range || null

  return (
    <div className="card avoid-break">
      <div className="section-title">🏠 Smjestaj <span className="text-white/40 text-sm font-normal">(za {totalPeople} {totalPeople === 1 ? 'osobu' : 'osoba'}, {rooms} {rooms === 1 ? 'soba' : 'sobe'}, {nights} {nights === 1 ? 'noc' : 'noci'})</span></div>

      {/* Tipicne cijene za grad */}
      {priceRange && (
        <div className="bg-sky-500/10 border border-sky-500/20 rounded-xl p-4 mb-4">
          <div className="text-sky-300 text-xs uppercase tracking-wide font-semibold mb-2">Tipicne cijene smjestaja u ovom gradu (ukupno za {rooms} soba x {nights} noci)</div>
          <div className="grid grid-cols-3 gap-3">
            <div className="text-center">
              <div className="text-white/50 text-xs mb-1">Budzet</div>
              <div className="text-white font-bold">~{formatEUR(priceRange.budget * rooms * nights)}</div>
              <div className="text-white/30 text-[10px]">{formatEUR(priceRange.budget)}/soba/noc</div>
            </div>
            <div className="text-center border-x border-sky-500/20">
              <div className="text-sky-300/70 text-xs mb-1">Srednja klasa</div>
              <div className="text-sky-300 font-bold">~{formatEUR(priceRange.mid * rooms * nights)}</div>
              <div className="text-white/30 text-[10px]">{formatEUR(priceRange.mid)}/soba/noc</div>
            </div>
            <div className="text-center">
              <div className="text-white/50 text-xs mb-1">Luksuz</div>
              <div className="text-white font-bold">~{formatEUR(priceRange.luxury * rooms * nights)}</div>
              <div className="text-white/30 text-[10px]">{formatEUR(priceRange.luxury)}/soba/noc</div>
            </div>
          </div>
        </div>
      )}

      {/* Uniformna grid lista svih opcija */}
      <div className="text-white/50 text-sm mb-3">Opcije blizu atrakcija iz OpenStreetMap podataka — provjeri cijene na Booking.com:</div>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
        {allOptions.map((item, index) => {
          const hasTotal = typeof item.total_price_eur === 'number' && item.total_price_eur > 0
          const hasNightly = typeof item.price_per_night_eur === 'number' && item.price_per_night_eur > 0
          const isFirst = index === 0
          return (
            <div key={`${item.name}-${index}`} className={`rounded-xl p-4 border flex flex-col ${isFirst ? 'border-accent-500/30 bg-accent-500/5' : 'border-white/5 bg-ink-900/50'}`}>
              {isFirst && <div className="text-accent-400 text-[10px] font-bold uppercase tracking-wide mb-1">Preporuceno</div>}
              <div className="font-semibold text-white">{item.name}</div>
              <div className="text-white/60 text-sm mt-0.5">{item.area || item.address}</div>
              <div className="flex flex-wrap gap-2 mt-2">
                {item.rating ? <span className="chip">⭐ {item.rating}</span> : null}
                {item.beds ? <span className="chip">🛏️ {item.beds} kreveta</span> : null}
                {item.distance_to_center_km != null ? <span className="chip">📏 {item.distance_to_center_km} km</span> : null}
              </div>
              <div className="mt-3 flex-grow">
                {hasTotal ? (
                  <>
                    <div className="text-accent-400 font-bold">{formatEUR(item.total_price_eur)}</div>
                    <div className="text-white/40 text-xs">{hasNightly ? formatEUR(item.price_per_night_eur) + '/noc · ' : ''}{nights} noci</div>
                  </>
                ) : hasNightly ? (
                  <>
                    <div className="text-accent-400 font-bold">{formatEUR(item.price_per_night_eur * rooms * nights)}</div>
                    <div className="text-white/40 text-xs">{formatEUR(item.price_per_night_eur)}/soba/noc · {rooms} soba · {nights} noci</div>
                  </>
                ) : (
                  <a href={`https://www.booking.com/searchresults.html?ss=${encodeURIComponent(item.name + ' ' + (item.area || ''))}&checkin=${form.departDate}&checkout=${form.returnDate}&group_adults=${form.adults}&group_children=${form.children}&no_rooms=${rooms}`}
                    target="_blank" rel="noreferrer"
                    className="text-accent-400 hover:text-accent-300 text-sm font-semibold transition-colors">
                    Provjeri cijenu na Booking →
                  </a>
                )}
              </div>
            </div>
          )
        })}
      </div>

      <div className="mt-4 pt-4 border-t border-white/5 flex flex-wrap gap-2 no-print">
        <a href={URLS.booking(form)} target="_blank" rel="noreferrer" className="bg-accent-500 hover:bg-accent-400 text-white text-sm font-semibold rounded-lg px-4 py-2 transition-colors">
          🏨 Booking.com →
        </a>
        <a href={URLS.airbnb(form)} target="_blank" rel="noreferrer" className="bg-white/10 hover:bg-white/20 text-white text-sm font-semibold rounded-lg px-4 py-2 transition-colors">
          🏡 Airbnb →
        </a>
        <a href={`https://www.hotels.com/Hotel-Search?${new URLSearchParams({ destination: form.destination, 'date-picker-start': form.departDate, 'date-picker-end': form.returnDate, adults: String(form.adults) })}`}
          target="_blank" rel="noreferrer" className="bg-white/10 hover:bg-white/20 text-white text-sm font-semibold rounded-lg px-4 py-2 transition-colors">
          🛎️ Hotels.com →
        </a>
      </div>
    </div>
  )
}

function AttractionsCard({ data, form }) {
  if (!data || !data.length) return null

  const catEmoji = {
    museum: '🏛️', gallery: '🖼️', palace: '🏰', ancient: '🏺', church: '⛪',
    science: '🔬', zoo: '🦁', aquarium: '🐠', park: '🌿', landmark: '📍',
    viewpoint: '🔭', market: '🛍️', theatre: '🎭', nature: '🌲', attraction: '🎯',
  }

  const withPrice = data.filter(a => a.free || (typeof a.price_eur === 'number' && Number.isFinite(a.price_eur))).length
  const highlights = data.filter(a => a.highlight)

  return (
    <div className="card">
      <div className="section-title">🎯 Must See — top {data.length}</div>

      {/* Highlight strip */}
      {highlights.length > 0 && (
        <div className="mb-4">
          <div className="text-white/40 text-xs uppercase tracking-wide mb-2">Apsolutni must-see</div>
          <div className="flex flex-wrap gap-2">
            {highlights.map((a, i) => (
              <span key={i} className="bg-accent-500/20 border border-accent-500/40 text-accent-400 text-xs font-semibold px-3 py-1.5 rounded-full flex items-center gap-1.5">
                {catEmoji[a.category] || '⭐'} {a.name}
              </span>
            ))}
          </div>
        </div>
      )}

      {withPrice > 0 && (
        <div className="text-white/40 text-xs mb-4">Cijene su okvirne za odrasle. Uvijek provjeri na zvanicnom sajtu atrakcije.</div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {data.map((a, i) => {
          const isFree = a.free || a.price_eur === 0
          const hasPrice = typeof a.price_eur === 'number' && Number.isFinite(a.price_eur) && a.price_eur > 0
          const emoji = catEmoji[a.category] || '🎯'
          return (
            <div key={i} className={`rounded-xl p-4 border flex flex-col ${a.highlight ? 'border-accent-500/30 bg-accent-500/5' : 'border-white/5 bg-ink-900/50'}`}>
              {/* Header */}
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="flex items-start gap-2 min-w-0">
                  <span className="text-lg flex-shrink-0 mt-0.5">{emoji}</span>
                  <div className="font-semibold text-white leading-tight text-sm">{i + 1}. {a.name}</div>
                </div>
                {isFree ? (
                  <span className="flex-shrink-0 bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 text-[10px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap">BESPLATNO</span>
                ) : hasPrice ? (
                  <span className="flex-shrink-0 bg-accent-500/20 border border-accent-500/30 text-accent-400 text-[10px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap">~€{a.price_eur}</span>
                ) : null}
              </div>

              {/* Description */}
              {a.description && (
                <p className="text-white/65 text-xs leading-relaxed mb-2 flex-grow">{a.description}</p>
              )}

              {/* Why visit */}
              {a.why_visit && (
                <div className="flex gap-1.5 mb-2">
                  <span className="text-accent-400 text-xs flex-shrink-0">✦</span>
                  <p className="text-accent-400/80 text-xs italic leading-snug">{a.why_visit}</p>
                </div>
              )}

              {/* Meta chips */}
              <div className="flex flex-wrap gap-1.5 mt-auto">
                {a.area && <span className="chip text-[10px]">📍 {a.area}</span>}
                {a.duration_hours ? <span className="chip text-[10px]">⏱️ {a.duration_hours}h</span> : null}
                {a.category && a.category !== 'attraction' && a.category !== 'landmark' && (
                  <span className="chip text-[10px]">{emoji} {a.category}</span>
                )}
              </div>

              {/* Price note */}
              {a.price_note && (
                <div className={`text-[10px] mt-1.5 ${isFree ? 'text-emerald-400/60' : hasPrice ? 'text-accent-400/60' : 'text-white/30'}`}>
                  {a.price_note}
                </div>
              )}

              <a href={URLS.placeSearch(a.name, form.destination, a.lat, a.lng)} target="_blank" rel="noreferrer"
                className="text-sky-400 hover:text-sky-300 text-[10px] mt-2 inline-block no-print">
                🗺️ Otvori na mapi →
              </a>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function ItineraryCard({ data, attractions }) {
  if (!data || !data.length) return null
  return (
    <div className="card">
      <div className="section-title">📆 Dan-po-dan itinerarij</div>
      <div className="text-white/50 text-sm mb-4">Atrakcije grupisane geografski da izbjegnete nepotrebno hodanje/vožnju.</div>
      <div className="space-y-4">
        {data.map((day, i) => (
          <div key={i} className="bg-ink-900/50 rounded-xl p-4 border border-white/5 avoid-break">
            <div className="flex items-start justify-between gap-3 mb-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="bg-accent-500 text-white font-bold text-sm rounded-lg w-8 h-8 flex items-center justify-center">{day.day}</span>
                  <span className="font-bold text-white text-lg">{day.title}</span>
                </div>
                <div className="text-white/50 text-xs mt-1">{day.date} {day.area ? `• ${day.area}` : ''}</div>
              </div>
              {day.walking_minutes ? <span className="chip text-xs">🚶 ~{day.walking_minutes} min između stopova</span> : null}
            </div>
            {day.attraction_indices?.length > 0 && attractions && (
              <div className="flex flex-wrap gap-2 mb-3">
                {day.attraction_indices.map(idx => {
                  const a = attractions[idx]
                  if (!a) return null
                  return (
                    <span key={idx} className="bg-accent-500/20 border border-accent-500/40 text-accent-400 rounded-lg px-2.5 py-1 text-xs font-medium">
                      {idx + 1}. {a.name}
                    </span>
                  )
                })}
              </div>
            )}
            <div className="space-y-2 text-sm">
              {day.morning && <TimeRow label="Jutro" text={day.morning} />}
              {day.afternoon && <TimeRow label="Popodne" text={day.afternoon} />}
              {day.evening && <TimeRow label="Veče" text={day.evening} />}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function TimeRow({ label, text }) {
  return (
    <div className="flex gap-3">
      <span className="text-white/40 text-xs uppercase tracking-wide w-16 flex-shrink-0 pt-0.5">{label}</span>
      <span className="text-white/80 flex-grow">{text}</span>
    </div>
  )
}

function TransitCard({ data }) {
  if (!data) return null
  const hasAnyPrice = data.single_eur || data.daily_eur || data.weekly_eur
  return (
    <div className="card">
      <div className="section-title">🚆 Javni prevoz u gradu</div>

      {/* Mode badges */}
      {data.modes?.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {data.modes.map(m => {
            const icons = { metro: '🚇', tramvaj: '🚋', autobus: '🚌', 'gradska željeznica': '🚆', bus: '🚌' }
            return (
              <span key={m} className="bg-sky-500/20 border border-sky-500/30 text-sky-300 text-xs font-semibold px-3 py-1 rounded-full">
                {icons[m] || '🚌'} {m.charAt(0).toUpperCase() + m.slice(1)}
              </span>
            )
          })}
        </div>
      )}

      {/* Price table */}
      {hasAnyPrice && (
        <div className="grid grid-cols-3 gap-3 mb-4">
          {data.single_eur !== null && data.single_eur !== undefined && (
            <div className="bg-ink-900/50 rounded-xl p-3 border border-white/5 text-center">
              <div className="text-white/50 text-xs uppercase tracking-wide mb-1">Jedna vožnja</div>
              <div className="text-white font-bold text-lg">{formatEUR(data.single_eur)}</div>
            </div>
          )}
          {data.daily_eur !== null && data.daily_eur !== undefined && (
            <div className="bg-accent-500/15 rounded-xl p-3 border border-accent-500/30 text-center">
              <div className="text-accent-400/80 text-xs uppercase tracking-wide mb-1">Dnevna karta</div>
              <div className="text-accent-400 font-bold text-lg">{formatEUR(data.daily_eur)}</div>
            </div>
          )}
          {data.weekly_eur !== null && data.weekly_eur !== undefined && (
            <div className="bg-emerald-500/10 rounded-xl p-3 border border-emerald-500/20 text-center">
              <div className="text-emerald-400/80 text-xs uppercase tracking-wide mb-1">Sedmična karta</div>
              <div className="text-emerald-400 font-bold text-lg">{formatEUR(data.weekly_eur)}</div>
            </div>
          )}
        </div>
      )}

      {/* Info rows */}
      <div className="space-y-2 text-sm">
        {data.note && (
          <div className="flex items-start gap-2 text-white/70">
            <span className="text-white/40 flex-shrink-0">🎫</span>
            <span>{data.note}</span>
          </div>
        )}
        {data.tourist_pass && (
          <div className="flex items-start gap-2 text-white/70">
            <span className="text-white/40 flex-shrink-0">🗺️</span>
            <span>Turistička karta: <span className="text-white/90 font-medium">{data.tourist_pass}</span></span>
          </div>
        )}
        {data.tips && (
          <div className="flex items-start gap-2 text-white/70">
            <span className="text-accent-400 flex-shrink-0">💡</span>
            <span>{data.tips}</span>
          </div>
        )}
        {!hasAnyPrice && data.recommendation && (
          <p className="text-white/70">{data.recommendation}</p>
        )}
      </div>

      {/* Website link */}
      {data.website && (
        <div className="mt-4 pt-4 border-t border-white/5 no-print">
          <a href={data.website} target="_blank" rel="noreferrer"
            className="bg-sky-500/20 hover:bg-sky-500/30 border border-sky-500/30 text-sky-300 text-sm font-semibold rounded-lg px-4 py-2 transition-colors inline-flex items-center gap-2">
            🌐 Zvanični sajt prevoza →
          </a>
        </div>
      )}
    </div>
  )
}

function WeatherCard({ data, destination }) {
  if (!data) return null

  const weekdays = ['Ned', 'Pon', 'Uto', 'Sri', 'Cet', 'Pet', 'Sub']
  const owIcons = {
    '01': '☀️', '02': '🌤️', '03': '⛅', '04': '☁️',
    '09': '🌧️', '10': '🌦️', '11': '⛈️', '13': '❄️', '50': '🌫️',
  }
  const getIcon = (icon, description) => {
    if (icon) {
      const code = icon.slice(0, 2)
      return owIcons[code] || '🌡️'
    }
    if (!description) return '🌡️'
    const d = description.toLowerCase()
    if (d.includes('sun') || d.includes('vedro') || d.includes('clear')) return '☀️'
    if (d.includes('cloud') || d.includes('oblak')) return '☁️'
    if (d.includes('rain') || d.includes('kisa') || d.includes('pljusak')) return '🌧️'
    if (d.includes('snow') || d.includes('snijeg')) return '❄️'
    if (d.includes('thunder') || d.includes('grmljav')) return '⛈️'
    if (d.includes('fog') || d.includes('magla')) return '🌫️'
    if (d.includes('drizzle') || d.includes('rosulja')) return '🌦️'
    return '🌤️'
  }

  return (
    <div className="card">
      <div className="section-title">
        🌤️ Vrijeme i garderoba
        {destination && <span className="text-white/50 text-sm font-normal">— {destination.split(',')[0]}</span>}
        <span className="chip text-[10px]">{data.source}</span>
      </div>

      {/* Sumarni prikaz */}
      <div className="flex items-baseline gap-4 mb-1">
        <div className="text-3xl font-bold text-white">{data.min_temp_c}° – {data.max_temp_c}°C</div>
        {data.rain_probability && <div className="text-white/60 text-sm">💧 {data.rain_probability}</div>}
      </div>
      {data.forecast_summary && <p className="text-white/60 text-sm mb-4">{data.forecast_summary}</p>}

      {/* Dnevna prognoza - tabela */}
      {data.daily_forecast?.length > 0 && (
        <div className="overflow-x-auto mb-4">
          <div className="flex gap-2 min-w-max pb-1">
            {data.daily_forecast.map((day, i) => {
              const date = new Date(day.date + 'T12:00:00Z')
              const dayName = weekdays[date.getUTCDay()]
              const dayNum = date.getUTCDate()
              const icon = getIcon(day.icon, day.description)
              const isHot = day.max_c >= 30
              const isCold = day.max_c <= 5
              return (
                <div key={i} className="flex flex-col items-center bg-ink-900/50 border border-white/5 rounded-xl px-3 py-2.5 min-w-[64px]">
                  <div className="text-white/40 text-[10px] uppercase tracking-wide">{dayName}</div>
                  <div className="text-white/50 text-[10px] mb-1">{dayNum}.</div>
                  <div className="text-xl mb-1">{icon}</div>
                  <div className={`text-sm font-bold ${isHot ? 'text-orange-400' : isCold ? 'text-sky-400' : 'text-white'}`}>{day.max_c}°</div>
                  <div className="text-white/40 text-xs">{day.min_c}°</div>
                  {day.rain_pct > 0 && (
                    <div className={`text-[10px] mt-1 ${day.rain_pct > 60 ? 'text-sky-400' : 'text-white/40'}`}>💧{day.rain_pct}%</div>
                  )}
                  {day.uvi > 5 && <div className="text-[10px] text-amber-400 mt-0.5">UV {day.uvi}</div>}
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Garderoba */}
      {data.clothing_recommendation && (
        <div className="mt-2 pt-3 border-t border-white/5">
          <div className="text-white/50 text-xs uppercase tracking-wide mb-1">Preporuka garderobe</div>
          <p className="text-white/80 text-sm">{data.clothing_recommendation}</p>
        </div>
      )}
    </div>
  )
}

function FoodCard({ data, form }) {
  if (!data || !data.length) return null
  const groups = { market: [], fast_food: [], restaurant: [] }
  data.forEach(f => { (groups[f.type] || groups.restaurant).push(f) })
  const labels = { market: '🛒 Marketi', fast_food: '🍔 Fast food', restaurant: '🍽️ Restorani' }
  return (
    <div className="card">
      <div className="section-title">🍴 Jelo u blizini smještaja <span className="text-white/40 text-sm font-normal">(lokalno)</span></div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {Object.entries(groups).map(([k, arr]) => arr.length > 0 && (
          <div key={k}>
            <div className="text-white/70 font-semibold text-sm mb-2">{labels[k]}</div>
            <ul className="space-y-2">
              {arr.map((f, i) => (
                <li key={i} className="bg-ink-900/50 rounded-lg p-3 border border-white/5 text-sm">
                  <div className="flex justify-between gap-2">
                    <span className="text-white font-medium">{f.name}</span>
                    {typeof f.avg_price_eur === 'number' && f.avg_price_eur > 0 && (
                      <span className="text-accent-400 font-semibold">{formatEUR(f.avg_price_eur)}</span>
                    )}
                  </div>
                  {f.distance_m !== undefined && f.distance_m !== null && f.distance_m > 0 && <div className="text-white/40 text-xs mt-0.5">{f.distance_m} m</div>}
                  {f.note && <div className="text-white/60 text-xs mt-1">{f.note}</div>}
                  <a href={URLS.placeSearch(f.name, form.destination, f.lat, f.lng)} target="_blank" rel="noreferrer" className="text-sky-400 hover:text-sky-300 text-xs mt-1 inline-block no-print">
                    🗺️ Na mapi →
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  )
}

function ChainRestaurantsCard({ data, form }) {
  if (!data || !data.length) return null
  const valid = data.filter(c => c.name && c.name.trim())
  if (!valid.length) return null

  const chainEmojis = {
    "McDonald's": '🍟', 'KFC': '🍗', 'Burger King': '🍔', 'Subway': '🥪',
    'Starbucks': '☕', 'Pizza Hut': '🍕', "Domino's": '🍕', 'Taco Bell': '🌮',
    'Tim Hortons': '☕', 'Popeyes': '🍗', "Wendy's": '🍔', 'Five Guys': '🍔',
    'Shake Shack': '🍔', 'Costa Coffee': '☕', 'Pret A Manger': '🥗',
  }

  return (
    <div className="card">
      <div className="section-title">🌍 Globalni lanci restorana <span className="text-white/40 text-sm font-normal">(poznati brendovi)</span></div>
      <div className="text-white/50 text-sm mb-4">Pronadjeni u radijusu 10 km od smjestaja. Svaki red prikazuje sve lokacije lanca u gradu.</div>
      <div className="space-y-3">
        {valid.map((c, i) => {
          const emoji = chainEmojis[c.name] || '🍴'
          const officialUrl = URLS.chainOfficial[c.name]
          const locations = c.locations || [{ lat: 0, lng: 0, distance_m: c.distance_m, name: c.name }]
          return (
            <div key={i} className="bg-ink-900/50 rounded-xl p-4 border border-white/5">
              <div className="flex items-center justify-between gap-3 mb-2">
                <div className="font-semibold text-white flex items-center gap-2">
                  <span className="text-xl">{emoji}</span>
                  {c.name}
                  <span className="text-white/40 text-xs font-normal">({locations.length} {locations.length === 1 ? 'lokacija' : 'lokacije'})</span>
                </div>
                {officialUrl && (
                  <a href={officialUrl} target="_blank" rel="noreferrer"
                    className="text-sky-400 hover:text-sky-300 text-xs no-print flex-shrink-0">
                    🔗 Meni
                  </a>
                )}
              </div>
              {/* Lokacije */}
              <div className="flex flex-wrap gap-2">
                {locations.map((loc, j) => (
                  <a
                    key={j}
                    href={URLS.placeSearch(c.name, form.destination, loc.lat, loc.lng)}
                    target="_blank" rel="noreferrer"
                    className="inline-flex items-center gap-1.5 bg-white/5 hover:bg-accent-500/20 border border-white/10 hover:border-accent-500/30 rounded-lg px-3 py-1.5 text-xs text-white/70 hover:text-accent-400 transition-all no-print"
                  >
                    📍 {loc.distance_m > 0 ? `${loc.distance_m < 1000 ? loc.distance_m + ' m' : (loc.distance_m/1000).toFixed(1) + ' km'}` : 'Lokacija'}
                    {loc.address ? ` — ${loc.address}` : ''}
                    <span className="text-white/30">→</span>
                  </a>
                ))}
                {/* Fallback Google Maps pretraga */}
                <a
                  href={`https://www.google.com/maps/search/${encodeURIComponent(c.name + ' ' + form.destination)}`}
                  target="_blank" rel="noreferrer"
                  className="inline-flex items-center gap-1.5 bg-white/5 hover:bg-sky-500/20 border border-white/10 hover:border-sky-500/30 rounded-lg px-3 py-1.5 text-xs text-white/50 hover:text-sky-400 transition-all no-print"
                >
                  🗺️ Sve lokacije na Google Maps
                </a>
              </div>
            </div>
          )
        })}
      </div>
      <div className="mt-3 text-xs text-white/40 italic no-print">
        Lokacije iz OpenStreetMap podataka (10 km radijus). Klikni na dugme za navigaciju.
      </div>
    </div>
  )
}

function VisaCard({ data }) {
  if (!data) return null
  const isRequired = data.visa_required === true
  const isNotRequired = data.visa_required === false
  const isUnknown = !isRequired && !isNotRequired

  return (
    <div className="card avoid-break">
      <div className="section-title">🛂 Viza — BiH pasoš</div>
      <div className="flex items-center gap-2 mb-3 flex-wrap">
        {isRequired && <span className="bg-red-500/20 border border-red-500/40 text-red-300 rounded-lg px-2.5 py-1 text-sm font-semibold">⚠️ Viza potrebna</span>}
        {isNotRequired && <span className="bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 rounded-lg px-2.5 py-1 text-sm font-semibold">✓ Bez vize</span>}
        {isUnknown && <span className="bg-amber-500/20 border border-amber-500/40 text-amber-200 rounded-lg px-2.5 py-1 text-sm font-semibold">❓ Provjeri vizne zahtjeve</span>}
        {data.visa_type && <span className="text-white/70 text-sm">{data.visa_type}</span>}
      </div>
      {isUnknown && (
        <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-3 mb-3 text-amber-200 text-sm">
          Vizni režim nije potvrđen iz javnog zvaničnog API izvora. <strong>OBAVEZNO provjeri</strong> prije putovanja.
        </div>
      )}
      <div className="space-y-1.5 text-sm">
        {data.max_stay_days ? <Row label="Max boravak" value={`${data.max_stay_days} dana`} /> : null}
        {data.passport_validity_required_months ? <Row label="Važenje pasoša" value={`min. ${data.passport_validity_required_months} mjeseci`} /> : null}
        {data.processing_time && <Row label="Vrijeme obrade" value={data.processing_time} />}
      </div>
      {data.documents_needed?.length > 0 && (
        <div className="mt-3 pt-3 border-t border-white/5">
          <div className="text-white/50 text-xs uppercase tracking-wide mb-1">Potrebni dokumenti</div>
          <div className="flex flex-wrap gap-1.5">
            {data.documents_needed.map((d, i) => <span key={i} className="chip text-xs">{d}</span>)}
          </div>
        </div>
      )}
      {data.notes && <p className="text-white/70 text-sm mt-3 pt-3 border-t border-white/5">⚠️ {data.notes}</p>}
      {data.official_url && (
        <a href={data.official_url} target="_blank" rel="noreferrer" className="text-sky-400 hover:text-sky-300 text-xs mt-2 inline-block no-print">
          Provjeri zvanični izvor →
        </a>
      )}
    </div>
  )
}

function EmergencyCard({ data }) {
  if (!data) return null
  const emb = data.bih_embassy
  const hasEmbassy = emb && (emb.address || emb.phone || emb.email || emb.notes)
  return (
    <div className="card avoid-break">
      <div className="section-title">🚨 Hitni brojevi & ambasada BiH</div>
      <div className="space-y-1.5 text-sm mb-4">
        {data.general_emergency && <Row label="Opća pomoć" value={data.general_emergency} />}
        {data.police && <Row label="Policija" value={data.police} />}
        {data.ambulance && <Row label="Hitna pomoć" value={data.ambulance} />}
        {data.fire && <Row label="Vatrogasci" value={data.fire} />}
      </div>
      {hasEmbassy && (
        <div className="pt-3 border-t border-white/5">
          <div className="text-white/50 text-xs uppercase tracking-wide mb-2">Ambasada BiH {emb.city ? `• ${emb.city}` : ''}</div>
          <div className="space-y-1 text-sm">
            {emb.address && <div className="text-white/80">📍 {emb.address}</div>}
            {emb.phone && <div className="text-white/80">📞 {emb.phone}</div>}
            {emb.email && <div className="text-white/80">✉️ {emb.email}</div>}
            {emb.notes && <div className="text-white/60 text-xs italic mt-1">{emb.notes}</div>}
          </div>
        </div>
      )}
    </div>
  )
}

function BudgetCard({ data, notes, totalPeople, plan, form }) {
  const nights = form ? Math.max(1, Math.round((new Date(form.returnDate) - new Date(form.departDate)) / 86400000)) : 1
  const rooms = Math.max(1, Math.ceil(totalPeople / 2))

  // Sagradi listu stavki: live cijene + procjene
  const items = []
  const missingNotes = []

  // Prevoz - live
  if (data?.Prevoz > 0) {
    items.push({ label: 'Prevoz', value: data.Prevoz, exact: true })
  } else {
    missingNotes.push('Prevoz: nije dostupna live cijena — pretrazuj na flight search linkovima iznad.')
  }

  // Smjestaj - live ili procjena
  if (data?.Smjestaj > 0 || data?.Smještaj > 0) {
    items.push({ label: 'Smjestaj', value: data.Smjestaj || data.Smještaj, exact: true })
  } else {
    const range = plan?.accommodation?.price_range || plan?.accommodation_options?.[0]?.price_range
    if (range?.mid) {
      const est = Math.round(range.mid * rooms * nights)
      items.push({ label: 'Smjestaj (procjena)', value: est, exact: false, hint: `~${range.mid} EUR/soba/noc x ${rooms} soba x ${nights} noci` })
    } else {
      missingNotes.push('Smjestaj: nema live cijene — dodano iz okvirnih cijena u sekciji smjestaja.')
    }
  }

  // Atrakcije
  if (data?.Atrakcije > 0) {
    items.push({ label: 'Atrakcije', value: data.Atrakcije, exact: true })
  } else {
    missingNotes.push('Atrakcije: nema javnih cijena u OSM podacima za ovu destinaciju.')
  }

  // Javni prevoz - procjena
  const transit = plan?.transit
  if (transit?.daily_eur || transit?.weekly_eur) {
    const weeks = Math.floor(nights / 7)
    const remDays = nights % 7
    let transitTotal = 0
    if (transit.weekly_eur && weeks > 0) transitTotal += transit.weekly_eur * weeks * totalPeople
    if (transit.daily_eur && remDays > 0) transitTotal += transit.daily_eur * remDays * totalPeople
    if (transitTotal > 0) {
      items.push({ label: 'Javni prevoz (procjena)', value: Math.round(transitTotal), exact: false, hint: `dnevna ${transit.daily_eur ? transit.daily_eur + ' EUR' : '-'}, sedmicna ${transit.weekly_eur ? transit.weekly_eur + ' EUR' : '-'} x ${totalPeople} osoba` })
    }
  }

  const exactTotal = items.filter(i => i.exact).reduce((s, i) => s + i.value, 0)
  const estimatedTotal = items.reduce((s, i) => s + i.value, 0)

  if (!items.length) return null

  return (
    <div className="card avoid-break">
      <div className="section-title">💰 Okvirni budzet <span className="text-white/40 text-sm font-normal">(za {totalPeople} {totalPeople === 1 ? 'osobu' : 'osoba'}, {nights} {nights === 1 ? 'noc' : 'noci'})</span></div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
        {items.map((item) => (
          <div key={item.label} className={`rounded-xl p-3 border ${item.exact ? 'bg-ink-900/50 border-white/5' : 'bg-amber-500/5 border-amber-500/20'}`}>
            <div className="text-white/50 text-xs uppercase tracking-wide">{item.label}</div>
            <div className={`font-bold text-lg ${item.exact ? 'text-white' : 'text-amber-300'}`}>
              {item.exact ? '' : '~'}{new Intl.NumberFormat('bs-BA', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(item.value)}
            </div>
            {item.hint && <div className="text-white/30 text-[10px] mt-0.5 leading-tight">{item.hint}</div>}
          </div>
        ))}

        {/* UKUPNO */}
        <div className="rounded-xl p-3 border bg-accent-500/20 border-accent-500/40">
          <div className="text-white/50 text-xs uppercase tracking-wide">Ukupno</div>
          <div className="text-accent-400 font-bold text-lg">
            ~{new Intl.NumberFormat('bs-BA', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(estimatedTotal)}
          </div>
          {exactTotal !== estimatedTotal && (
            <div className="text-white/30 text-[10px] mt-0.5">live: {new Intl.NumberFormat('bs-BA', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(exactTotal)}</div>
          )}
        </div>
      </div>

      <div className="bg-amber-500/5 border border-amber-500/15 rounded-xl p-3 mb-3 text-xs text-amber-200/70">
        <span className="font-semibold text-amber-300">Legenda:</span> bijele cijene = live/provjerene, <span className="text-amber-300">narancaste</span> = procjene na osnovu tipicnih cijena za grad.
      </div>

      {missingNotes.length > 0 && (
        <div className="mt-2 pt-3 border-t border-white/5">
          <div className="text-white/40 text-xs uppercase tracking-wide mb-1.5">Nije ukljuceno u budzet</div>
          <ul className="space-y-1 text-xs text-white/50">
            {missingNotes.map((n, i) => <li key={i} className="flex gap-1.5"><span>•</span><span>{n}</span></li>)}
          </ul>
        </div>
      )}
    </div>
  )
}

function TipsCard({ data }) {
  if (!data || !data.length) return null
  const filled = data.filter(t => t && t.trim())
  if (!filled.length) return null
  return (
    <div className="card avoid-break">
      <div className="section-title">💡 Savjeti</div>
      <ul className="space-y-2 text-sm text-white/80">
        {filled.map((t, i) => <li key={i} className="flex gap-2"><span className="text-accent-400">•</span><span>{t}</span></li>)}
      </ul>
    </div>
  )
}

function Row({ label, value }) {
  return (
    <div className="flex justify-between items-center py-1.5 border-b border-white/5 last:border-0">
      <span className="text-white/70">{label}</span>
      <span className="text-white font-semibold">{value}</span>
    </div>
  )
}

function ScrollToTop() {
  const [visible, setVisible] = useState(false)
  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 500)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])
  return (
    <button
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      className={`scroll-top-btn no-print ${visible ? '' : 'hidden'}`}
      title="Nazad na vrh — na formu za unos"
      aria-label="Scroll to top"
    >
      ↑
    </button>
  )
}

function HolidaysCard({ data, departDate, returnDate }) {
  if (!data) return null
  if (!data.all?.length) return (
    <div className="card border-emerald-500/10 bg-emerald-500/5">
      <div className="flex items-center gap-2 text-emerald-400 text-sm font-semibold">
        <span>🗓️</span> Nema državnih praznika u {data.country || 'destinaciji'} tokom vašeg boravka
      </div>
    </div>
  )
  return (
    <div className="card border-amber-500/20">
      <div className="section-title">🗓️ Državni praznici</div>
      <p className="text-white/55 text-sm mb-3">
        Tokom vašeg boravka u {data.country} ima {data.all.length} državni {data.all.length === 1 ? 'praznik' : 'praznika'} — neke atrakcije i radnje mogu biti zatvorene.
      </p>
      <div className="space-y-2">
        {data.all.map((h, i) => (
          <div key={i} className="flex items-center gap-3 bg-amber-500/8 border border-amber-500/20 rounded-xl px-4 py-2.5">
            <span className="text-amber-400 text-lg">⚠️</span>
            <div className="flex-grow">
              <div className="text-white font-semibold text-sm">{h.localName || h.name}</div>
              {h.localName && h.localName !== h.name && (
                <div className="text-white/40 text-xs">{h.name}</div>
              )}
            </div>
            <div className="text-amber-300 font-mono text-sm flex-shrink-0">{h.date}</div>
          </div>
        ))}
      </div>
      <div className="mt-3 text-white/30 text-xs">Izvor: date.nager.at — javni praznici za {data.countryCode}</div>
    </div>
  )
}

function GroqStatusBar({ limits }) {
  if (!limits?.remainingTokens) return null
  const remaining = parseInt(limits.remainingTokens) || 0
  const total = parseInt(limits.limitTokens) || 6000
  const pct = Math.min(100, Math.round((remaining / total) * 100))
  const color = pct > 50 ? 'bg-emerald-500' : pct > 20 ? 'bg-amber-500' : 'bg-rose-500'
  const textColor = pct > 50 ? 'text-emerald-400' : pct > 20 ? 'text-amber-400' : 'text-rose-400'
  return (
    <div className="flex items-center gap-3 px-1 py-1 no-print">
      <div className="flex items-center gap-2 text-xs text-white/40">
        <span>Groq API:</span>
        <div className="w-24 h-1.5 bg-white/10 rounded-full overflow-hidden">
          <div className={`h-full rounded-full ${color} transition-all`} style={{ width: pct + '%' }} />
        </div>
        <span className={textColor}>{remaining.toLocaleString()} tokena</span>
        {limits.resetTokens && <span className="text-white/25">reset za {limits.resetTokens}</span>}
      </div>
    </div>
  )
}

function TouristTrapsCard({ data }) {
  if (!data?.length) return null
  const severityColor = { 'Low': 'text-amber-400 bg-amber-500/10 border-amber-500/20', 'Medium': 'text-orange-400 bg-orange-500/10 border-orange-500/20', 'High': 'text-rose-400 bg-rose-500/10 border-rose-500/20' }
  const catEmoji = { scam: '🎭', overpriced: '💸', crowded: '👥', unsafe: '⚠️', misleading: '🔀' }
  return (
    <div className="card">
      <div className="section-title">⚠️ Zamke za turiste</div>
      <p className="text-white/55 text-sm mb-4">Uobicajene prevare i situacije na koje treba paziti u ovom gradu.</p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {data.map((trap, i) => (
          <div key={i} className={`rounded-xl p-4 border ${severityColor[trap.severity] || 'text-white/60 bg-white/5 border-white/10'}`}>
            <div className="flex items-center justify-between gap-2 mb-2">
              <div className="flex items-center gap-2">
                <span className="text-lg">{catEmoji[trap.category] || '⚠️'}</span>
                <span className="font-semibold text-sm">{trap.title}</span>
              </div>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${severityColor[trap.severity] || ''}`}>{trap.severity}</span>
            </div>
            <p className="text-xs leading-relaxed mb-2 opacity-80">{trap.description}</p>
            <div className="flex gap-1.5 text-xs">
              <span className="text-emerald-400 flex-shrink-0">✓</span>
              <span className="opacity-75">{trap.avoid}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function CurrencyCard({ data, destination }) {
  if (!data || data.is_eur) return null
  const city = destination ? destination.split(',')[0].trim() : ''
  return (
    <div className="card">
      <div className="section-title">💱 Valuta — {data.name} ({data.code})</div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <div className="bg-ink-900/50 rounded-xl p-4 border border-white/5 text-center">
          <div className="text-white/40 text-xs uppercase tracking-wide mb-1">1 EUR =</div>
          <div className="text-accent-400 font-black text-2xl">~{data.approx_rate}</div>
          <div className="text-white/60 text-sm">{data.symbol || data.code}</div>
        </div>
        <div className="md:col-span-2 bg-ink-900/50 rounded-xl p-4 border border-white/5">
          <div className="text-white/40 text-xs uppercase tracking-wide mb-2">Tipicne cijene u {city}</div>
          {data.typical_costs && (
            <div className="space-y-1.5">
              {Object.entries(data.typical_costs).map(([key, val]) => {
                const labels = { coffee: '☕ Kafa', budget_meal: '🍽️ Jeftin obrok', taxi_5km: '🚕 Taksi 5km', beer: '🍺 Pivo', water: '💧 Voda', metro: '🚇 Metro karta' }
                return (
                  <div key={key} className="flex justify-between text-sm">
                    <span className="text-white/60">{labels[key] || key}</span>
                    <span className="text-white font-semibold">{val}</span>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
      {data.rate_note && <p className="text-white/50 text-xs mb-3 italic">{data.rate_note}</p>}
      {data.exchange_tips?.length > 0 && (
        <div>
          <div className="text-white/40 text-xs uppercase tracking-wide mb-2">Savjeti za zamjenu</div>
          <ul className="space-y-1.5">
            {data.exchange_tips.map((tip, i) => (
              <li key={i} className="flex gap-2 text-sm text-white/70">
                <span className="text-accent-400 flex-shrink-0">•</span>
                <span>{tip}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
      <div className="mt-4 pt-3 border-t border-white/5 no-print">
        <a href={'https://www.xe.com/currencyconverter/convert/?Amount=1&From=EUR&To=' + data.code}
          target="_blank" rel="noreferrer"
          className="inline-flex items-center gap-2 bg-white/8 hover:bg-white/15 border border-white/10 text-white/70 text-sm font-semibold rounded-lg px-4 py-2 transition-colors">
          💱 Live kurs na XE.com →
        </a>
      </div>
    </div>
  )
}

function Footer({ onAbout }) {
  return (
    <footer className="max-w-6xl mx-auto px-4 sm:px-6 py-8 text-center text-white/30 text-xs no-print">
      Podaci dolaze iz javnih web/API izvora. Ako neka kategorija nema slobodan live izvor, aplikacija je ne popunjava izmišljenim podacima. Mapa © OpenStreetMap.
      {' • '}
      <button onClick={onAbout} className="underline hover:text-white/60">O aplikaciji</button>
    </footer>
  )
}

function AboutModal({ onClose }) {
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose])

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm no-print p-4" onClick={onClose}>
      <div className="bg-ink-800 border border-white/10 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl" onClick={(e) => e.stopPropagation()}>

        {/* Header */}
        <div className="sticky top-0 bg-ink-800 border-b border-white/10 px-6 py-4 flex items-center justify-between z-10">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <span className="w-8 h-8 rounded-lg bg-gradient-to-br from-accent-400 to-accent-500 flex items-center justify-center">
              <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4 text-white"><path d="M2 12l20-9-9 20-2-9-9-2z" fill="currentColor"/></svg>
            </span>
            O aplikaciji
          </h2>
          <button onClick={onClose} aria-label="Zatvori" className="text-white/40 hover:text-white text-2xl leading-none w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/10">x</button>
        </div>

        <div className="px-6 py-5 space-y-5">

          {/* Autor */}
          <div className="flex items-center gap-4 bg-gradient-to-r from-accent-500/20 to-accent-400/10 border border-accent-500/30 rounded-xl p-4">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-accent-400 to-accent-500 flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
              AC
            </div>
            <div>
              <div className="text-white font-bold text-base">Alan Catovic</div>
              <div className="text-accent-400 text-sm">Autor aplikacije</div>
              <a
                href="mailto:acatovic@gmail.com"
                className="text-white/50 hover:text-accent-400 text-xs mt-0.5 inline-block transition-colors"
              >
                acatovic@gmail.com
              </a>
            </div>
          </div>

          {/* Opis */}
          <p className="text-white/80 text-sm leading-relaxed">
            <span className="font-semibold text-white">Putni Planer</span> generiše kompletan plan putovanja u jednom kliku — prevoz, smještaj, muzeje i atrakcije, itinerarij, mapa, viza, valuta, zamke za turiste i budžet, sve iz javno dostupnih live izvora. Ništa se ne izmišlja — ako podatak nije dostupan, aplikacija to kaže.
          </p>

          {/* Funkcionalnosti */}
          <div>
            <h3 className="text-accent-400 font-semibold text-sm uppercase tracking-wide mb-3">Funkcionalnosti</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-sm">
              <FeatureItem emoji="📍" text="GPS detekcija polazne lokacije" color="sky" />
              <FeatureItem emoji="🌍" text="Gdje da idem? — AI + live cijene letova" color="sky" />
              <FeatureItem emoji="✈️" text="Prevoz: avion, auto, autobus, voz" color="sky" />
              <FeatureItem emoji="🔗" text="Dijeli plan — link s popunjenom formom" color="sky" />
              <FeatureItem emoji="🏙️" text="Info o gradu: demografija, kriminal, religija" color="emerald" />
              <FeatureItem emoji="🗓️" text="Državni praznici tokom boravka" color="emerald" />
              <FeatureItem emoji="🏛️" text="12 muzeja i atrakcija s opisima (AI kurirana)" color="emerald" />
              <FeatureItem emoji="📆" text="Dan-po-dan itinerarij" color="emerald" />
              <FeatureItem emoji="🗺️" text="Interaktivna mapa (OpenStreetMap)" color="emerald" />
              <FeatureItem emoji="🏠" text="Smještaj u blizini + tipične cijene" color="amber" />
              <FeatureItem emoji="🚆" text="Javni prevoz: cijene karata + tourist pass" color="amber" />
              <FeatureItem emoji="🌤️" text="Vremenska prognoza + odjeća" color="amber" />
              <FeatureItem emoji="🍴" text="Hrana i lanci (McDonald's, KFC...) u blizini" color="amber" />
              <FeatureItem emoji="⚠️" text="Zamke za turiste — konkretne prevare" color="red" />
              <FeatureItem emoji="💱" text="Valuta: kurs EUR + tipične cijene" color="red" />
              <FeatureItem emoji="🛂" text="Viza za BiH pasoš — provjera" color="red" />
              <FeatureItem emoji="🚨" text="Hitni brojevi + ambasada BiH" color="red" />
              <FeatureItem emoji="💰" text="Okvirni budžet: live + procjene" color="red" />
              <FeatureItem emoji="☀️" text="Light/Dark tema" color="sky" />
              <FeatureItem emoji="📄" text="Export plana u PDF (print)" color="sky" />
            </div>
          </div>

          {/* Kako radi */}
          <div>
            <h3 className="text-accent-400 font-semibold text-sm uppercase tracking-wide mb-3">Kako radi</h3>
            <ol className="space-y-2 text-sm text-white/75">
              {[
                'Unesi polazak (GPS ili ručno), destinaciju, datume, putnike i prevoz — ili klikni "Gdje da idem?" za AI preporuke s live cijenama letova (Travelpayouts)',
                'Backend geocodira lokacije i paralelno poziva 10+ API izvora odjednom',
                'Groq AI (Llama 3.3 70B) generiše: muzeje s opisima, zamke za turiste, valutu, info o gradu i viza status za BiH pasoš',
                'OpenStreetMap / Overpass povlači tačke interesa, restorane, smještaj i javni prevoz',
                'Open-Meteo ili OpenWeatherMap daje vremensku prognozu za period boravka',
                'date.nager.at provjerava državne praznike u destinaciji za tvoje datume',
                'Sve se spaja u jedan kompletan plan — ako neka kategorija nema live podataka, jasno je označena a ne izmišljena',
              ].map((step, i) => (
                <li key={i} className="flex gap-3">
                  <span className="flex-shrink-0 w-5 h-5 rounded-full bg-accent-500/30 border border-accent-500/50 text-accent-400 text-xs font-bold flex items-center justify-center mt-0.5">{i + 1}</span>
                  <span>{step}</span>
                </li>
              ))}
            </ol>
          </div>

          {/* Tehnologije */}
          <div>
            <h3 className="text-accent-400 font-semibold text-sm uppercase tracking-wide mb-3">Tehnologije i izvori</h3>
            <div className="flex flex-wrap gap-1.5 text-xs">
              {[
                'React + Vite', 'Tailwind CSS', 'Cloudflare Pages Functions',
                'Groq AI — Llama 3.3 70B', 'OpenStreetMap / Overpass',
                'Travelpayouts (live letovi)', 'Open-Meteo + OpenWeatherMap',
                'OSRM (auto ruting)', 'RestCountries API',
                'date.nager.at (praznici)', 'Leaflet.js (mapa)',
                'Amadeus (opciono)',
              ].map(tech => (
                <span key={tech} className="bg-white/8 border border-white/10 text-white/70 px-2.5 py-1 rounded-full">{tech}</span>
              ))}
            </div>
          </div>

          {/* Privatnost */}
          <div className="bg-ink-900/50 rounded-xl p-4 border border-white/5 text-sm">
            <div className="text-white/50 text-xs uppercase tracking-wide mb-1.5">Privatnost</div>
            <p className="text-white/65 leading-relaxed">
              Aplikacija ne čuva tvoje podatke na serveru. Lokacija se koristi samo lokalno u browseru (sprema se u localStorage). Upiti se šalju samo javnim servisima potrebnim za geokodiranje, rute i lokacije.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-ink-800 border-t border-white/10 px-6 py-3 flex items-center justify-between">
          <span className="text-white/30 text-xs">v3.0 • 2025/26 Alan Catovic</span>
          <button onClick={onClose} className="bg-accent-500 hover:bg-accent-400 text-white text-sm font-semibold rounded-lg px-4 py-2 transition-colors">Zatvori</button>
        </div>
      </div>
    </div>
  )
}

function FeatureItem({ emoji, text, color }) {
  const colors = {
    sky:     'text-sky-400',
    emerald: 'text-emerald-400',
    amber:   'text-amber-400',
    red:     'text-rose-400',
  }
  return (
    <div className="flex items-start gap-2 bg-white/3 rounded-lg px-2.5 py-1.5">
      <span className="flex-shrink-0 text-base">{emoji}</span>
      <span className={`text-xs leading-snug ${colors[color] || 'text-white/75'}`}>{text}</span>
    </div>
  )
}
