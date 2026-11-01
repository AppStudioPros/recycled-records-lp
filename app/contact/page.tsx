'use client'
import { useState } from 'react'
import { store } from '@/lib/store'
import { Phone, Mail, MapPin, Clock } from 'lucide-react'

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
    background: '#fff',
    border: '1px solid var(--line)',
    borderRadius: '0',
    color: 'var(--ink)',
    padding: '0.75rem 1rem',
    fontSize: '0.95rem',
    outline: 'none',
    boxSizing: 'border-box',
    fontFamily: 'var(--body)',
  }

  return (
    <main>
      {/* Page header */}
      <section style={{ padding: '52px 4% 44px', borderBottom: '1px solid var(--ink)' }}>
        <p className="eyebrow" style={{ marginBottom: '1rem' }}>
          <span className="eyebrow-line" style={{ display: 'inline-block', width: '28px', height: '2px', background: 'var(--orange)', marginRight: '12px', verticalAlign: 'middle' }} />
          Get in touch
        </p>
        <h1 style={{ fontFamily: 'var(--display)', fontSize: 'clamp(2.6rem, 5vw, 4rem)', fontWeight: 800, lineHeight: 1.0, letterSpacing: '-0.05em' }}>
          We'd love to<br />hear from you.
        </h1>
        <p style={{ marginTop: '1.25rem', fontSize: '1.05rem', color: '#4a3828', maxWidth: '520px', lineHeight: 1.7 }}>
          Questions about records, equipment, buying or selling? Drop us a note below or give us a call — we're here Tuesday through Sunday.
        </p>
      </section>

      {/* Two-column content */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', borderBottom: '1px solid var(--ink)' }}>

        {/* Left — form */}
        <div style={{ padding: '48px 4%', borderRight: '1px solid var(--ink)' }}>
          <h2 style={{ fontFamily: 'var(--display)', fontSize: '1.6rem', fontWeight: 800, letterSpacing: '-0.04em', marginBottom: '1.75rem' }}>
            Send us a message
          </h2>

          {status === 'sent' ? (
            <div style={{ padding: '2.5rem', border: '1px solid var(--line)', textAlign: 'center', background: '#fff' }}>
              <p style={{ fontFamily: 'var(--display)', fontSize: '1.3rem', marginBottom: '0.4rem' }}>Message sent!</p>
              <p style={{ color: '#5e594f', fontSize: '0.9rem' }}>We'll get back to you soon.</p>
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
                <button type="submit" disabled={status === 'sending'} className="button" style={{ opacity: status === 'sending' ? 0.6 : 1, cursor: status === 'sending' ? 'default' : 'pointer' }}>
                  {status === 'sending' ? 'Sending…' : 'Send Message'}
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Right — store info */}
        <div style={{ padding: '48px 4%' }}>
          <h2 style={{ fontFamily: 'var(--display)', fontSize: '1.6rem', fontWeight: 800, letterSpacing: '-0.04em', marginBottom: '1.75rem' }}>
            Find us
          </h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
              <Phone size={17} style={{ color: 'var(--orange)', flexShrink: 0, marginTop: '3px' }} />
              <div>
                <p style={{ fontSize: '0.72rem', letterSpacing: '0.12em', textTransform: 'uppercase', fontWeight: 700, marginBottom: '0.3rem' }}>Phone</p>
                <a href={store.phoneHref} style={{ fontSize: '1.1rem', fontWeight: 500 }}>{store.phone}</a>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
              <Mail size={17} style={{ color: 'var(--orange)', flexShrink: 0, marginTop: '3px' }} />
              <div>
                <p style={{ fontSize: '0.72rem', letterSpacing: '0.12em', textTransform: 'uppercase', fontWeight: 700, marginBottom: '0.3rem' }}>Email</p>
                <a href={store.emailHref} style={{ fontSize: '1rem' }}>{store.email}</a>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
              <MapPin size={17} style={{ color: 'var(--orange)', flexShrink: 0, marginTop: '3px' }} />
              <div>
                <p style={{ fontSize: '0.72rem', letterSpacing: '0.12em', textTransform: 'uppercase', fontWeight: 700, marginBottom: '0.3rem' }}>Location</p>
                <a href={store.mapsUrl} target="_blank" rel="noopener noreferrer" style={{ fontSize: '1rem', lineHeight: 1.6 }}>
                  {store.address}<br />{store.locality}
                </a>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
              <Clock size={17} style={{ color: 'var(--orange)', flexShrink: 0, marginTop: '3px' }} />
              <div>
                <p style={{ fontSize: '0.72rem', letterSpacing: '0.12em', textTransform: 'uppercase', fontWeight: 700, marginBottom: '0.75rem' }}>Hours</p>
                <div className="hours" style={{ border: '1px solid var(--ink)', padding: '1.5rem 1.75rem' }}>
                  <dl style={{ margin: 0 }}>
                    {store.hours.map(([day, time]) => (
                      <div key={day} style={{ display: 'flex', justifyContent: 'space-between', gap: '1.5rem', padding: '10px 0', borderBottom: '1px solid var(--line)', fontSize: '0.9rem' }}>
                        <dt style={{ color: '#5e594f' }}>{day}</dt>
                        <dd style={{ margin: 0, whiteSpace: 'nowrap', fontWeight: time === 'Closed' ? 400 : 500, color: time === 'Closed' ? '#aaa' : 'var(--ink)' }}>{time}</dd>
                      </div>
                    ))}
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
