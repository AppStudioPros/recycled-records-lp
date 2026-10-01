# Sonnet implementation and deployment handoff

Use this repository as the implementation, rather than generating a different template. The owner has approved the cream-and-orange visual design included in `public/images/approved-concept.png`.

## Objective

Deploy this Next.js landing page to a temporary Vercel URL in the owner's account. Preserve the approved typography, cream and orange colors, split hero, record artwork, and collection-selling section. Review the current repository's instructions before modifying any existing project.

## Steps

1. Inspect README.md, package.json, lib/store.ts, app/page.tsx, app/globals.css, and .env.example.
2. If working in an existing repository, use a feature branch and merge these files selectively. Do not overwrite existing configuration, secrets, or unrelated application files. If starting fresh, use the supplied directory as the repository root.
3. Run `npm ci`, `npm run build`, and `npm run typecheck`. Use the supplied lockfile. Do not downgrade Next.js or replace the App Router.
4. Review at desktop and 390px mobile width. Check keyboard focus, horizontal overflow, genre filtering, call links, directions, and every navigation target.
5. Use an already authorized Vercel account/CLI session or the owner's normal Git import flow. Do not request passwords in chat or add credentials to the repo. Publish a temporary preview, not a DNS change.
6. Keep NEXT_PUBLIC_LAUNCH_READY=false until the public launch. Report the deployment URL and any unverified business facts.
7. Only after owner direction, connect recycledrecordslps.com using the exact DNS values supplied by Vercel. Do not touch recycledrecordslp.com or its email records.

## Keep these deliberate choices

- Shopify is not yet connected. No fake cart, checkout, prices, stock, ratings, or product availability.
- Telephone is 720-291-7000. Address is 6565 Gunpark Dr, Ste 190, Boulder, CO 80301.
- Hours come from the brief, and Monday closure needs owner confirmation.
- No email form is included because delivery credentials and a reliable owner-controlled mailbox are unconfirmed.
- Instagram URL comes from the owner's brief. Facebook remains absent until the exact verified URL is set.
- No history of the domain dispute appears in public-facing copy.
- Images are illustrative; the sleeve tiles are editorial genre illustrations, not sale listings.
- No visitor telemetry is transmitted. Any analytics or Supabase integration is a separate future change.

## Future Shopify work

Confirm which Shopify store the owner controls and the intended pickup/shipping policy. Plan inventory synchronization before presenting unique used records online. Read current Shopify documentation, keep secrets server-side, and use real product/condition/availability data. The temporary landing page should stay useful while that work is pending.
