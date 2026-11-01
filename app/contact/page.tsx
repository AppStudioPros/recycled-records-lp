'use client'
import { useState } from 'react'
import { store } from '@/lib/store'
import { Phone, Mail, MapPin, Clock } from 'lucide-react'
import Header from '@/components/Header'

export default function ContactPage() {
  const [form, setForm] = useState({ name: '', email: '', message: '' })
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setStatus('sending')
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (res.ok) { setStatus('sent'); setForm({ name: '', email: '', message: '' }) }
      else setStatus('error')
    } catch { setStatus('error') }
  }

  const inputStyle: React.CSSProperties = {
    width: '100%',
    background: 'var(--cream)',
    border: '1px solid var(--ink)',
    color: 'var(--ink)',
    padding: '0.75rem 1rem',
    fontSize: '0.95rem',
    fontFamily: 'var(--body)',
    outline: 'none',
    boxSizing: 'border-box',
  }

  return (
    <main>
      <Header />

      {/* Hero */}
      <section className="hero" style={{ minHeight: '340px' }}>
        <div className="hero-copy" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <p className="eyebrow hero-eyebrow">Get in touch</p>
          <h1 style={{ fontFamily: 'var(--display)', fontSize: 'clamp(3rem, 6vw, 5.5rem)', fontWeight: 800, lineHeight: 0.95, letterSpacing: '-0.05em' }}>
            We'd love to<br />hear from you.
          </h1>
          <p className="hero-description" style={{ marginTop: '1.25rem', maxWidth: '440px' }}>
            Questions about records, equipment, buying or selling? We're here Tuesday through Sunday.
          </p>
        </div>
        <div className="hero-visual" style={{ background: 'var(--ink)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ textAlign: 'center', padding: '2rem' }}>
            <a href={store.phoneHref} style={{ fontFamily: 'var(--display)', fontSize: 'clamp(2rem, 4vw, 3.5rem)', fontWeight: 800, color: 'var(--cream)', letterSpacing: '-0.04em', lineHeight: 1.1, display: 'block', marginBottom: '0.5rem' }}>
              {store.phone}
            </a>
            <p style={{ color: '#958f84', fontSize: '0.8rem', letterSpacing: '0.12em', textTransform: 'uppercase' }}>Call the shop</p>
          </div>
        </div>
      </section>

      {/* Form + Info */}
      <section className="section" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '5rem', alignItems: 'start' }}>

        {/* Contact form */}
        <div>
          <p className="eyebrow" style={{ marginBottom: '1.25rem' }}>Send a message</p>
          <h2 style={{ fontFamily: 'var(--display)', fontSize: 'clamp(1.8rem, 3vw, 2.5rem)', fontWeight: 800, letterSpacing: '-0.04em', lineHeight: 1.05, marginBottom: '2rem' }}>
            Drop us a note.
          </h2>

          {status === 'sent' ? (
            <div style={{ padding: '2rem', border: '1px solid var(--ink)', textAlign: 'center', background: '#fff' }}>
              <p style={{ fontFamily: 'var(--display)', fontSize: '1.3rem', marginBottom: '0.4rem' }}>Message sent!</p>
              <p style={{ color: '#5e594f', fontSize: '0.9rem' }}>We'll be in touch soon.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.72rem', letterSpacing: '0.12em', textTransform: 'uppercase', fontWeight: 700, marginBottom: '0.4rem' }}>Name</label>
                <input type="text" required value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} style={inputStyle} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.72rem', letterSpacing: '0.12em', textTransform: 'uppercase', fontWeight: 700, marginBottom: '0.4rem' }}>Email</label>
                <input type="email" required value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} style={inputStyle} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.72rem', letterSpacing: '0.12em', textTransform: 'uppercase', fontWeight: 700, marginBottom: '0.4rem' }}>Message</label>
                <textarea required rows={5} value={form.message} onChange={e => setForm(f => ({ ...f, message: e.target.value }))} style={{ ...inputStyle, resize: 'vertical' }} />
              </div>
              {status === 'error' && <p style={{ color: 'var(--orange)', fontSize: '0.85rem' }}>Something went wrong — try calling us at {store.phone}.</p>}
              <div>
                <button type="submit" disabled={status === 'sending'} className="button" style={{ opacity: status === 'sending' ? 0.6 : 1 }}>
                  {status === 'sending' ? 'Sending…' : 'Send Message'}
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Store info */}
        <div>
          <p className="eyebrow" style={{ marginBottom: '1.25rem' }}>Find us</p>
          <h2 style={{ fontFamily: 'var(--display)', fontSize: 'clamp(1.8rem, 3vw, 2.5rem)', fontWeight: 800, letterSpacing: '-0.04em', lineHeight: 1.05, marginBottom: '2rem' }}>
            Come dig in Boulder.
          </h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
              <Phone size={16} style={{ color: 'var(--orange)', flexShrink: 0, marginTop: '3px' }} />
              <div>
                <p style={{ fontSize: '0.72rem', letterSpacing: '0.12em', textTransform: 'uppercase', fontWeight: 700, marginBottom: '0.25rem' }}>Phone</p>
                <a href={store.phoneHref} className="text-link" style={{ fontSize: '1rem' }}>{store.phone}</a>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
              <Mail size={16} style={{ color: 'var(--orange)', flexShrink: 0, marginTop: '3px' }} />
              <div>
                <p style={{ fontSize: '0.72rem', letterSpacing: '0.12em', textTransform: 'uppercase', fontWeight: 700, marginBottom: '0.25rem' }}>Email</p>
                <a href={store.emailHref} className="text-link" style={{ fontSize: '1rem' }}>{store.email}</a>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
              <MapPin size={16} style={{ color: 'var(--orange)', flexShrink: 0, marginTop: '3px' }} />
              <div>
                <p style={{ fontSize: '0.72rem', letterSpacing: '0.12em', textTransform: 'uppercase', fontWeight: 700, marginBottom: '0.25rem' }}>Location</p>
                <a href={store.mapsUrl} target="_blank" rel="noopener noreferrer" className="text-link" style={{ fontSize: '1rem', lineHeight: 1.7 }}>
                  {store.address}<br />{store.locality}
                </a>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
              <Clock size={16} style={{ color: 'var(--orange)', flexShrink: 0, marginTop: '3px' }} />
              <div style={{ width: '100%' }}>
                <p style={{ fontSize: '0.72rem', letterSpacing: '0.12em', textTransform: 'uppercase', fontWeight: 700, marginBottom: '0.75rem' }}>Hours</p>
                <div className="hours" style={{ border: '1px solid var(--ink)', padding: '1.25rem 1.5rem' }}>
                  <dl style={{ margin: 0 }}>
                    {store.hours.map(([day, time]) => (
                      <div key={day} style={{ display: 'flex', justifyContent: 'space-between', gap: '1.5rem', padding: '10px 0', borderBottom: '1px solid var(--line)', fontSize: '0.88rem' }}>
                        <dt style={{ color: '#5e594f' }}>{day}</dt>
                        <dd style={{ margin: 0, whiteSpace: 'nowrap', color: time === 'Closed' ? '#aaa' : 'var(--ink)' }}>{time}</dd>
                      </div>
                    ))}
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}
