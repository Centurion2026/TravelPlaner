const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions'
const GROQ_MODELS = ['llama-3.3-70b-versatile', 'llama-3.1-8b-instant', 'mixtral-8x7b-32768']

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
    return new Response(JSON.stringify({ error: 'Nedostaju polja: origin, departDate.' }), { status: 400, headers })
  }

  const apiKey = env && env.GROQ_API_KEY
  if (!apiKey) {
    return new Response(JSON.stringify({ error: 'GROQ_API_KEY nije konfigurisan u Cloudflare env.' }), { status: 200, headers })
  }

  const nights = Math.max(1, Math.round((new Date(returnDate) - new Date(departDate)) / 86400000))
  const adultsN = parseInt(adults) || 2
  const childrenN = parseInt(children) || 0
  const cityOrigin = (origin || '').split(',')[0].trim()
  const ret = returnDate || departDate

  const prompt = 'You are a European travel recommendation engine. Traveler departs from "' + cityOrigin + '" on ' + departDate + ' for ' + nights + ' nights (' + adultsN + ' adults, ' + childrenN + ' children). They have a Bosnian (BiH) passport.\n\nRespond ONLY with a JSON array of exactly 6 European city recommendations (one per country). No text, no markdown. Start immediately with [\n\nEach object must have: city, country, flag (2-letter ISO code), tagline, why_now, estimated_flight_eur (return economy), avg_daily_budget_eur, weather_in_month, top_3 (array of 3 strings), best_for (array of 2-3 tags), visa_needed (boolean), direct_flight (boolean), crowd_level (Low/Moderate/High/Very High), score (0-100).\n\nMix: 2 popular + 2 hidden gems + 2 best value. Sort by score descending.'

  // Try each model until one works
  let resp = null
  let lastError = 'Svi Groq modeli neuspjesni'

  for (let i = 0; i < GROQ_MODELS.length; i++) {
    const model = GROQ_MODELS[i]
    try {
      const r = await fetch(GROQ_API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + apiKey },
        body: JSON.stringify({
          model: model,
          messages: [
            { role: 'system', content: 'You are a JSON API. Return ONLY a valid JSON array starting with [ and ending with ]. Nothing else.' },
            { role: 'user', content: prompt },
          ],
          temperature: 0.1,
          max_tokens: 2000,
        }),
      })

      // Read status before consuming body
      const status = r.status
      const responseText = await r.text()

      if (status === 401 || status === 403) {
        return new Response(JSON.stringify({ error: 'Groq API kljuc nije ispravan (401/403). Provjeri GROQ_API_KEY u Cloudflare Settings.' }), { status: 200, headers })
      }

      if (!r.ok) {
        lastError = 'Groq model ' + model + ' vratio ' + status
        console.error('Model', model, 'error:', status, responseText.slice(0, 100))
        continue // try next model
      }

      // Parse Groq JSON response
      let groqData
      try { groqData = JSON.parse(responseText) }
      catch (e) {
        lastError = 'Groq vratio nevalidan JSON'
        console.error('Groq JSON parse fail:', responseText.slice(0, 200))
        continue
      }

      const groqLimits = {
        remainingRequests: r.headers.get('x-ratelimit-remaining-requests'),
        remainingTokens: r.headers.get('x-ratelimit-remaining-tokens'),
        limitTokens: r.headers.get('x-ratelimit-limit-tokens'),
        resetTokens: r.headers.get('x-ratelimit-reset-tokens'),
      }

      const raw = groqData.choices && groqData.choices[0] && groqData.choices[0].message && groqData.choices[0].message.content || ''
      console.log('Model:', model, '| Raw length:', raw.length, '| Preview:', raw.slice(0, 100))

      // Extract JSON array from response
      let text = raw.replace(/```json|```/g, '').trim()
      const startIdx = text.indexOf('[')
      const endIdx = text.lastIndexOf(']')
      if (startIdx !== -1 && endIdx > startIdx) {
        text = text.slice(startIdx, endIdx + 1)
      }

      // Parse the suggestions array
      let list = []
      try {
        const parsed = JSON.parse(text)
        if (Array.isArray(parsed)) {
          list = parsed
        } else if (parsed && typeof parsed === 'object') {
          const found = Object.values(parsed).find(function(v) { return Array.isArray(v) })
          if (found) list = found
        }
      } catch (parseErr) {
        lastError = 'Parsiranje odgovora neuspjesno: ' + parseErr.message
        console.error('Parse fail:', parseErr.message, '| text:', text.slice(0, 200))
        continue
      }

      if (list.length === 0) {
        lastError = 'Prazan niz (raw_len=' + raw.length + ')'
        console.error('Empty list. Raw:', raw.slice(0, 300))
        continue
      }

      // Build flag emoji from 2-letter country code
      const toFlag = function(code) {
        if (!code || typeof code !== 'string' || code.length !== 2) return ''
        try {
          const u = code.toUpperCase()
          const a = 0x1F1E6 + u.charCodeAt(0) - 65
          const b = 0x1F1E6 + u.charCodeAt(1) - 65
          return String.fromCodePoint(a) + String.fromCodePoint(b)
        } catch (e) { return '' }
      }

      const enriched = list.slice(0, 6).map(function(s) {
        const city = (s.city || 'Unknown').toString()
        const q = 'flights from ' + cityOrigin + ' to ' + city + ' on ' + departDate + ' returning ' + ret + ' ' + adultsN + ' adults'
        const fromSlug = cityOrigin.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
        const toSlug = city.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
        const flagEmoji = toFlag(s.flag)
        return Object.assign({}, s, {
          flag: flagEmoji,
          google_flights_url: 'https://www.google.com/travel/flights?q=' + encodeURIComponent(q),
          kiwi_url: 'https://www.kiwi.com/en/search/results/' + fromSlug + '/' + toSlug + '/' + departDate + '/' + ret + '?adults=' + adultsN + '&children=' + childrenN,
        })
      })

      return new Response(JSON.stringify({ suggestions: enriched, groq_limits: groqLimits }), { status: 200, headers })

    } catch (fetchErr) {
      lastError = 'Fetch greska (' + model + '): ' + (fetchErr && fetchErr.message)
      console.error('Fetch error for model', model, ':', fetchErr && fetchErr.message)
      // continue to next model
    }
  }

  // All models failed
  return new Response(JSON.stringify({ error: lastError }), { status: 200, headers })
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
