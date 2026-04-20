const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions'
const GROQ_MODELS = ['llama-3.3-70b-versatile', 'llama-3.1-8b-instant', 'mixtral-8x7b-32768']

// --- IATA lookup: city name (lowercase) -> IATA airport code -------------------
const CITY_TO_IATA = {
  // BiH
  'sarajevo': 'SJJ', 'banja luka': 'BNX', 'tuzla': 'TZL', 'mostar': 'OMO',
  // Ex-Yu
  'zagreb': 'ZAG', 'split': 'SPU', 'dubrovnik': 'DBV', 'rijeka': 'RJK',
  'beograd': 'BEG', 'belgrade': 'BEG', 'nis': 'INI', 'novi sad': 'BEG',
  'ljubljana': 'LJU', 'skopje': 'SKP', 'podgorica': 'TGD', 'tivat': 'TIV',
  'pristina': 'PRN', 'prishtina': 'PRN',
  // Europe
  'london': 'LHR', 'paris': 'CDG', 'amsterdam': 'AMS', 'frankfurt': 'FRA',
  'munich': 'MUC', 'berlin': 'BER', 'rome': 'FCO', 'milan': 'MXP',
  'madrid': 'MAD', 'barcelona': 'BCN', 'lisbon': 'LIS', 'porto': 'OPO',
  'vienna': 'VIE', 'zurich': 'ZRH', 'brussels': 'BRU', 'stockholm': 'ARN',
  'oslo': 'OSL', 'copenhagen': 'CPH', 'helsinki': 'HEL', 'riga': 'RIX',
  'tallinn': 'TLL', 'vilnius': 'VNO', 'warsaw': 'WAW', 'krakow': 'KRK',
  'prague': 'PRG', 'bratislava': 'BTS', 'budapest': 'BUD', 'bucharest': 'OTP',
  'sofia': 'SOF', 'athens': 'ATH', 'thessaloniki': 'SKG', 'istanbul': 'IST',
  'ankara': 'ESB', 'antalya': 'AYT', 'izmir': 'ADB',
  'nice': 'NCE', 'lyon': 'LYS', 'marseille': 'MRS', 'bordeaux': 'BOD',
  'dusseldorf': 'DUS', 'hamburg': 'HAM', 'cologne': 'CGN', 'stuttgart': 'STR',
  'venice': 'VCE', 'naples': 'NAP', 'palermo': 'PMO', 'catania': 'CTA',
  'dublin': 'DUB', 'edinburgh': 'EDI', 'manchester': 'MAN', 'birmingham': 'BHX',
  'geneva': 'GVA', 'basel': 'BSL', 'innsbruck': 'INN', 'salzburg': 'SZG',
  'malaga': 'AGP', 'alicante': 'ALC', 'palma': 'PMI', 'tenerife': 'TFS',
  'lanzarote': 'ACE', 'fuerteventura': 'FUE', 'gran canaria': 'LPA',
  'reykjavik': 'REK', 'valletta': 'MLA', 'nicosia': 'LCA', 'limassol': 'LCA',
  'chisinau': 'KIV', 'minsk': 'MSQ', 'kyiv': 'KBP', 'odessa': 'ODS',
  'tbilisi': 'TBS', 'yerevan': 'EVN', 'baku': 'GYD',
  // Opcina Novi Grad area -> Sarajevo
  'novi grad': 'SJJ', 'opcina novi grad': 'SJJ', 'ilidza': 'SJJ',
  'lukavica': 'SJJ', 'hadzici': 'SJJ', 'vogosca': 'SJJ',
}

