// Demo-store sample products for /preview/. Images are self-hosted (public/images/demo-store),
// so nothing breaks. This is a visual mockup only — no real ordering/checkout.
export type DemoProduct = {
  id: string
  name: string
  price: number
  image: string
  colors: string[]
  sizes: string[]
  description: string[]
}

export const demoProducts: DemoProduct[] = [
  {
    id: 'work-polo',
    name: 'Custom Embroidered Work Polo',
    price: 32,
    image: '/images/demo-store/polo.png',
    colors: ['Navy', 'Black', 'Steel Gray'],
    sizes: ['S', 'M', 'L', 'XL', '2XL', '3XL'],
    description: [
      'Snag-resistant piqué knit that holds up on the jobsite',
      'Left-chest embroidery of your company logo',
      'Tagless collar and reinforced three-button placket',
      'Moisture-wicking, wash after wash',
    ],
  },
  {
    id: 'hi-vis-jacket',
    name: 'Hi-Vis Safety Work Jacket',
    price: 58,
    image: '/images/demo-store/hivis.png',
    colors: ['Safety Yellow', 'Safety Orange'],
    sizes: ['S', 'M', 'L', 'XL', '2XL', '3XL', '4XL'],
    description: [
      'ANSI-style hi-vis with silver reflective striping',
      'Full-zip front with fleece-lined collar',
      'Screen-printed or embroidered company branding',
      'Water-resistant shell for early mornings on site',
    ],
  },
  {
    id: 'crew-hoodie',
    name: 'Branded Pullover Hoodie',
    price: 45,
    image: '/images/demo-store/hoodie.png',
    colors: ['Charcoal', 'Black', 'Navy'],
    sizes: ['S', 'M', 'L', 'XL', '2XL', '3XL'],
    description: [
      'Heavyweight fleece that keeps the crew warm',
      'Front pouch pocket and double-lined hood',
      'Your logo across the chest or back',
      'Built to survive the wash cycle and the tailgate',
    ],
  },
  {
    id: 'work-tee',
    name: 'Custom Work T-Shirt',
    price: 18,
    image: '/images/demo-store/tee.png',
    colors: ['Tan', 'Sand', 'Gray', 'Black'],
    sizes: ['S', 'M', 'L', 'XL', '2XL', '3XL'],
    description: [
      'Durable ring-spun cotton blend for all-day wear',
      'Screen-printed company logo, front and back',
      'Pre-shrunk so sizing stays true',
      'The everyday crew shirt at a bulk-friendly price',
    ],
  },
]
