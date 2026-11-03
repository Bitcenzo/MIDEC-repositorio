import { destination, mapsUrl } from './location.js'

export const puerto = {
  id: 'puerto-carmelo',
  name: 'Puerto de El Carmelo',
  priority: 2,
  // Destination (Letras de Carmelo), not the origin of the supplied directions link.
  destination: { latitude: -34.0038125, longitude: -58.2874531 },
  mapEmbed: 'https://www.openstreetmap.org/export/embed.html?bbox=-58.292%2C-34.007%2C-58.283%2C-34.000&layer=mapnik&marker=-34.0038125%2C-58.2874531',
  mapsUrl: 'https://www.google.com/maps/dir/?api=1&destination=-34.0038125%2C-58.2874531&travelmode=walking',
}

export const points = [
  { id: 'plaza-artigas', name: 'Punto Fundacional', detail: 'Plaza Artigas', priority: 1, destination, mapsUrl },
  puerto,
].sort((a, b) => a.priority - b.priority)