// IATA -> city name + country info for Groq
const IATA_TO_CITY = {
  'VIE': { city: 'Vienna', country: 'Austria', flag: 'AT' },
  'BCN': { city: 'Barcelona', country: 'Spain', flag: 'ES' },
  'MAD': { city: 'Madrid', country: 'Spain', flag: 'ES' },
  'CDG': { city: 'Paris', country: 'France', flag: 'FR' },
  'LHR': { city: 'London', country: 'United Kingdom', flag: 'GB' },
  'AMS': { city: 'Amsterdam', country: 'Netherlands', flag: 'NL' },
  'FCO': { city: 'Rome', country: 'Italy', flag: 'IT' },
  'MXP': { city: 'Milan', country: 'Italy', flag: 'IT' },
  'FRA': { city: 'Frankfurt', country: 'Germany', flag: 'DE' },
  'MUC': { city: 'Munich', country: 'Germany', flag: 'DE' },
  'BER': { city: 'Berlin', country: 'Germany', flag: 'DE' },
  'LIS': { city: 'Lisbon', country: 'Portugal', flag: 'PT' },
  'OPO': { city: 'Porto', country: 'Portugal', flag: 'PT' },
  'ZRH': { city: 'Zurich', country: 'Switzerland', flag: 'CH' },
  'GVA': { city: 'Geneva', country: 'Switzerland', flag: 'CH' },
  'BRU': { city: 'Brussels', country: 'Belgium', flag: 'BE' },
  'ARN': { city: 'Stockholm', country: 'Sweden', flag: 'SE' },
  'OSL': { city: 'Oslo', country: 'Norway', flag: 'NO' },
  'CPH': { city: 'Copenhagen', country: 'Denmark', flag: 'DK' },
  'HEL': { city: 'Helsinki', country: 'Finland', flag: 'FI' },
  'RIX': { city: 'Riga', country: 'Latvia', flag: 'LV' },
  'TLL': { city: 'Tallinn', country: 'Estonia', flag: 'EE' },
  'VNO': { city: 'Vilnius', country: 'Lithuania', flag: 'LT' },
  'WAW': { city: 'Warsaw', country: 'Poland', flag: 'PL' },
  'KRK': { city: 'Krakow', country: 'Poland', flag: 'PL' },
  'PRG': { city: 'Prague', country: 'Czech Republic', flag: 'CZ' },
  'BTS': { city: 'Bratislava', country: 'Slovakia', flag: 'SK' },
  'BUD': { city: 'Budapest', country: 'Hungary', flag: 'HU' },
  'OTP': { city: 'Bucharest', country: 'Romania', flag: 'RO' },
  'SOF': { city: 'Sofia', country: 'Bulgaria', flag: 'BG' },
  'ATH': { city: 'Athens', country: 'Greece', flag: 'GR' },
  'SKG': { city: 'Thessaloniki', country: 'Greece', flag: 'GR' },
  'IST': { city: 'Istanbul', country: 'Turkey', flag: 'TR' },
  'AYT': { city: 'Antalya', country: 'Turkey', flag: 'TR' },
  'DUB': { city: 'Dublin', country: 'Ireland', flag: 'IE' },
  'EDI': { city: 'Edinburgh', country: 'United Kingdom', flag: 'GB' },
  'MAN': { city: 'Manchester', country: 'United Kingdom', flag: 'GB' },
  'NCE': { city: 'Nice', country: 'France', flag: 'FR' },
  'VCE': { city: 'Venice', country: 'Italy', flag: 'IT' },
  'NAP': { city: 'Naples', country: 'Italy', flag: 'IT' },
  'AGP': { city: 'Malaga', country: 'Spain', flag: 'ES' },
  'PMI': { city: 'Palma de Mallorca', country: 'Spain', flag: 'ES' },
  'MLA': { city: 'Valletta', country: 'Malta', flag: 'MT' },
  'LCA': { city: 'Larnaca', country: 'Cyprus', flag: 'CY' },
  'REK': { city: 'Reykjavik', country: 'Iceland', flag: 'IS' },
  'TBS': { city: 'Tbilisi', country: 'Georgia', flag: 'GE' },
  'BEG': { city: 'Belgrade', country: 'Serbia', flag: 'RS' },
  'ZAG': { city: 'Zagreb', country: 'Croatia', flag: 'HR' },
  'DBV': { city: 'Dubrovnik', country: 'Croatia', flag: 'HR' },
  'SPU': { city: 'Split', country: 'Croatia', flag: 'HR' },
  'LJU': { city: 'Ljubljana', country: 'Slovenia', flag: 'SI' },
  'SKP': { city: 'Skopje', country: 'North Macedonia', flag: 'MK' },
  'TGD': { city: 'Podgorica', country: 'Montenegro', flag: 'ME' },
  'TIV': { city: 'Tivat', country: 'Montenegro', flag: 'ME' },
  'PRN': { city: 'Pristina', country: 'Kosovo', flag: 'XK' },
}

