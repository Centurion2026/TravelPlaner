const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions'
const GROQ_MODEL = 'llama-3.3-70b-versatile'

export async function onRequestPost(context) {
  const { request, env } = context

  // CORS headers
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Content-Type': 'application/json; charset=utf-8',
  }

  let body
  try {
    body = await request.json()
  } catch {
    return new Response(JSON.stringify({ error: 'Neispravan zahtjev.' }), { status: 400, headers: corsHeaders })
  }

  const { origin, departDate, returnDate, adults, children } = body || {}
  if (!origin || !departDate) {
    return new Response(JSON.stringify({ error: 'Nedostaju polja: origin, departDate.' }), { status: 400, headers: corsHeaders })
  }

  const apiKey = env?.GROQ_API_KEY
  if (!apiKey) {
    return new Response(JSON.stringify({ error: 'GROQ_API_KEY nije konfigurisan.' }), { status: 503, headers: corsHeaders })
  }

  const nights = Math.max(1, Math.round((new Date(returnDate) - new Date(departDate)) / 86400000))
  const adultsN = parseInt(adults) || 2
  const childrenN = parseInt(children) || 0
  const cityOrigin = (origin || '').split(',')[0].trim()
  const depMonth = departDate ? new Date(departDate).toLocaleString('en-US', { month: 'long', year: 'numeric' }) : ''

  const prompt = `You are a European travel recommendation engine. The traveler departs from "${cityOrigin}" around ${departDate} (${depMonth}) for approximately ${nights} nights with ${adultsN} adults and ${childrenN} children. They have a Bosnian passport.

Return ONLY a valid JSON array (no markdown, no explanation) of exactly 6 European city recommendations, each in a different country. Format:
[
  {
    "city": "Amsterdam",
    "country": "Netherlands",
    "flag": "NL",
    "tagline": "City of canals, bikes and world-class museums",
    "why_now": "May is tulip season, weather perfect for cycling",
    "estimated_flight_eur": 85,
    "flight_note": "Direct Wizz Air/Ryanair typically available",
    "avg_daily_budget_eur": 120,
    "weather_in_month": "16-21C, partly cloudy",
    "top_3": ["Rijksmuseum", "Anne Frank House", "Van Gogh Museum"],
    "best_for": ["culture", "nightlife", "food"],
    "visa_needed": false,
    "direct_flight": true,
    "crowd_level": "Moderate",
    "score": 92
  }
]
Rules:
- Suggest cities realistically accessible by plane from ${cityOrigin}
- Mix: 2 well-known destinations + 2 hidden gems + 2 best-value picks
- estimated_flight_eur: realistic RETURN economy ticket price from ${cityOrigin} (check budget airline routes)
- avg_daily_budget_eur: realistic daily spend per person (accommodation + food + local transport)
- best_for: 2-3 tags from: culture|history|beaches|nightlife|food|nature|architecture|shopping|family|romance|adventure|art
- crowd_level: "Low" | "Moderate" | "High" | "Very High" for that month
- score: 0-100 overall recommendation considering value, weather, accessibility from ${cityOrigin}
- visa_needed: for Bosnian (BiH) passport holder
- direct_flight: true only if budget airline (Ryanair/Wizz) has direct route from ${cityOrigin}
- flag: ISO 3166-1 alpha-2 country code (used for emoji flag)
- Sort by score descending, best pick first`

  try {
    const response = await fetch(GROQ_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: GROQ_MODEL,
        messages: [
          { role: 'system', content: 'You are a travel recommendation API. Respond with valid JSON array only, no markdown.' },
          { role: 'user', content: prompt },
        ],
        temperature: 0.3,
        max_tokens: 2500,
      }),
    })

    if (!response.ok) {
      const err = await response.text()
      console.error('Groq explore error:', response.status, err)
      return new Response(JSON.stringify({ error: 'AI servis nije dostupan. Pokusaj ponovo.' }), { status: 502, headers: corsHeaders })
    }

    const data = await response.json()
    const text = (data.choices?.[0]?.message?.content || '').replace(/```json\n?|\n?```/g, '').trim()

    let suggestions
    try {
      suggestions = JSON.parse(text)
      if (!Array.isArray(suggestions)) throw new Error('Not an array')
    } catch {
      console.error('Groq explore parse error, raw:', text.slice(0, 300))
      return new Response(JSON.stringify({ error: 'Greska u parsiranju AI odgovora.' }), { status: 500, headers: corsHeaders })
    }

    // Convert country code to flag emoji
    const toFlag = (code) => {
      if (!code || code.length !== 2) return '?'
      return [...code.toUpperCase()].map(c => String.fromCodePoint(0x1F1E6 + c.charCodeAt(0) - 65)).join('')
    }

    const enriched = suggestions.map(s => ({
      ...s,
      flag: toFlag(s.flag),
      google_flights_url: `https://www.google.com/travel/flights?q=${encodeURIComponent(`flights from ${cityOrigin} to ${s.city} on ${departDate} returning ${returnDate} ${adultsN} adults${childrenN ? ' ' + childrenN + ' children' : ''}`)}`,
      kiwi_url: `https://www.kiwi.com/en/search/results/${encodeURIComponent(cityOrigin.toLowerCase().replace(/\s+/g,'-'))}/${encodeURIComponent(s.city.toLowerCase().replace(/\s+/g,'-'))}/${departDate}/${returnDate}?adults=${adultsN}&children=${childrenN}`,
    }))

    return new Response(JSON.stringify({ suggestions: enriched }), { status: 200, headers: corsHeaders })
  } catch (err) {
    console.error('Explore fatal:', err?.message)
    return new Response(JSON.stringify({ error: 'Neocekivana greska. Pokusaj ponovo.' }), { status: 500, headers: corsHeaders })
  }
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
