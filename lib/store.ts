function httpsUrl(value: string | undefined): string | undefined {
  if (!value) return undefined;
  try { const url = new URL(value); return url.protocol === 'https:' ? url.href : undefined; } catch { return undefined; }
}
export const store = {
  name: 'Recycled Records LP',
  siteUrl: httpsUrl(process.env.NEXT_PUBLIC_SITE_URL) ?? 'https://recycledrecordslps.com/',
  launchReady: process.env.NEXT_PUBLIC_LAUNCH_READY === 'true',
  shopUrl: httpsUrl(process.env.NEXT_PUBLIC_SHOP_URL),
  facebookUrl: httpsUrl(process.env.NEXT_PUBLIC_FACEBOOK_URL),
  instagramUrl: 'https://www.instagram.com/recycledrecordslp/',
  phone: '720-291-7000',
  phoneHref: 'tel:+17202917000',
  address: '6565 Gunpark Dr, Ste 190',
  locality: 'Boulder, CO 80301',
  mapsUrl: 'https://www.google.com/maps/search/?api=1&query=6565+Gunpark+Dr+Suite+190+Boulder+CO+80301',
  hours: [
    ['Monday', 'Closed'],
    ['Tuesday – Friday', '11 AM – 6 PM'],
    ['Saturday', '10 AM – 6 PM'],
    ['Sunday', '11 AM – 6 PM'],
  ],
} as const;
