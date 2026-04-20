const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions'
const GROQ_MODEL = 'llama-3.3-70b-versatile'
const GROQ_MODEL_FALLBACK = 'llama3-8b-8192'

export async function onRequestPost(context) {
  const { request, env } = context

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
    return new Response(JSON.stringify({ error: 'GROQ_API_KEY nije konfigurisan na serveru.' }), { status: 200, headers: corsHeaders })
  }

  const nights = Math.max(1, Math.round((new Date(returnDate) - new Date(departDate)) / 86400000))
  const adultsN = parseInt(adults) || 2
  const childrenN = parseInt(children) || 0
  const cityOrigin = (origin || '').split(',')[0].trim()

  const prompt = `Travel recommendation API. From "${cityOrigin}", departing ${departDate}, ${nights} nights, ${adultsN} adults, ${childrenN} children, Bosnian passport.

Return ONLY a JSON array of 6 European city recommendations (different countries):
[{"city":"Amsterdam","country":"Netherlands","flag":"NL","tagline":"short tagline","why_now":"seasonal reason","estimated_flight_eur":85,"avg_daily_budget_eur":120,"weather_in_month":"18-22C","top_3":["Museum 1","Sight 2","Place 3"],"best_for":["culture","food"],"visa_needed":false,"direct_flight":true,"crowd_level":"Moderate","score":90}]

Rules: mix 2 popular + 2 hidden gems + 2 value picks. estimated_flight_eur = realistic return from ${cityOrigin}. visa_needed for BiH passport. flag = ISO 3166-1 alpha-2 code. Sort by score desc.`

  const callGroq = async (model) => {
    return fetch(GROQ_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + apiKey,
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: 'system', content: 'Travel API. Return valid JSON array only, no markdown, no explanation.' },
          { role: 'user', content: prompt },
        ],
        temperature: 0.3,
        max_tokens: 1500,
      }),
    })
  }

  try {
    let response = await callGroq(GROQ_MODEL)

    // Fallback to smaller model on rate limit or error
    if (!response.ok) {
      const errText = await response.text()
      console.error('Groq explore primary error:', response.status, errText.slice(0, 200))
      if (response.status === 429 || response.status >= 500) {
        response = await callGroq(GROQ_MODEL_FALLBACK)
      }
    }

    if (!response.ok) {
      const errText = await response.text()
      console.error('Groq explore fallback error:', response.status, errText.slice(0, 200))
      return new Response(JSON.stringify({ error: 'Groq AI nije dostupan (' + response.status + '). Pokusaj za minutu.' }), { status: 200, headers: corsHeaders })
    }

    const data = await response.json()
    const text = (data.choices?.[0]?.message?.content || '').replace(/```json\n?|\n?```/g, '').trim()

    let suggestions
    try {
      // Handle case where model returns object with array inside
      const parsed = JSON.parse(text)
      suggestions = Array.isArray(parsed) ? parsed : (parsed.destinations || parsed.recommendations || parsed.cities || Object.values(parsed)[0])
      if (!Array.isArray(suggestions)) throw new Error('Not an array')
    } catch {
      console.error('Groq explore parse error, raw:', text.slice(0, 300))
      return new Response(JSON.stringify({ error: 'Greska u parsiranju odgovora. Pokusaj ponovo.' }), { status: 200, headers: corsHeaders })
    }

    const toFlag = (code) => {
      if (!code || code.length !== 2) return '?'
      return [...code.toUpperCase()].map(c => String.fromCodePoint(0x1F1E6 + c.charCodeAt(0) - 65)).join('')
    }

    const enriched = suggestions.slice(0, 6).map(s => {
      const flightQuery = 'flights from ' + cityOrigin + ' to ' + s.city + ' on ' + departDate + ' returning ' + (returnDate || departDate) + ' ' + adultsN + ' adults' + (childrenN ? ' ' + childrenN + ' children' : '')
      const fromSlug = cityOrigin.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
      const toSlug = (s.city || '').toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
      return {
        ...s,
        flag: toFlag(s.flag),
        google_flights_url: 'https://www.google.com/travel/flights?q=' + encodeURIComponent(flightQuery),
        kiwi_url: 'https://www.kiwi.com/en/search/results/' + fromSlug + '/' + toSlug + '/' + departDate + '/' + (returnDate || departDate) + '?adults=' + adultsN + '&children=' + childrenN,
      }
    })

    return new Response(JSON.stringify({ suggestions: enriched }), { status: 200, headers: corsHeaders })

  } catch (err) {
    console.error('Explore fatal:', err?.message)
    return new Response(JSON.stringify({ error: 'Neocekivana greska: ' + (err?.message || 'unknown') }), { status: 200, headers: corsHeaders })
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

