const DOMAIN = '2us6ss-bi.myshopify.com'
const API_VERSION = '2026-07'
const ENDPOINT = `https://${DOMAIN}/api/${API_VERSION}/graphql.json`

async function shopifyFetch(query: string, variables?: Record<string, unknown>) {
  const res = await fetch(ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Shopify-Storefront-Private-Token': process.env.SHOPIFY_STOREFRONT_PRIVATE_TOKEN!,
    },
    body: JSON.stringify({ query, variables }),
    next: { revalidate: 60 },
  })
  if (!res.ok) throw new Error(`Shopify fetch failed: ${res.status}`)
  return res.json()
}

export type ShopifyProduct = {
  id: string
  title: string
  handle: string
  priceRange: { minVariantPrice: { amount: string; currencyCode: string } }
  images: { edges: { node: { url: string; altText: string | null } }[] }
  variants: { edges: { node: { id: string; title: string; availableForSale: boolean } }[] }
  productType: string
  tags: string[]
}

export async function getProducts(first = 48): Promise<ShopifyProduct[]> {
  const query = `
    query Products($first: Int!) {
      products(first: $first, sortKey: TITLE) {
        edges {
          node {
            id
            title
            handle
            productType
            tags
            priceRange { minVariantPrice { amount currencyCode } }
            images(first: 1) { edges { node { url altText } } }
            variants(first: 1) { edges { node { id title availableForSale } } }
          }
        }
      }
    }
  `
  const data = await shopifyFetch(query, { first })
  return data?.data?.products?.edges?.map((e: { node: ShopifyProduct }) => e.node) ?? []
}

export async function createCart(variantId: string, quantity = 1) {
  const query = `
    mutation CartCreate($variantId: ID!, $quantity: Int!) {
      cartCreate(input: { lines: [{ merchandiseId: $variantId, quantity: $quantity }] }) {
        cart { id checkoutUrl }
        userErrors { field message }
      }
    }
  `
  const res = await fetch(ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Shopify-Storefront-Access-Token': process.env.NEXT_PUBLIC_SHOPIFY_STOREFRONT_PUBLIC_TOKEN!,
    },
    body: JSON.stringify({ query, variables: { variantId, quantity } }),
  })
  const data = await res.json()
  return data?.data?.cartCreate?.cart
}
