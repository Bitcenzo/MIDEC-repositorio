// Monumento a Artigas, OSM node 2153595683. Plaza confirmed by the supplied Maps link.
export const destination = { latitude: -33.99913, longitude: -58.28785 }
export const mapsUrl = 'https://maps.app.goo.gl/x4JBzKniUuNkj839A?g_st=iw'
export function directionFrom(position, target = destination) {
  const rad = n => n * Math.PI / 180
  const lat1 = rad(position.latitude), lat2 = rad(target.latitude)
  const dl = rad(target.longitude - position.longitude), dp = lat2 - lat1
  const a = Math.sin(dp / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dl / 2) ** 2
  return {
    distance: 6371000 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(Math.max(0, 1 - a))),
    bearing: (Math.atan2(Math.sin(dl) * Math.cos(lat2), Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(dl)) * 180 / Math.PI + 360) % 360,
  }
}
export const relativeAngle = (bearing, heading) => ((bearing - heading + 540) % 360) - 180
