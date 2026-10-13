import { NextRequest, NextResponse } from 'next/server'

const DOMAIN = '2us6ss-bi.myshopify.com'
const API_VERSION = '2026-07'
const ENDPOINT = `https://${DOMAIN}/api/${API_VERSION}/graphql.json`

export async function POST(req: NextRequest) {
  const { variantId, quantity = 1 } = await req.json()
  if (!variantId) return NextResponse.json({ error: 'Missing variantId' }, { status: 400 })

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
      'Shopify-Storefront-Private-Token': process.env.SHOPIFY_STOREFRONT_PRIVATE_TOKEN!,
    },
    body: JSON.stringify({ query, variables: { variantId, quantity } }),
  })

  const data = await res.json()
  const cart = data?.data?.cartCreate?.cart
  const errors = data?.data?.cartCreate?.userErrors

  if (errors?.length) return NextResponse.json({ error: errors[0].message }, { status: 400 })
  if (!cart) return NextResponse.json({ error: 'Cart creation failed' }, { status: 500 })

  return NextResponse.json({ checkoutUrl: cart.checkoutUrl })
}
