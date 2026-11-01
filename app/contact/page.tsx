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

  return (
    <main style={{ backgroundColor: 'var(--ink)', minHeight: '100vh', color: 'var(--cream)', padding: '5rem 1.5rem' }}>
      <div style={{ maxWidth: '1040px', margin: '0 auto' }}>

        {/* Header */}
        <div style={{ marginBottom: '3.5rem' }}>
          <p className="eyebrow" style={{ marginBottom: '1rem' }}>
            <span className="eyebrow-line" />
            Get in touch
          </p>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(2rem, 5vw, 3.5rem)', fontWeight: 400, lineHeight: 1.1, marginBottom: '1rem' }}>
            We'd love to<br />hear from you.
          </h1>
          <p style={{ color: 'var(--cream-muted)', maxWidth: '480px', lineHeight: 1.75 }}>
            Questions about records, equipment, buying or selling? Drop us a note or give us a call. We're here Tuesday through Sunday.
          </p>
        </div>

        {/* Two-column layout */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4rem', alignItems: 'start' }}>

          {/* Left: form */}
          <div>
            {status === 'sent' ? (
              <div style={{ padding: '2.5rem', border: '1px solid rgba(242,235,221,0.15)', textAlign: 'center' }}>
                <p style={{ fontFamily: 'var(--font-display)', fontSize: '1.4rem', marginBottom: '0.5rem' }}>Message sent!</p>
                <p style={{ color: 'var(--cream-muted)', fontSize: '0.9rem' }}>We'll get back to you soon.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.72rem', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--cream-muted)', marginBottom: '0.4rem' }}>Name</label>
                  <input
                    type="text" required value={form.name}
                    onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                    style={{ width: '100%', background: 'rgba(242,235,221,0.06)', border: '1px solid rgba(242,235,221,0.18)', color: 'var(--cream)', padding: '0.75rem 1rem', fontSize: '0.95rem', outline: 'none', boxSizing: 'border-box' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.72rem', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--cream-muted)', marginBottom: '0.4rem' }}>Email</label>
                  <input
                    type="email" required value={form.email}
                    onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                    style={{ width: '100%', background: 'rgba(242,235,221,0.06)', border: '1px solid rgba(242,235,221,0.18)', color: 'var(--cream)', padding: '0.75rem 1rem', fontSize: '0.95rem', outline: 'none', boxSizing: 'border-box' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.72rem', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--cream-muted)', marginBottom: '0.4rem' }}>Message</label>
                  <textarea
                    required rows={5} value={form.message}
                    onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
                    style={{ width: '100%', background: 'rgba(242,235,221,0.06)', border: '1px solid rgba(242,235,221,0.18)', color: 'var(--cream)', padding: '0.75rem 1rem', fontSize: '0.95rem', outline: 'none', resize: 'vertical', boxSizing: 'border-box' }}
                  />
                </div>
                {status === 'error' && <p style={{ color: '#e57373', fontSize: '0.85rem' }}>Something went wrong. Try calling us directly.</p>}
                <button type="submit" disabled={status === 'sending'}
                  style={{ alignSelf: 'flex-start', background: 'var(--gold)', color: 'var(--ink)', border: 'none', padding: '0.8rem 2rem', fontSize: '0.78rem', letterSpacing: '0.12em', textTransform: 'uppercase', fontWeight: 700, cursor: 'pointer', opacity: status === 'sending' ? 0.6 : 1 }}>
                  {status === 'sending' ? 'Sending…' : 'Send Message'}
                </button>
              </form>
            )}
          </div>

          {/* Right: store info */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
              <Phone size={18} style={{ color: 'var(--gold)', flexShrink: 0, marginTop: '2px' }} />
              <div>
                <p style={{ fontSize: '0.72rem', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--cream-muted)', marginBottom: '0.25rem' }}>Phone</p>
                <a href={store.phoneHref} style={{ color: 'var(--cream)', fontSize: '1.1rem', textDecoration: 'none' }}>{store.phone}</a>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
              <Mail size={18} style={{ color: 'var(--gold)', flexShrink: 0, marginTop: '2px' }} />
              <div>
                <p style={{ fontSize: '0.72rem', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--cream-muted)', marginBottom: '0.25rem' }}>Email</p>
                <a href={store.emailHref} style={{ color: 'var(--cream)', fontSize: '1rem', textDecoration: 'none' }}>{store.email}</a>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
              <MapPin size={18} style={{ color: 'var(--gold)', flexShrink: 0, marginTop: '2px' }} />
              <div>
                <p style={{ fontSize: '0.72rem', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--cream-muted)', marginBottom: '0.25rem' }}>Location</p>
                <a href={store.mapsUrl} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--cream)', fontSize: '1rem', textDecoration: 'none', lineHeight: 1.6 }}>
                  {store.address}<br />{store.locality}
                </a>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
              <Clock size={18} style={{ color: 'var(--gold)', flexShrink: 0, marginTop: '2px' }} />
              <div>
                <p style={{ fontSize: '0.72rem', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--cream-muted)', marginBottom: '0.5rem' }}>Hours</p>
                <dl style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                  {store.hours.map(([day, time]) => (
                    <div key={day} style={{ display: 'flex', gap: '1rem', fontSize: '0.9rem' }}>
                      <dt style={{ color: 'var(--cream-muted)', minWidth: '150px' }}>{day}</dt>
                      <dd style={{ color: 'var(--cream)' }}>{time}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