// City name -> IATA (fuzzy)
function cityToIata(cityName) {
  const lower = cityName.toLowerCase().replace(/[^a-z\s]/g, '').trim()
  if (CITY_TO_IATA[lower]) return CITY_TO_IATA[lower]
  // Try partial match
  for (const [key, code] of Object.entries(CITY_TO_IATA)) {
    if (lower.includes(key) || key.includes(lower.substring(0, 5))) return code
  }
  return null
}

// Fetch cheapest flights from Travelpayouts
async function fetchTravelpayoutsFlights(originIata, departDate, returnDate, token) {
  try {
    const month = departDate.slice(0, 7) // YYYY-MM
    const returnMonth = (returnDate || departDate).slice(0, 7)
    const url = 'https://api.travelpayouts.com/v1/prices/cheap?origin=' + originIata +
      '&destination=-&depart_date=' + month +
      (returnDate ? '&return_date=' + returnMonth : '') +
      '&currency=eur&limit=30'

    const resp = await fetch(url, {
      headers: { 'X-Access-Token': token },
    })

    if (!resp.ok) {
      console.error('Travelpayouts error:', resp.status)
      return null
    }

    const data = await resp.json()
    if (!data || !data.data) return null

    // data.data is { "VIE": { "0": { price, transfers, ... } }, ... }
    const results = []
    for (const [iata, routes] of Object.entries(data.data)) {
      const cityInfo = IATA_TO_CITY[iata]
      if (!cityInfo) continue
      // Get cheapest route (key "0")
      const cheapest = routes['0'] || Object.values(routes)[0]
      if (!cheapest || !cheapest.price) continue
      results.push({
        iata,
        city: cityInfo.city,
        country: cityInfo.country,
        flag: cityInfo.flag,
        price_eur: Math.round(cheapest.price),
        transfers: cheapest.transfers || 0,
      })
    }

    // Sort by price
    return results.sort((a, b) => a.price_eur - b.price_eur).slice(0, 20)
  } catch (e) {
    console.error('Travelpayouts fetch error:', e && e.message)
    return null
  }
}

