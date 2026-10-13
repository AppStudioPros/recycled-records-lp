'use client'
import { useState, useRef, useCallback, useEffect } from 'react'
import { upload } from '@vercel/blob/client'

type FormState = 'idle' | 'submitting' | 'success' | 'error'

interface UploadedFile {
  name: string
  url: string
  type: 'image' | 'video'
  uploading: boolean
  progress: number
  error?: string
}

async function compressImage(file: File, maxPx = 2048, quality = 0.85): Promise<File> {
  return new Promise((resolve) => {
    const img = new Image()
    const url = URL.createObjectURL(file)
    img.onload = () => {
      URL.revokeObjectURL(url)
      const { width, height } = img
      const scale = Math.min(1, maxPx / Math.max(width, height))
      const w = Math.round(width * scale)
      const h = Math.round(height * scale)
      const canvas = document.createElement('canvas')
      canvas.width = w
      canvas.height = h
      canvas.getContext('2d')!.drawImage(img, 0, 0, w, h)
      canvas.toBlob(
        (blob) => resolve(blob ? new File([blob], file.name.replace(/\.[^.]+$/, '.jpg'), { type: 'image/jpeg' }) : file),
        'image/jpeg',
        quality
      )
    }
    img.onerror = () => { URL.revokeObjectURL(url); resolve(file) }
    img.src = url
  })
}

const inputStyle = {
  width: '100%',
  padding: '0.75rem 1rem',
  border: '1.5px solid rgba(26,16,8,0.2)',
  borderRadius: '6px',
  backgroundColor: '#fff',
  fontSize: '0.95rem',
  color: '#1a1008',
  fontFamily: 'inherit',
  outline: 'none',
  boxSizing: 'border-box' as const,
}

