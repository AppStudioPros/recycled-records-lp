import Image from 'next/image';
import GenreCrates from '@/components/genre-crates';
import Header from '@/components/Header';
import ScrollReveal from '@/components/ScrollReveal';
import VinylStamp from '@/components/VinylStamp';
import { store } from '@/lib/store';
const shopTarget = store.shopUrl ?? '/shop';
export default function Home() {
  const faqLd = { '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: [
    { '@type': 'Question', name: 'Where is Recycled Records LP located?', acceptedAnswer: { '@type': 'Answer', text: 'Recycled Records LP is located at 6565 Gunpark Dr, Suite 190, Boulder, CO 80301 (Gunbarrel area). We relocated from Longmont in April 2026.' } },
    { '@type': 'Question', name: 'What are your hours?', acceptedAnswer: { '@type': 'Answer', text: 'We are open Tuesday through Friday 11 AM to 6 PM, Saturday 10 AM to 6 PM, and Sunday 11 AM to 6 PM. We are closed on Mondays.' } },
    { '@type': 'Question', name: 'Do you buy used vinyl records?', acceptedAnswer: { '@type': 'Answer', text: 'Yes. We buy used vinyl records, CDs, cassettes, and vintage audio equipment. We accept collections of all sizes including estate sales. No appointment needed — just bring your records in and we will go through them together.' } },
    { '@type': 'Question', name: 'What records do you buy?', acceptedAnswer: { '@type': 'Answer', text: 'We buy vinyl records across all genres — rock, jazz, soul, blues, hip-hop, classical, country, folk, metal, punk, indie, and more. We also buy CDs, cassettes, vintage audio equipment, turntables, and rare or collectible pressings.' } },
    { '@type': 'Question', name: 'How do you clean your records?', acceptedAnswer: { '@type': 'Answer', text: 'Every used record we sell has been ultrasonically cleaned using a Clear Audio Double Matrix UltraSonic Cleaner and thoroughly inspected before it goes on the floor. We never sell anything we would not proudly play ourselves.' } },
    { '@type': 'Question', name: 'How many records do you have?', acceptedAnswer: { '@type': 'Answer', text: 'We carry over 100,000 vinyl records and 20,000 used CDs. Every section is organized by genre and alphabetized by artist.' } },
    { '@type': 'Question', name: 'Do you have an online shop?', acceptedAnswer: { '@type': 'Answer', text: 'Yes. You can browse and purchase records online at recycledrecordslps.com/shop. Our in-store selection is much larger than what is available online.' } },
    { '@type': 'Question', name: 'What areas do you serve?', acceptedAnswer: { '@type': 'Answer', text: 'We serve Boulder, Longmont, Louisville, Lafayette, Gunbarrel, and surrounding areas in Colorado.' } },
  ]};
  const jsonLd = { '@context': 'https://schema.org', '@type': 'MusicStore', name: store.name, url: store.siteUrl, telephone: '+17202917000', description: 'Boulder\'s destination for new and used vinyl records, CDs, cassettes, and vintage audio. Over 100,000 records and 20,000 CDs, ultrasonically cleaned and curated. Serving Boulder, Longmont, Louisville, Lafayette, and Gunbarrel, CO.', address: { '@type': 'PostalAddress', streetAddress: store.address, addressLocality: 'Boulder', addressRegion: 'CO', postalCode: '80301', addressCountry: 'US' }, geo: { '@type': 'GeoCoordinates', latitude: 40.0634, longitude: -105.2078 }, openingHoursSpecification: [ { '@type': 'OpeningHoursSpecification', dayOfWeek: ['Tuesday','Wednesday','Thursday','Friday'], opens: '11:00', closes: '18:00' }, { '@type': 'OpeningHoursSpecification', dayOfWeek: 'Saturday', opens: '10:00', closes: '18:00' }, { '@type': 'OpeningHoursSpecification', dayOfWeek: 'Sunday', opens: '12:00', closes: '17:00' } ], areaServed: ['Boulder, CO', 'Longmont, CO', 'Louisville, CO', 'Lafayette, CO', 'Gunbarrel, CO'], sameAs: [store.instagramUrl, ...(store.facebookUrl ? [store.facebookUrl] : [])] };
  return <>
    <ScrollReveal />
    <a className="skip-link" href="#main">Skip to content</a>
    <div className="announcement">Our new online home: <span>recycledrecordslps.com</span></div>
    <Header />
    <main id="main">
      <section className="hero" aria-labelledby="hero-title">
        <div className="hero-copy">
          <p className="eyebrow hero-eyebrow">Independent spirit. Boulder, Colorado.</p>
          <h1 id="hero-title" className="hero-h1">Good music<br className="wide-break" /> deserves<br className="wide-break" /> another spin.</h1>
          <p className="hero-description hero-desc">New and used vinyl, vintage audio,<br className="wide-break" /> and your next great discovery.</p>
          <div className="actions hero-actions"><a className="button" href={shopTarget}>Online Shop</a><a className="text-link" href="#sell">Sell Your Collection</a></div>
        </div>
        <div className="hero-visual">
          <Image src="/images/store/exterior-wide.jpg" alt="Recycled Records LP storefront in Boulder, Colorado" fill priority sizes="(max-width: 760px) 100vw, 52vw" style={{objectFit:'cover', objectPosition:'center center'}} />
          <VinylStamp />
        </div>
      </section>
      <div className="format-strip" aria-label="Music formats" role="marquee">
        <div className="marquee-track" aria-hidden="true">
          {[0,1].map(i=>(
            <span key={i}>
              VINYL <span className="marquee-sep">·</span> CDs <span className="marquee-sep">·</span> CASSETTES <span className="marquee-sep">·</span> VINTAGE AUDIO <span className="marquee-sep">·</span> RARE FINDS <span className="marquee-dot">●</span>
            </span>
          ))}
        </div>
      </div>
      <section className="crates section reveal" id="records" aria-labelledby="crates-title">
        <div className="section-heading"><div><h2 id="crates-title">Dig through the crates.</h2><p>Find something worth taking home.</p></div><span className="small-label">A lifetime of listening</span></div>
        <GenreCrates />
        <div className="shop-notice"><p>{store.shopUrl ? 'Explore the current online selection.' : 'Our online shop is getting a fresh spin. The real digging is happening in Boulder.'}</p><a className="text-link" href={store.shopUrl ?? '#visit'}>{store.shopUrl ? 'Shop online' : 'Plan your visit'}</a></div>
      </section>
      <section className="sell reveal" id="sell" aria-labelledby="sell-title">
        <div className="sell-copy"><p className="eyebrow">Keep the good stuff going</p><h2 id="sell-title">Your old records.<br />Someone's<br />new favorites.</h2><p>Making room? Downsizing? Settling an estate? We buy used vinyl, CDs, and cassette collections. Bring them in and we'll go through them together — no appointment needed.</p><p style={{fontSize:'0.9em',marginTop:'0.75rem',opacity:0.85}}>We buy collections of all sizes and serve the Boulder, Longmont, Louisville, Lafayette, and Gunbarrel communities.</p><a className="button button-outline" href={store.phoneHref}>Let's talk records</a></div>
        <div className="digging-photo" role="img" aria-label="Record bin aisle inside Recycled Records LP in Boulder, Colorado">
          <Image src="/images/store/gallery-rock-bins.jpg" alt="Rock vinyl record bins at Recycled Records LP, Boulder CO" fill sizes="(max-width: 760px) 100vw, 50vw" style={{objectFit:'cover', objectPosition:'center'}} />
          <span className="photo-caption">There's always another discovery.</span>
        </div>
      </section>
      <section className="audio section reveal" id="audio" aria-labelledby="audio-title"><div><p className="eyebrow">The equipment shelf</p><h2 id="audio-title">Put a little<br />warmth in your sound.</h2></div><div><p>Turntables, audio equipment, and the physical formats you love. Stop by to see what's in the shop, or call about what you're looking for.</p><a className="text-link" href={store.phoneHref}>Ask about current equipment</a></div></section>
      <section className="section about-store reveal" id="about" aria-labelledby="about-title" style={{borderTop:'1px solid rgba(0,0,0,0.08)',padding:'4rem 2rem',maxWidth:'860px',margin:'0 auto'}}>
        <div className="about-grid" style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'3rem',alignItems:'start'}}>
          <div>
            <p className="eyebrow">Cleaned + Curated</p>
            <h2 id="about-title" style={{fontSize:'clamp(1.5rem,3vw,2rem)',lineHeight:1.2,marginBottom:'1.25rem'}}>A library of vinyl<br />and CDs, done right.</h2>
            <p style={{lineHeight:1.75,marginBottom:'1rem'}}>Every used record in the shop has been ultrasonically cleaned using a Clear Audio Double Matrix Ultrasonic Cleaner and thoroughly inspected before it ever hits the floor. We never sell anything we wouldn't proudly play ourselves.</p>
            <p style={{lineHeight:1.75}}>Recycled Records LP has been part of this community since 2010 — first in Longmont, now in Gunbarrel. With over 100,000 vinyl records and 20,000 used CDs, we carry something for every kind of listener: collectors, audiophiles, casual fans, and people who just found a turntable in their parents' garage.</p>
          </div>
          <div style={{position:'relative',borderRadius:'4px',overflow:'hidden',minHeight:'320px',background:'#e8e0d0'}}>
            <Image src="/images/store/store-equipment.jpg" alt="Vintage hi-fi audio equipment at Recycled Records LP — turntable, Crown amplifiers, and speakers" fill sizes="(max-width:760px) 100vw, 420px" style={{objectFit:'cover',objectPosition:'center top'}} />
          </div>
        </div>
      </section>
      {/* Photo gallery strip */}
      <div style={{overflowX:'auto',display:'flex',gap:'6px',padding:'6px 0',background:'var(--ink)',scrollbarWidth:'none'}} aria-label="Store photos">
        {[
          {src:'/images/store/gallery-rock-bins.jpg', alt:'Rock vinyl record bins at Recycled Records LP Boulder'},
          {src:'/images/store/gallery-posters.jpg', alt:'Concert poster gallery wall at Recycled Records LP'},
          {src:'/images/store/gallery-colored-vinyl.jpg', alt:'Colored vinyl records and movie posters at Recycled Records LP'},
          {src:'/images/store/gallery-jazz-bins.jpg', alt:'Jazz, Soul, and Blues vinyl bins at Recycled Records LP Boulder'},
          {src:'/images/store/gallery-counter.jpg', alt:'Counter and checkout area at Recycled Records LP'},
          {src:'/images/store/gallery-hip-hop.jpg', alt:'Hip Hop and Rap vinyl section at Recycled Records LP'},
          {src:'/images/store/exterior-sign.jpg', alt:'Recycled Records LP storefront sign in Boulder Colorado'},
        ].map((photo) => (
          <div key={photo.src} style={{flex:'0 0 auto',position:'relative',width:'clamp(200px,28vw,340px)',aspectRatio:'4/3',overflow:'hidden',background:'#2a1a0a'}}>
            <Image src={photo.src} alt={photo.alt} fill sizes="340px" style={{objectFit:'cover'}} />
          </div>
        ))}
      </div>
      <section className="visit section reveal" id="visit" aria-labelledby="visit-title"><div><p className="eyebrow">Drop the needle. Drop by.</p><h2 id="visit-title">Come get lost<br />for an hour.</h2><address>{store.address}<br />{store.locality}</address><div className="actions"><a className="button" href={store.mapsUrl} target="_blank" rel="noopener noreferrer">Get directions</a><a className="text-link" href={store.phoneHref}>{store.phone}</a><a className="text-link" href={store.emailHref}>{store.email}</a></div><p className="visit-note">In-store shopping &amp; pickup. Call to confirm availability.</p></div><div className="hours"><h3>See you at the shop.</h3><dl>{store.hours.map(([day,time]) => <div key={day}><dt>{day}</dt><dd>{time}</dd></div>)}</dl><p>Follow the next find.</p><div className="socials"><a href={store.instagramUrl} target="_blank" rel="noopener noreferrer">Instagram</a>{store.facebookUrl && <a href={store.facebookUrl} target="_blank" rel="noopener noreferrer">Facebook</a>}</div></div></section>
      <section id="contact" style={{ borderTop: '2px solid var(--ink)', backgroundColor: 'var(--ink)', color: 'var(--cream)', padding: '3rem 4%' }}>
        <div style={{ maxWidth: '860px', margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '3rem', alignItems: 'center' }} className="about-grid">
          <div>
            <p className="eyebrow" style={{ color: '#C4522A', marginBottom: '0.75rem' }}>Get in touch</p>
            <h2 style={{ fontSize: 'clamp(1.75rem,3.5vw,2.75rem)', lineHeight: 1.1, letterSpacing: '-0.04em', marginBottom: '1.25rem', color: 'var(--cream)' }}>We're here.<br />Give us a call.</h2>
            <p style={{ opacity: 0.75, lineHeight: 1.7, marginBottom: '1.5rem', maxWidth: '380px' }}>Questions about buying or selling? Want to know if we have a specific record? Call the shop — we pick up.</p>
            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
              <a href={store.phoneHref} className="button" style={{ display: 'inline-flex' }}>{store.phone}</a>
              <a href={store.emailHref} className="button" style={{ display: 'inline-flex', backgroundColor: 'transparent', border: '1.5px solid rgba(242,235,221,0.35)', color: 'var(--cream)' }}>{store.email}</a>
            </div>
          </div>
          <div style={{ borderLeft: '1px solid rgba(242,235,221,0.15)', paddingLeft: '3rem' }}>
            <p style={{ fontWeight: 700, marginBottom: '0.5rem', opacity: 0.6, fontSize: '0.75rem', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Find us</p>
            <address style={{ fontStyle: 'normal', lineHeight: 1.8, marginBottom: '1.25rem', opacity: 0.9 }}>
              {store.address}<br />{store.locality}
            </address>
            <a href={store.mapsUrl} target="_blank" rel="noopener noreferrer" style={{ fontSize: '0.875rem', opacity: 0.7, textDecoration: 'underline', textUnderlineOffset: '3px' }}>Open in Maps →</a>
            <p style={{ fontWeight: 700, marginTop: '1.5rem', marginBottom: '0.5rem', opacity: 0.6, fontSize: '0.75rem', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Selling your collection?</p>
            <a href="/sell" style={{ fontSize: '0.9rem', opacity: 0.85, textDecoration: 'underline', textUnderlineOffset: '3px' }}>Fill out our sell form →</a>
          </div>
        </div>
      </section>
    </main>
    <footer><a className="footer-brand" href="#">Recycled Records LP</a><p>Boulder, Colorado · Buy. Sell. Listen.</p><span>Good records find good homes.</span></footer>
    <script type="application/ld+json" dangerouslySetInnerHTML={{__html:JSON.stringify(jsonLd).replace(/</g,'\\u003c')}} />
    <script type="application/ld+json" dangerouslySetInnerHTML={{__html:JSON.stringify(faqLd).replace(/</g,'\\u003c')}} />
  </>;
}
