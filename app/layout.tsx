import type { Metadata } from 'next';
import '@fontsource/fraunces/latin-700.css';
import '@fontsource/fraunces/latin-800.css';
import '@fontsource/dm-sans/latin-400.css';
import '@fontsource/dm-sans/latin-500.css';
import '@fontsource/dm-sans/latin-700.css';
import './globals.css';
import { store } from '@/lib/store';
import PageTracker from '@/components/PageTracker';

export const metadata: Metadata = {
  metadataBase: new URL(store.siteUrl),
  title: 'Recycled Records LP | Vinyl & Vintage Audio in Boulder, CO',
  description: 'New and used vinyl, CDs, cassettes, and vintage audio in Boulder. Visit Recycled Records LP at 6565 Gunpark Dr, Suite 190. We buy music collections.',
  alternates: { canonical: '/' },
  robots: { index: store.launchReady, follow: store.launchReady },
  openGraph: { title: 'Good music deserves another spin.', description: 'Recycled Records LP • Boulder, Colorado', type: 'website', url: store.siteUrl },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <PageTracker />
        {children}
      </body>
    </html>
  );
}
