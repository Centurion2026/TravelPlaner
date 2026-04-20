import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { useEffect, useMemo } from 'react'

const makeIcon = (emoji, color) => L.divIcon({
  html: `<div style="
    width: 34px;
    height: 34px;
    background: ${color};
    border-radius: 50% 50% 50% 0;
    transform: rotate(-45deg);
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 2px 6px rgba(0,0,0,.35);
    border: 2px solid white;
  "><span style="transform: rotate(45deg); font-size: 16px;">${emoji}</span></div>`,
  className: 'pp-marker',
  iconSize: [34, 34],
  iconAnchor: [17, 34],
  popupAnchor: [0, -32],
})

const ICONS = {
  attraction: makeIcon('🎯', '#ef6b1f'),
  accommodation: makeIcon('🏠', '#0ea5e9'),
  food: makeIcon('🍴', '#10b981'),
}

function FitBounds({ points }) {
  const map = useMap()

  useEffect(() => {
    if (!points.length) return
    if (points.length === 1) {
      map.setView([points[0].lat, points[0].lng], 14)
      return
    }

    const bounds = L.latLngBounds(points.map((point) => [point.lat, point.lng]))
    map.fitBounds(bounds, { padding: [40, 40], maxZoom: 15 })
  }, [points, map])

  return null
}

export default function MapView({ plan }) {
  const points = useMemo(() => {
    const items = []

    plan.attractions?.forEach((attraction, index) => {
      if (valid(attraction.lat, attraction.lng)) {
        items.push({
          lat: attraction.lat,
          lng: attraction.lng,
          icon: ICONS.attraction,
          title: `${index + 1}. ${attraction.name}`,
          sub: attraction.description,
        })
      }
    })

    if (valid(plan.accommodation?.lat, plan.accommodation?.lng)) {
      items.push({
        lat: plan.accommodation.lat,
        lng: plan.accommodation.lng,
        icon: ICONS.accommodation,
        title: `🏠 ${plan.accommodation.name}`,
        sub: plan.accommodation.area,
      })
    }

    plan.food?.forEach((food) => {
      if (valid(food.lat, food.lng)) {
        items.push({
          lat: food.lat,
          lng: food.lng,
          icon: ICONS.food,
          title: `🍴 ${food.name}`,
          sub: food.note,
        })
      }
    })

    return items
  }, [plan])

  const center = plan.destination_coords?.lat
    ? [plan.destination_coords.lat, plan.destination_coords.lng]
    : [41.9, 12.5]

  if (!points.length) {
    return (
      <div className="text-white/40 text-sm p-4 text-center">
        Mapa nije dostupna — javni izvori nisu vratili koordinate.
      </div>
    )
  }

  return (
    <div className="rounded-xl overflow-hidden border border-white/10" style={{ height: 420 }}>
      <MapContainer center={center} zoom={13} style={{ height: '100%', width: '100%' }} scrollWheelZoom={false}>
        <TileLayer
          attribution='&copy; <a href="https://openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <FitBounds points={points} />
        {points.map((point, index) => (
          <Marker key={index} position={[point.lat, point.lng]} icon={point.icon}>
            <Popup>
              <div style={{ fontFamily: 'Inter, system-ui', minWidth: 160 }}>
                <strong>{point.title}</strong>
                {point.sub && <div style={{ color: '#555', marginTop: 4, fontSize: 12 }}>{point.sub}</div>}
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  )
}

function valid(lat, lng) {
  return typeof lat === 'number' && typeof lng === 'number' && (lat !== 0 || lng !== 0)
}
