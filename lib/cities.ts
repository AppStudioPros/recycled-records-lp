export type CityPage = {
  slug: string
  city: string
  state: string
  distance: string
  distanceNote: string
  headline: string
  subheadline: string
  description: string
  metaTitle: string
  metaDescription: string
  faqs: { q: string; a: string }[]
}

export const cities: CityPage[] = [
  {
    slug: 'record-store-boulder-co',
    city: 'Boulder',
    state: 'CO',
    distance: 'Gunbarrel',
    distanceNote: 'located in the Gunbarrel neighborhood of Boulder',
    headline: 'Boulder\'s Independent Record Store',
    subheadline: 'Vinyl, CDs, cassettes, and vintage audio in the heart of Boulder County.',
    description: 'Recycled Records LP is Boulder\'s home for new and used vinyl records, CDs, cassettes, and vintage audio equipment. Located at 6565 Gunpark Dr in the Gunbarrel neighborhood, we\'ve been serving Boulder and surrounding communities since 2010. Over 100,000 records and 20,000 CDs — every one ultrasonically cleaned and graded before it hits the floor.',
    metaTitle: 'Record Store Boulder CO | Buy & Sell Vinyl — Recycled Records LP',
    metaDescription: 'Recycled Records LP is Boulder\'s independent record store. Buy and sell vinyl records, CDs, cassettes, and vintage audio. 100,000+ records in stock at 6565 Gunpark Dr, Gunbarrel.',
    faqs: [
      { q: 'Where is the record store in Boulder?', a: 'Recycled Records LP is at 6565 Gunpark Dr, Suite 190, Boulder, CO 80301 in the Gunbarrel neighborhood. We relocated to Boulder in April 2026.' },
      { q: 'Can I sell my vinyl records in Boulder?', a: 'Yes — we buy used vinyl records, CDs, cassettes, and vintage audio in Boulder and throughout Boulder County. No appointment needed. Bring your records in any time during business hours.' },
      { q: 'What genres do you carry in Boulder?', a: 'We stock over 100,000 vinyl records across Rock, Jazz, Soul, Blues, Hip-Hop, Electronic, Classical, Country, Folk, Metal, Punk, Indie, Rare & Collectible, and more — all at our Boulder store.' },
    ],
  },
  {
    slug: 'vinyl-records-longmont-co',
    city: 'Longmont',
    state: 'CO',
    distance: 'about 15 minutes from Longmont',
    distanceNote: 'a short drive from Longmont via US-119',
    headline: 'The Record Store Longmont Has Been Crate-Digging For',
    subheadline: 'Recycled Records LP — serving Longmont vinyl fans since 2010.',
    description: 'Recycled Records LP has deep roots in the Longmont community — we operated from Longmont for over a decade before moving to Boulder\'s Gunbarrel neighborhood in April 2026. We\'re now just a 15-minute drive from downtown Longmont via US-119. Longmont customers are always welcome and you\'ll find us stocked with the same massive selection: over 100,000 vinyl records, 20,000 CDs, cassettes, and vintage audio gear.',
    metaTitle: 'Vinyl Record Store Near Longmont CO | Buy & Sell — Recycled Records LP',
    metaDescription: 'Recycled Records LP — the record store Longmont locals know. Buy and sell vinyl records, CDs, cassettes near Longmont CO. Now in Gunbarrel (Boulder), 15 min from downtown Longmont.',
    faqs: [
      { q: 'Is there a record store near Longmont, Colorado?', a: 'Recycled Records LP is about 15 minutes from downtown Longmont at 6565 Gunpark Dr, Boulder (Gunbarrel). We served the Longmont community for over a decade and moved to Gunbarrel in April 2026.' },
      { q: 'Can I sell my records if I\'m from Longmont?', a: 'Absolutely. We buy vinyl records, CDs, and cassettes from Longmont and all of Boulder County. No appointment needed — just bring them in.' },
      { q: 'How do I get to the store from Longmont?', a: 'Take US-119 (Diagonal Hwy) south toward Boulder into Gunbarrel. We\'re at 6565 Gunpark Dr, Suite 190 — about 15 minutes from downtown Longmont.' },
    ],
  },
  {
    slug: 'buy-sell-vinyl-louisville-co',
    city: 'Louisville',
    state: 'CO',
    distance: 'about 10 minutes from Louisville',
    distanceNote: 'a quick drive from Louisville via US-36',
    headline: 'Buy and Sell Vinyl Records Near Louisville, CO',
    subheadline: 'Recycled Records LP is Louisville\'s closest independent record store.',
    description: 'If you\'re in Louisville and looking to buy or sell vinyl records, CDs, cassettes, or vintage audio equipment, Recycled Records LP is your closest independent option — just 10 minutes away in Boulder\'s Gunbarrel neighborhood. We buy collections of all sizes and carry over 100,000 vinyl records and 20,000 CDs, all ultrasonically cleaned and organized by genre.',
    metaTitle: 'Buy & Sell Vinyl Records Near Louisville CO | Recycled Records LP',
    metaDescription: 'Recycled Records LP — the closest independent record store to Louisville, CO. Buy or sell vinyl records, CDs, cassettes, and vintage audio. 10 minutes away in Boulder Gunbarrel.',
    faqs: [
      { q: 'Where can I buy vinyl records near Louisville, Colorado?', a: 'Recycled Records LP is about 10 minutes from Louisville at 6565 Gunpark Dr, Suite 190 in Boulder\'s Gunbarrel neighborhood. We carry 100,000+ vinyl records and 20,000 CDs.' },
      { q: 'Does Recycled Records buy records from Louisville residents?', a: 'Yes — we buy vinyl records, CDs, cassettes, and vintage audio from Louisville and all nearby communities. No appointment needed, just bring them in during business hours.' },
    ],
  },
  {
    slug: 'record-store-lafayette-co',
    city: 'Lafayette',
    state: 'CO',
    distance: 'about 10 minutes from Lafayette',
    distanceNote: 'a short drive from Lafayette via Arapahoe Rd',
    headline: 'Lafayette\'s Closest Independent Record Store',
    subheadline: 'Over 100,000 vinyl records, CDs, and vintage audio — 10 minutes from Lafayette.',
    description: 'Lafayette music fans have a serious resource just 10 minutes away: Recycled Records LP in Boulder\'s Gunbarrel neighborhood. We carry over 100,000 vinyl records, 20,000 CDs, cassettes, and vintage audio equipment — all ultrasonically cleaned and organized by genre. We also buy used records, so if you\'re looking to sell a collection, we\'re the best stop in the area.',
    metaTitle: 'Record Store Near Lafayette CO | Buy & Sell Vinyl — Recycled Records LP',
    metaDescription: 'Recycled Records LP is the closest independent record store to Lafayette, CO — just 10 minutes in Gunbarrel, Boulder. Buy or sell vinyl records, CDs, cassettes, and vintage audio.',
    faqs: [
      { q: 'Is there a record store near Lafayette, Colorado?', a: 'Yes — Recycled Records LP is about 10 minutes from Lafayette at 6565 Gunpark Dr, Boulder (Gunbarrel). We carry 100,000+ vinyl records and 20,000 CDs.' },
      { q: 'Can I sell vinyl records in Lafayette?', a: 'We buy vinyl records, CDs, cassettes, and vintage audio from Lafayette and surrounding communities. Drive over to Gunbarrel — no appointment needed.' },
    ],
  },
  {
    slug: 'record-store-gunbarrel-boulder',
    city: 'Gunbarrel',
    state: 'CO',
    distance: 'in Gunbarrel',
    distanceNote: 'located at 6565 Gunpark Dr in the Gunbarrel neighborhood',
    headline: 'Gunbarrel\'s Record Store',
    subheadline: 'Right here in your neighborhood — vinyl, CDs, and vintage audio on Gunpark Dr.',
    description: 'Recycled Records LP is right here in Gunbarrel at 6565 Gunpark Dr, Suite 190. We moved to the neighborhood in April 2026 and brought our full inventory with us — over 100,000 vinyl records, 20,000 CDs, cassettes, and vintage audio equipment. Every record is ultrasonically cleaned before it hits the floor. Come dig through the crates or bring your collection in to sell.',
    metaTitle: 'Record Store Gunbarrel Boulder CO | Buy & Sell Vinyl — Recycled Records LP',
    metaDescription: 'Recycled Records LP is Gunbarrel\'s neighborhood record store at 6565 Gunpark Dr, Boulder CO. Buy and sell vinyl records, CDs, cassettes, and vintage audio. Open Tue–Sun.',
    faqs: [
      { q: 'Where exactly is Recycled Records LP in Gunbarrel?', a: 'We\'re at 6565 Gunpark Dr, Suite 190, Boulder, CO 80301 — in the Gunbarrel neighborhood. We opened at this location in April 2026.' },
      { q: 'What are your hours in Gunbarrel?', a: 'Tuesday–Friday 11 AM–6 PM, Saturday 10 AM–6 PM, Sunday 12–5 PM. Closed Monday.' },
      { q: 'Do you buy records in Gunbarrel?', a: 'Yes — bring your vinyl records, CDs, cassettes, or vintage audio equipment any time during business hours. No appointment needed.' },
    ],
  },
]

export function getCityBySlug(slug: string): CityPage | undefined {
  return cities.find(c => c.slug === slug)
}
