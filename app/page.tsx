import Image from 'next/image';
import GenreCrates from '@/components/genre-crates';
import { store } from '@/lib/store';
const shopTarget = store.shopUrl ?? '#records';
export default function Home() {
  const jsonLd = { '@context': 'https://schema.org', '@type': 'Store', name: store.name, url: store.siteUrl, telephone: '+17202917000', address: { '@type': 'PostalAddress', streetAddress: store.address, addressLocality: 'Boulder', addressRegion: 'CO', postalCode: '80301', addressCountry: 'US' }, sameAs: [store.instagramUrl, ...(store.facebookUrl ? [store.facebookUrl] : [])] };
  return <>
    <a className="skip-link" href="#main">Skip to content</a>
    <div className="announcement">Our new online home: <span>recycledrecordslps.com</span></div>
    <header className="header">
      <a className="wordmark" href="#" aria-label="Recycled Records LP home">RECYCLED<br />RECORDS LP<span className="wordmark-dot">●</span></a>
      <nav aria-label="Main navigation">
        <a href={shopTarget}>Shop Records</a><a href="#audio">Turntables &amp; Audio</a><a href="#sell">Sell Your Collection</a><a href="#visit">Visit Us</a>
      </nav>
      <a className="header-call" href={store.phoneHref}>Call the shop</a>
    </header>
    <main id="main">
      <section className="hero" aria-labelledby="hero-title">
        <div className="hero-copy">
          <p className="eyebrow">Independent spirit. Boulder, Colorado.</p>
          <h1 id="hero-title">Good music<br className="wide-break" /> deserves<br className="wide-break" /> another spin.</h1>
          <p className="hero-description">New and used vinyl, vintage audio,<br className="wide-break" /> and your next great discovery.</p>
          <div className="actions"><a className="button" href={shopTarget}>Explore the Records</a><a className="text-link" href="#sell">Sell Your Collection</a></div>
        </div>
        <div className="hero-visual">
          <Image src="/images/turntable.png" alt="A vintage walnut turntable playing a vinyl record" fill priority sizes="(max-width: 760px) 100vw, 52vw" />
          <div className="stamp" aria-label="Buy, sell, listen. Boulder, Colorado"><span>BUY · SELL · LISTEN</span><strong>33⅓</strong><span>BOULDER, CO</span></div>
        </div>
      </section>
      <div className="format-strip" aria-label="Music formats">VINYL <span>/</span> CDs <span>/</span> CASSETTES <span>/</span> VINTAGE AUDIO <span>/</span> RARE FINDS</div>
      <section className="crates section" id="records" aria-labelledby="crates-title">
        <div className="section-heading"><div><h2 id="crates-title">Dig through the crates.</h2><p>Find something worth taking home.</p></div><span className="small-label">A lifetime of listening</span></div>
        <GenreCrates />
        <div className="shop-notice"><p>{store.shopUrl ? 'Explore the current online selection.' : 'Our online shop is getting a fresh spin. The real digging is happening in Boulder.'}</p><a className="text-link" href={store.shopUrl ?? '#visit'}>{store.shopUrl ? 'Shop online' : 'Plan your visit'}</a></div>
      </section>
      <section className="sell" id="sell" aria-labelledby="sell-title">
        <div className="sell-copy"><p className="eyebrow">Keep the good stuff going</p><h2 id="sell-title">Your old records.<br />Someone’s<br />new favorites.</h2><p>Making room? We buy used music collections. Give us a call and tell us what you’ve got.</p><a className="button button-outline" href={store.phoneHref}>Let’s talk records</a></div>
        <div className="digging-photo" role="img" aria-label="Illustrative close-up of a collector browsing record bins">
          <svg viewBox="537 1094 549 290" preserveAspectRatio="xMidYMid slice" aria-hidden="true"><image href="/images/approved-concept.png" width="1086" height="1448" /></svg>
          <span className="photo-caption">There’s always another discovery.</span>
        </div>
      </section>
      <section className="audio section" id="audio" aria-labelledby="audio-title"><div><p className="eyebrow">The equipment shelf</p><h2 id="audio-title">Put a little<br />warmth in your sound.</h2></div><div><p>Turntables, audio equipment, and the physical formats you love. Stop by to see what’s in the shop, or call about what you’re looking for.</p><a className="text-link" href={store.phoneHref}>Ask about current equipment</a></div></section>
      <section className="visit section" id="visit" aria-labelledby="visit-title"><div><p className="eyebrow">Drop the needle. Drop by.</p><h2 id="visit-title">Come get lost<br />for an hour.</h2><address>{store.address}<br />{store.locality}</address><div className="actions"><a className="button" href={store.mapsUrl} target="_blank" rel="noopener noreferrer">Get directions</a><a className="text-link" href={store.phoneHref}>{store.phone}</a></div><p className="visit-note">In-store shopping &amp; pickup. Call to confirm availability.</p></div><div className="hours"><h3>See you at the shop.</h3><dl>{store.hours.map(([day,time]) => <div key={day}><dt>{day}</dt><dd>{time}</dd></div>)}</dl><p>Follow the next find.</p><div className="socials"><a href={store.instagramUrl} target="_blank" rel="noopener noreferrer">Instagram</a>{store.facebookUrl && <a href={store.facebookUrl} target="_blank" rel="noopener noreferrer">Facebook</a>}</div></div></section>
    </main>
    <footer><a className="footer-brand" href="#">Recycled Records LP</a><p>Boulder, Colorado · Buy. Sell. Listen.</p><span>Good records find good homes.</span></footer>
    <script type="application/ld+json" dangerouslySetInnerHTML={{__html:JSON.stringify(jsonLd).replace(/</g,'\\u003c')}} />
  </>;
}