export default function SellForm() {
  const [state, setState] = useState<FormState>('idle')
  const [form, setForm] = useState({ name: '', phone: '', email: '', message: '' })
  const [files, setFiles] = useState<UploadedFile[]>([])
  const [dragging, setDragging] = useState(false)
  const [showMobileSheet, setShowMobileSheet] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const cameraInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    setIsMobile(window.matchMedia('(pointer: coarse)').matches)
  }, [])

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const uploadFile = useCallback(async (file: File) => {
    const isVideo = file.type.startsWith('video/')
    const safeName = `sell-inquiry/${Date.now()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, '_')}`

    setFiles(prev => [...prev, { name: file.name, url: '', type: isVideo ? 'video' : 'image', uploading: true, progress: 0 }])

    try {
      // Compress images before upload (skip videos)
      const toUpload = isVideo ? file : await compressImage(file)

      // Direct client-to-Blob upload with progress tracking
      const blob = await upload(safeName, toUpload, {
        access: 'public',
        handleUploadUrl: '/api/upload',
        onUploadProgress: ({ percentage }) => {
          setFiles(prev => prev.map(f => f.name === file.name ? { ...f, progress: Math.round(percentage) } : f))
        },
      })
      setFiles(prev => prev.map(f => f.name === file.name ? { ...f, url: blob.url, uploading: false, progress: 100 } : f))
    } catch (err) {
      setFiles(prev => prev.map(f => f.name === file.name ? { ...f, uploading: false, progress: 0, error: 'Upload failed' } : f))
    }
  }, [])

  function handleFiles(fileList: FileList | null) {
    if (!fileList) return
    const allowed = ['image/jpeg','image/png','image/webp','image/gif','video/mp4','video/quicktime','video/webm']
    Array.from(fileList).forEach(f => {
      if (!allowed.includes(f.type)) return
      uploadFile(f)
    })
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault()
    setDragging(false)
    handleFiles(e.dataTransfer.files)
  }

  function removeFile(name: string) {
    setFiles(prev => prev.filter(f => f.name !== name))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (files.some(f => f.uploading)) return
    setState('submitting')
    try {
      const fileUrls = files.filter(f => f.url).map(f => ({ name: f.name, url: f.url, type: f.type }))
      const res = await fetch('/api/sell', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, files: fileUrls }),
      })
      if (res.ok) setState('success')
      else setState('error')
    } catch {
      setState('error')
    }
  }

  if (state === 'success') {
    return (
      <div style={{ backgroundColor: '#fff', border: '1px solid rgba(26,16,8,0.1)', borderRadius: '8px', padding: '3rem 2rem', textAlign: 'center' }}>
        <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>🎵</div>
        <h2 style={{ fontFamily: 'var(--font-fraunces)', fontSize: '1.5rem', color: '#1a1008', marginBottom: '0.75rem' }}>Got it — we'll be in touch.</h2>
        <p style={{ color: '#4a3828', lineHeight: 1.7, maxWidth: '420px', margin: '0 auto' }}>
          Thanks for reaching out. We'll review your message and get back to you soon. If it's urgent, call us directly at <a href="tel:+17202917000" style={{ color: '#C4522A', fontWeight: 600 }}>720-291-7000</a>.
        </p>
      </div>
    )
  }

  const stillUploading = files.some(f => f.uploading)

  return (
    <form onSubmit={handleSubmit} style={{ backgroundColor: '#fff', border: '1px solid rgba(26,16,8,0.1)', borderRadius: '8px', padding: '2rem' }}>
      <h2 style={{ fontFamily: 'var(--font-fraunces)', fontSize: '1.2rem', color: '#1a1008', marginBottom: '1.5rem' }}>Tell us what you have</h2>

      <div className="sell-form-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
        <div>
          <label htmlFor="name" style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#1a1008', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: '0.4rem' }}>
            Name <span style={{ color: '#C4522A' }}>*</span>
          </label>
          <input id="name" name="name" type="text" required value={form.name} onChange={handleChange} placeholder="Your name" style={inputStyle} />
        </div>
        <div>
          <label htmlFor="phone" style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#1a1008', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: '0.4rem' }}>
            Phone
          </label>
          <input id="phone" name="phone" type="tel" value={form.phone} onChange={handleChange} placeholder="(303) 000-0000" style={inputStyle} />
        </div>
      </div>

      <div style={{ marginBottom: '1rem' }}>
        <label htmlFor="email" style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#1a1008', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: '0.4rem' }}>
          Email <span style={{ color: '#C4522A' }}>*</span>
        </label>
        <input id="email" name="email" type="email" required value={form.email} onChange={handleChange} placeholder="you@example.com" style={inputStyle} />
      </div>

      <div style={{ marginBottom: '1.5rem' }}>
        <label htmlFor="message" style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#1a1008', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: '0.4rem' }}>
          Product Details <span style={{ color: '#C4522A' }}>*</span>
        </label>
        <textarea
          id="message" name="message" required value={form.message} onChange={handleChange} rows={4}
          placeholder="Tell us what you have — genres, approximate quantities, condition, anything useful."
          style={{ ...inputStyle, resize: 'vertical', lineHeight: 1.65 }}
        />
      </div>

      {/* Upload zone */}
      <div style={{ marginBottom: '1.5rem' }}>
        <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#1a1008', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: '0.75rem' }}>
          Photos or Videos (optional)
        </label>

        {/* Drop zone */}
        <div
          onDragOver={e => { e.preventDefault(); setDragging(true) }}
          onDragLeave={() => setDragging(false)}
          onDrop={handleDrop}
          onClick={() => isMobile ? setShowMobileSheet(true) : fileInputRef.current?.click()}
          style={{
            border: `2px dashed ${dragging ? '#C4522A' : 'rgba(26,16,8,0.2)'}`,
            borderRadius: '8px',
            padding: '2rem 1.5rem',
            textAlign: 'center',
            cursor: 'pointer',
            backgroundColor: dragging ? 'rgba(196,82,42,0.04)' : '#fdfaf5',
            transition: 'all 0.15s',
            marginBottom: files.length > 0 ? '1rem' : 0,
          }}
        >
          <div style={{ fontSize: '1.75rem', marginBottom: '0.5rem' }}>📷</div>
          <p style={{ color: '#4a3828', fontSize: '0.9rem', margin: 0, lineHeight: 1.5 }}>
            <span className="drag-text"><strong>Drag and drop</strong> photos or videos here<br /></span>
            <span style={{ fontSize: '0.8rem', opacity: 0.7 }}>Tap to browse your device</span>
          </p>
          <p style={{ fontSize: '0.75rem', color: '#888', margin: '0.5rem 0 0' }}>JPG, PNG, MP4, MOV — no size limit</p>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/jpeg,image/png,image/webp,image/gif,video/mp4,video/quicktime,video/webm"
            style={{ display: 'none' }}
            onChange={e => handleFiles(e.target.files)}
          />
          <input
            ref={cameraInputRef}
            type="file"
            accept="image/*,video/*"
            capture="environment"
            style={{ display: 'none' }}
            onChange={e => handleFiles(e.target.files)}
          />
        </div>

        {/* File list */}
        {files.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {files.map(f => (
              <div key={f.name} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.6rem 0.75rem', backgroundColor: '#fdfaf5', borderRadius: '6px', border: '1px solid rgba(26,16,8,0.1)' }}>
                <span style={{ fontSize: '1rem' }}>{f.type === 'video' ? '🎬' : '🖼️'}</span>
                <span style={{ flex: 1, fontSize: '0.85rem', color: '#1a1008', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{f.name}</span>
                {f.uploading && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', minWidth: '100px' }}>
                    <div style={{ flex: 1, height: '4px', backgroundColor: 'rgba(196,82,42,0.15)', borderRadius: '999px', overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${f.progress}%`, backgroundColor: '#C4522A', borderRadius: '999px', transition: 'width 0.2s ease' }} />
                    </div>
                    <span style={{ fontSize: '0.7rem', color: '#C4522A', fontWeight: 700, whiteSpace: 'nowrap' }}>{f.progress}%</span>
                  </div>
                )}
                {f.error && <span style={{ fontSize: '0.75rem', color: '#c0392b' }}>{f.error}</span>}
                {!f.uploading && !f.error && <span style={{ fontSize: '0.75rem', color: '#27ae60', fontWeight: 600 }}>✓ Ready</span>}
                <button
                  type="button"
                  onClick={() => removeFile(f.name)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#888', fontSize: '1rem', padding: '0', lineHeight: 1 }}
                >×</button>
              </div>
            ))}
          </div>
        )}
      </div>

      {state === 'error' && (
        <p style={{ color: '#c0392b', fontSize: '0.875rem', marginBottom: '1rem' }}>
          Something went wrong. Please try again or call us at <a href="tel:+17202917000" style={{ color: '#C4522A' }}>720-291-7000</a>.
        </p>
      )}

      <button
        type="submit"
        disabled={state === 'submitting' || stillUploading}
        style={{
          padding: '0.85rem 2.5rem',
          backgroundColor: (state === 'submitting' || stillUploading) ? '#9a3f1e' : '#C4522A',
          color: '#FAF7F0',
          fontWeight: 700,
          fontSize: '0.95rem',
          border: 'none',
          borderRadius: '6px',
          cursor: (state === 'submitting' || stillUploading) ? 'not-allowed' : 'pointer',
          letterSpacing: '0.04em',
        }}
      >
        {stillUploading ? 'Waiting for uploads…' : state === 'submitting' ? 'Sending…' : 'Send Message'}
      </button>

      {/* Mobile upload sheet */}
      {showMobileSheet && (
        <div
          onClick={() => setShowMobileSheet(false)}
          style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 100, display: 'flex', alignItems: 'flex-end' }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{ width: '100%', backgroundColor: '#FAF7F0', borderRadius: '16px 16px 0 0', padding: '1.5rem 1.5rem 2.5rem' }}
          >
            <div style={{ width: '40px', height: '4px', backgroundColor: 'rgba(26,16,8,0.2)', borderRadius: '999px', margin: '0 auto 1.5rem' }} />
            <p style={{ fontFamily: 'var(--font-fraunces)', fontSize: '1.1rem', color: '#1a1008', marginBottom: '1rem', textAlign: 'center' }}>Add Photos or Videos</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <button
                type="button"
                onClick={() => { setShowMobileSheet(false); cameraInputRef.current?.click() }}
                style={{ width: '100%', padding: '1rem', backgroundColor: '#C4522A', color: '#FAF7F0', fontWeight: 700, fontSize: '1rem', border: 'none', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
              >
                📷 Take a Photo or Video
              </button>
              <button
                type="button"
                onClick={() => { setShowMobileSheet(false); fileInputRef.current?.click() }}
                style={{ width: '100%', padding: '1rem', backgroundColor: '#fff', color: '#1a1008', fontWeight: 700, fontSize: '1rem', border: '1.5px solid rgba(26,16,8,0.2)', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
              >
                📁 Browse Device
              </button>
              <button
                type="button"
                onClick={() => setShowMobileSheet(false)}
                style={{ width: '100%', padding: '0.85rem', backgroundColor: 'transparent', color: '#888', fontWeight: 600, fontSize: '0.9rem', border: 'none', cursor: 'pointer' }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </form>
  )
}
