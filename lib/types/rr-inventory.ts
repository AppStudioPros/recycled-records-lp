export type RRListing = {
  listing_id: number
  release_id: number
  title: string
  artist: string
  format: string
  genres: string[]
  styles: string[]
  condition: string
  sleeve_condition: string
  price: number
  currency: string
  listing_url: string
  year: number
  label: string
  country: string | null
  notes: string | null
  status: string
  last_synced: string
  created_at: string
}
