# Recycled Records LP

An editable Next.js App Router + TypeScript + Tailwind CSS landing page matching the approved cream-and-burnt-orange design. Intended for Vercel, with a future Shopify connection.

## Run

Use Node.js 22 or later.

```sh
npm ci
cp .env.example .env.local
npm run dev
```

Production checks and local serving:

```sh
npm run build
npm run typecheck
npm start -- --hostname 127.0.0.1
```

## What works now

- Responsive homepage, record genre filters, equipment section, collection-selling call to action.
- Telephone, Google Maps, and supplied Instagram profile links.
- Business hours from the owner's supplied brief.
- Self-hosted fonts and local artwork; no runtime font CDN.
- Search metadata, business structured data, favicon, and launch-controlled robots/sitemap.
- Online shopping remains a clear coming-soon message unless a verified shop URL is configured.

## Edit here

- `app/page.tsx`: sections and copy.
- `app/globals.css`: visual tokens and responsive layout.
- `lib/store.ts`: contact details, hours, optional integrations.
- `components/genre-crates.tsx`: interactive editorial genre display.
- `public/images/`: local concept images.
- `.env.example`: documented environment variables.

## Vercel

1. Create a Git repository from this directory and commit source plus package-lock.json. Exclude node_modules, .next, and .env.local.
2. Import that repository into the owner's Vercel account. Use the Next.js framework preset. Build command: `npm run build`. Install command: `npm ci`. Leave output directory at the framework default.
3. Deploy a temporary `.vercel.app` URL first. Keep `NEXT_PUBLIC_LAUNCH_READY=false` for preview deployments. This discourages indexing, but does not restrict access; use Vercel's access controls if a private review is required.
4. Confirm hours, telephone, social links, and artwork with the owner.
5. When ready, add `recycledrecordslps.com` in Vercel's domain settings and follow the exact DNS records Vercel supplies. Do not modify the disputed old domain or existing email DNS. No assumed DNS values are included here.
6. For the public production deployment, set `NEXT_PUBLIC_LAUNCH_READY=true` and redeploy. Set the same flag to false in the Preview environment. Public environment variables are read at build time.

No Vercel token or account credential is needed in the source code. This package has not been deployed.

## Outstanding owner confirmations

- Monday closure and remaining hours: brief says closed Monday; legacy website had conflicting hours.
- A working contact email on an owner-controlled service. The old disputed-domain email is deliberately not used.
- Exact Facebook URL; its link appears only when configured.
- Availability and ownership of any existing Shopify or Discogs seller account. No account was connected or inferred.
- Replace illustrative imagery with actual equipment/store photos if preferred. No photographed equipment is offered as actual stock.

## Shopify later

The current optional `NEXT_PUBLIC_SHOP_URL` links to a verified external store. This is not a headless checkout implementation. A future native catalog can use Shopify Storefront API with server-side product queries, cache revalidation, and Shopify checkout. Confirm store ownership, sales-channel access, pickup settings, and synchronization between in-store sales and online inventory before adding live one-off stock. Verify the then-current API documentation and do not expose private tokens in NEXT_PUBLIC variables.

## Asset provenance

`turntable.png` is AI-created concept photography, not an actual product listing. `approved-concept.png` is the approved AI homepage mockup. The four sleeve illustrations and browsing photo are extracted visually using SVG viewBox windows into that supplied image, with no dependence on external image hosts. The complete page is semantic editable HTML, not a full-page screenshot. Replacing those SVG crops with separately exported images is a straightforward later optimization; preserve the artwork until replacements are approved. Fonts are installed through @fontsource and their license files are retained in their respective npm packages.

## Telemetry extension

The only current instrumentation is a local `recordshop:interaction` CustomEvent when a genre is selected. It makes no network request and stores no personal information. `docs/optional-telemetry.sql` provides an optional restricted schema for future curated first-party analytics, staff merchandising decisions, prompt chains, and delayed outcomes. It is not applied or connected. This temporary landing page does not need Supabase or keys to work.

## References

- https://nextjs.org/docs/app/getting-started/installation
- https://vercel.com/docs/frameworks/full-stack/nextjs
- https://shopify.dev/docs/storefronts/headless/building-with-the-storefront-api/getting-started