// Call Groq with real flight prices
async function groqEnrichWithPrices(flights, cityOrigin, departDate, nights, adultsN, childrenN, apiKey) {
  const flightList = flights.map(f =>
    f.city + ' (' + f.country + '): ' + f.price_eur + ' EUR return' + (f.transfers > 0 ? ', ' + f.transfers + ' stop' : ', direct')
  ).join('\n')

  const prompt = 'Traveler departs from "' + cityOrigin + '" on ' + departDate + ' for ' + nights + ' nights (' + adultsN + ' adults, ' + childrenN + ' children). Bosnian (BiH) passport.\n\nREAL flight prices (return economy, from live data):\n' + flightList + '\n\nSelect the 6 best destinations from the list above. Return ONLY a JSON array. Start with [.\n\nEach object: city, country, flag (2-letter ISO), tagline (short), why_now (seasonal reason), estimated_flight_eur (use the REAL price above), avg_daily_budget_eur (estimate), weather_in_month, top_3 (array 3 strings), best_for (2-3 tags: culture|history|beaches|nightlife|food|nature|architecture|shopping|family|romance|adventure|art), visa_needed (boolean for BiH passport), direct_flight (boolean), crowd_level (Low/Moderate/High/Very High), score (0-100 based on value = experience vs real price).\n\nPrioritize: good value (low price + good experience), mix of popular and hidden gems. Sort by score descending.'

  for (const model of GROQ_MODELS) {
    try {
      const r = await fetch(GROQ_API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + apiKey },
        body: JSON.stringify({
          model,
          messages: [
            { role: 'system', content: 'JSON API. Return ONLY a valid JSON array starting with [. No text before or after.' },
            { role: 'user', content: prompt },
          ],
          temperature: 0.1,
          max_tokens: 2000,
        }),
      })

      const status = r.status
      const txt = await r.text()
      if (!r.ok) { console.error('Groq enrich error', status); continue }

      const groqLimits = {
        remainingRequests: r.headers.get('x-ratelimit-remaining-requests'),
        remainingTokens: r.headers.get('x-ratelimit-remaining-tokens'),
        limitTokens: r.headers.get('x-ratelimit-limit-tokens'),
        resetTokens: r.headers.get('x-ratelimit-reset-tokens'),
      }

      let content = ''
      try {
        const parsed = JSON.parse(txt)
        content = parsed.choices && parsed.choices[0] && parsed.choices[0].message && parsed.choices[0].message.content || ''
      } catch (e) { continue }

      let text = content.replace(/```json|```/g, '').trim()
      const si = text.indexOf('['), ei = text.lastIndexOf(']')
      if (si !== -1 && ei > si) text = text.slice(si, ei + 1)

      try {
        const list = JSON.parse(text)
        if (Array.isArray(list) && list.length > 0) return { list, groqLimits }
      } catch (e) { continue }
    } catch (e) { continue }
  }
  return null
}

// Fallback: pure Groq without real prices
async function groqFallback(cityOrigin, departDate, nights, adultsN, childrenN, apiKey) {
  const prompt = 'Traveler from "' + cityOrigin + '", departing ' + departDate + ', ' + nights + ' nights, ' + adultsN + ' adults, ' + childrenN + ' children, Bosnian passport. Recommend 6 European cities (different countries). Return ONLY JSON array starting with [.\n\nEach: city, country, flag (2-letter ISO), tagline, why_now, estimated_flight_eur, avg_daily_budget_eur, weather_in_month, top_3 (array), best_for (array), visa_needed (bool), direct_flight (bool), crowd_level, score (0-100). Mix popular+hidden gems+value. Sort score desc.'

  for (const model of GROQ_MODELS) {
    try {
      const r = await fetch(GROQ_API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + apiKey },
        body: JSON.stringify({
          model,
          messages: [
            { role: 'system', content: 'JSON API. Return ONLY valid JSON array starting with [.' },
            { role: 'user', content: prompt },
          ],
          temperature: 0.1,
          max_tokens: 2000,
        }),
      })

      const status = r.status
      const txt = await r.text()
      if (!r.ok) { console.error('Groq fallback error', status, model); continue }

      const groqLimits = {
        remainingRequests: r.headers.get('x-ratelimit-remaining-requests'),
        remainingTokens: r.headers.get('x-ratelimit-remaining-tokens'),
        limitTokens: r.headers.get('x-ratelimit-limit-tokens'),
        resetTokens: r.headers.get('x-ratelimit-reset-tokens'),
      }

      let content = ''
      try {
        const pd = JSON.parse(txt)
        content = pd.choices && pd.choices[0] && pd.choices[0].message && pd.choices[0].message.content || ''
      } catch (e) { continue }

      let text = content.replace(/```json|```/g, '').trim()
      const si = text.indexOf('['), ei = text.lastIndexOf(']')
      if (si !== -1 && ei > si) text = text.slice(si, ei + 1)

      try {
        const list = JSON.parse(text)
        if (Array.isArray(list) && list.length > 0) return { list, groqLimits, source: 'groq_only' }
      } catch (e) { continue }
    } catch (e) { continue }
  }
  return null
}

