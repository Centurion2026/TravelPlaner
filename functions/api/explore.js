const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions'
const GROQ_MODEL = 'llama-3.3-70b-versatile'
const GROQ_MODEL_FALLBACK = 'llama-3.1-70b-versatile'
const GROQ_MODEL_FALLBACK2 = 'llama3-70b-8192'

export async function onRequestPost(context) {
  const { request, env } = context

  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Content-Type': 'application/json; charset=utf-8',
  }

  let body
  try { body = await request.json() }
  catch { return new Response(JSON.stringify({ error: 'Neispravan zahtjev.' }), { status: 400, headers: corsHeaders }) }

  const { origin, departDate, returnDate, adults, children } = body || {}
  if (!origin || !departDate) {
    return new Response(JSON.stringify({ error: 'Nedostaju polja.' }), { status: 400, headers: corsHeaders })
  }

  const apiKey = env && env.GROQ_API_KEY
  if (!apiKey) {
    return new Response(JSON.stringify({ error: 'GROQ_API_KEY nije konfigurisan.' }), { status: 200, headers: corsHeaders })
  }

  const nights = Math.max(1, Math.round((new Date(returnDate) - new Date(departDate)) / 86400000))
  const adultsN = parseInt(adults) || 2
  const childrenN = parseInt(children) || 0
  const cityOrigin = (origin || '').split(',')[0].trim()

  const sampleItem = '{"city":"Amsterdam","country":"Netherlands","flag":"NL","tagline":"City of canals","why_now":"Great weather in spring","estimated_flight_eur":85,"avg_daily_budget_eur":120,"weather_in_month":"16-21C","top_3":["Rijksmuseum","Anne Frank House","Vondelpark"],"best_for":["culture","food"],"visa_needed":false,"direct_flight":false,"crowd_level":"Moderate","score":88}'
  const prompt = 'From "' + cityOrigin + '", departing ' + departDate + ', ' + nights + ' nights, ' + adultsN + ' adults, ' + childrenN + ' children, Bosnian passport. Recommend 6 European cities (different countries). Return ONLY a JSON array starting with [ and ending with ], no other text. Use this format: [' + sampleItem + ']. Mix popular + hidden gems + value picks. estimated_flight_eur = return economy from ' + cityOrigin + '. visa_needed for BiH passport. flag = 2-letter country code. Sort by score desc.'

  const makeRequest = function(model) {
    return fetch(GROQ_API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + apiKey },
      body: JSON.stringify({
        model: model,
        messages: [
          { role: 'system', content: 'JSON API. Return ONLY a valid JSON array. No explanation, no markdown.' },
          { role: 'user', content: prompt },
        ],
        temperature: 0.1,
        max_tokens: 2000,
      }),
    })
  }

  try {
    let resp = await makeRequest(GROQ_MODEL)

    if (!resp.ok) {
      const et = await resp.text()
      console.error('Primary error', resp.status, et.slice(0, 150))
      if (resp.status === 429 || resp.status >= 500) {
        resp = await makeRequest(GROQ_MODEL_FALLBACK)
      }
    }

    if (!resp.ok) {
      const et = await resp.text()
      console.error('Fallback1 error', resp.status, et.slice(0, 150))
      if (resp.status === 429 || resp.status >= 500) {
        resp = await makeRequest(GROQ_MODEL_FALLBACK2)
      }
    }

    if (!resp.ok) {
      const et = await resp.text()
      console.error('Fallback2 error', resp.status, et.slice(0, 150))
      return new Response(JSON.stringify({ error: 'Groq greska ' + resp.status + '. Svi modeli zauzeti, pokusaj za minutu.' }), { status: 200, headers: corsHeaders })
    }

    const groqLimits = {
      remainingRequests: resp.headers.get('x-ratelimit-remaining-requests'),
      remainingTokens: resp.headers.get('x-ratelimit-remaining-tokens'),
      limitTokens: resp.headers.get('x-ratelimit-limit-tokens'),
      resetTokens: resp.headers.get('x-ratelimit-reset-tokens'),
    }

    const json = await resp.json()
    const raw = json.choices && json.choices[0] && json.choices[0].message && json.choices[0].message.content || ''
    console.log('Raw preview:', raw.slice(0, 200))

    let text = raw.replace(/```json|```/g, '').trim()
    const s = text.indexOf('[')
    const e = text.lastIndexOf(']')
    if (s !== -1 && e > s) text = text.slice(s, e + 1)

    let list
    try {
      const p = JSON.parse(text)
      list = Array.isArray(p) ? p : (Object.values(p).find(function(v) { return Array.isArray(v) }) || [])
    } catch (err) {
      console.error('Parse fail:', err.message, raw.slice(0, 300))
      return new Response(JSON.stringify({ error: 'AI greska parsiranja. Pokusaj ponovo.' }), { status: 200, headers: corsHeaders })
    }

    if (!list.length) {
      console.error('Empty list, raw:', raw.slice(0, 300))
      return new Response(JSON.stringify({
        error: 'Groq vratio prazan odgovor.',
        debug: 'raw_len=' + raw.length + ' text_preview=' + text.slice(0, 100)
      }), { status: 200, headers: corsHeaders })
    }

    const toFlag = function(code) {
      if (!code || code.length !== 2) return '?'
      const u = code.toUpperCase()
      return String.fromCodePoint(0x1F1E6 + u.charCodeAt(0) - 65) + String.fromCodePoint(0x1F1E6 + u.charCodeAt(1) - 65)
    }

    const enriched = list.slice(0, 6).map(function(s) {
      const city = s.city || ''
      const q = 'flights from ' + cityOrigin + ' to ' + city + ' on ' + departDate + ' returning ' + (returnDate || departDate) + ' ' + adultsN + ' adults'
      const fs = cityOrigin.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
      const ts = city.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
      return Object.assign({}, s, {
        flag: toFlag(s.flag),
        google_flights_url: 'https://www.google.com/travel/flights?q=' + encodeURIComponent(q),
        kiwi_url: 'https://www.kiwi.com/en/search/results/' + fs + '/' + ts + '/' + departDate + '/' + (returnDate || departDate) + '?adults=' + adultsN + '&children=' + childrenN,
      })
    })

    return new Response(JSON.stringify({ suggestions: enriched, groq_limits: groqLimits }), { status: 200, headers: corsHeaders })

  } catch (err) {
    console.error('Fatal:', err && err.message)
    return new Response(JSON.stringify({ error: 'Neocekivana greska. Pokusaj ponovo.' }), { status: 200, headers: corsHeaders })
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
