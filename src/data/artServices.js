// Vector art and embroidery digitizing request offer (/offers/vector-digitizing/).
// Prices set by Sales On Demand from 2026-11-12 market research; request-only, no payment taken.
export const artServices = {
  'vector-logo': { label: 'Logo to vector', price: 49 },
  'vector-detailed': { label: 'Detailed logo or mascot to vector', price: 89 },
  'digitize-left-chest': { label: 'Embroidery digitizing: left chest or cap', price: 49 },
  'digitize-jacket-back': { label: 'Embroidery digitizing: jacket back', price: 99 },
  'vector-digitize-bundle': { label: 'Vector + digitizing bundle', price: 79 },
}

// Formats people send for vector and digitizing work. GHL media storage caps files at 25 MB.
export const ART_FILE_TYPES = ['png', 'jpg', 'jpeg', 'gif', 'webp', 'heic', 'pdf', 'svg', 'ai', 'eps', 'psd', 'tif', 'tiff']
export const ART_MAX_BYTES = 10 * 1024 * 1024