export async function onRequestPost(context) {
  const { request, env } = context

  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Content-Type': 'application/json; charset=utf-8',
  }

  let body
  try { body = await request.json() }
  catch { return new Response(JSON.stringify({ error: 'Neispravan zahtjev.' }), { status: 400, headers }) }

  const { origin, departDate, returnDate, adults, children } = body || {}
  if (!origin || !departDate) {
    return new Response(JSON.stringify({ error: 'Nedostaju polja.' }), { status: 400, headers })
  }

  const apiKey = env && env.GROQ_API_KEY
  if (!apiKey) {
    return new Response(JSON.stringify({ error: 'GROQ_API_KEY nije konfigurisan.' }), { status: 200, headers })
  }

  const nights = Math.max(1, Math.round((new Date(returnDate) - new Date(departDate)) / 86400000))
  const adultsN = parseInt(adults) || 2
  const childrenN = parseInt(children) || 0
  const cityOrigin = (origin || '').split(',')[0].trim()
  const ret = returnDate || departDate

  const toFlag = function(code) {
    if (!code || typeof code !== 'string' || code.length !== 2) return ''
    try {
      const u = code.toUpperCase()
      return String.fromCodePoint(0x1F1E6 + u.charCodeAt(0) - 65) +
             String.fromCodePoint(0x1F1E6 + u.charCodeAt(1) - 65)
    } catch (e) { return '' }
  }

  const buildLinks = function(s, cityOrigin, departDate, ret, adultsN, childrenN) {
    const city = (s.city || '').toString()
    const q = 'flights from ' + cityOrigin + ' to ' + city + ' on ' + departDate + ' returning ' + ret + ' ' + adultsN + ' adults'
    const fromSlug = cityOrigin.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
    const toSlug = city.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
    return {
      google_flights_url: 'https://www.google.com/travel/flights?q=' + encodeURIComponent(q),
      kiwi_url: 'https://www.kiwi.com/en/search/results/' + fromSlug + '/' + toSlug + '/' + departDate + '/' + ret + '?adults=' + adultsN + '&children=' + childrenN,
    }
  }

  // -- Try Travelpayouts for real prices --------------------------------------
  const tpToken = env && env.TRAVELPAYOUTS_TOKEN
  const originIata = cityToIata(cityOrigin)
  let usedLivePrices = false

  if (tpToken && originIata) {
    console.log('Travelpayouts: origin IATA =', originIata)
    const flights = await fetchTravelpayoutsFlights(originIata, departDate, ret, tpToken)

    if (flights && flights.length >= 4) {
      console.log('Travelpayouts returned', flights.length, 'destinations')
      const result = await groqEnrichWithPrices(flights, cityOrigin, departDate, nights, adultsN, childrenN, apiKey)

      if (result && result.list && result.list.length > 0) {
        const enriched = result.list.slice(0, 6).map(function(s) {
          return Object.assign({}, s, { flag: toFlag(s.flag), live_prices: true },
            buildLinks(s, cityOrigin, departDate, ret, adultsN, childrenN))
        })
        return new Response(JSON.stringify({
          suggestions: enriched,
          groq_limits: result.groqLimits,
          source: 'live_prices',
          origin_iata: originIata,
        }), { status: 200, headers })
      }
    }
  } else {
    console.log('Travelpayouts skip: token=', !!tpToken, 'iata=', originIata)
  }

  // -- Fallback: pure Groq estimates ------------------------------------------
  console.log('Using Groq-only fallback')
  const result = await groqFallback(cityOrigin, departDate, nights, adultsN, childrenN, apiKey)

  if (!result) {
    return new Response(JSON.stringify({ error: 'Svi AI modeli neuspjesni. Pokusaj ponovo.' }), { status: 200, headers })
  }

  const enriched = result.list.slice(0, 6).map(function(s) {
    return Object.assign({}, s, { flag: toFlag(s.flag), live_prices: false },
      buildLinks(s, cityOrigin, departDate, ret, adultsN, childrenN))
  })

  return new Response(JSON.stringify({
    suggestions: enriched,
    groq_limits: result.groqLimits,
    source: 'groq_estimates',
  }), { status: 200, headers })
}

export async function onRequestOptions() {
  return new Response(null, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  })
}
