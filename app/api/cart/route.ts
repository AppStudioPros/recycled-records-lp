import { NextRequest, NextResponse } from 'next/server'

const DOMAIN = '2us6ss-bi.myshopify.com'
const API_VERSION = '2026-07'
const ENDPOINT = `https://${DOMAIN}/api/${API_VERSION}/graphql.json`

type LineInput = { variantId: string; quantity: number }

export async function POST(req: NextRequest) {
  const body = await req.json()

  // Support both multi-line { lines: [...] } and legacy single { variantId, quantity }
  let lines: LineInput[]
  if (Array.isArray(body.lines) && body.lines.length > 0) {
    lines = body.lines
  } else if (body.variantId) {
    lines = [{ variantId: body.variantId, quantity: body.quantity ?? 1 }]
  } else {
    return NextResponse.json({ error: 'Missing variantId or lines' }, { status: 400 })
  }

  const mutation = `
    mutation CartCreate($lines: [CartLineInput!]!) {
      cartCreate(input: { lines: $lines }) {
        cart { id checkoutUrl }
        userErrors { field message }
      }
    }
  `

  const cartLines = lines.map(l => ({
    merchandiseId: l.variantId,
    quantity: l.quantity,
  }))

  const res = await fetch(ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Shopify-Storefront-Private-Token': process.env.SHOPIFY_STOREFRONT_PRIVATE_TOKEN!,
    },
    body: JSON.stringify({ query: mutation, variables: { lines: cartLines } }),
  })

  const data = await res.json()
  const cart = data?.data?.cartCreate?.cart
  const errors = data?.data?.cartCreate?.userErrors

  if (errors?.length) return NextResponse.json({ error: errors[0].message }, { status: 400 })
  if (!cart) return NextResponse.json({ error: 'Cart creation failed' }, { status: 500 })

  return NextResponse.json({ checkoutUrl: cart.checkoutUrl })
}
