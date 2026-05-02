import { useState } from 'react'
import { Helmet } from 'react-helmet-async'
import { Link } from 'react-router-dom'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'

const SUPPORT_EMAIL = 'support@zapsoundboard.com'
const DISCORD_URL   = 'https://discord.gg/zapsoundboard'

const SUBJECTS = [
  { value: '',              label: 'Select a topic…',          disabled: true },
  { value: 'general',      label: '💬  General Enquiry'                       },
  { value: 'dmca',         label: '⚖️  DMCA / Copyright'                     },
  { value: 'bug',          label: '🐛  Bug Report'                            },
  { value: 'sound',        label: '🎵  Sound Request'                         },
  { value: 'business',     label: '🤝  Business / Partnership'                },
]

interface ContactForm {
  name:    string
  email:   string
  subject: string
  message: string
}

const EMPTY: ContactForm = { name: '', email: '', subject: '', message: '' }

// ── Contact cards data ────────────────────────────────────────────────────────

const CARDS = [
  {
    icon: '✉️',
    title: 'Email Support',
    desc: 'For all general enquiries, bug reports, and partnership requests.',
    action: (
      <a
        href={`mailto:${SUPPORT_EMAIL}`}
        style={{ color: 'var(--accent-dark)', fontWeight: 700, fontSize: 14, textDecoration: 'none' }}
      >
        {SUPPORT_EMAIL}
      </a>
    ),
  },
  {
    icon: '💬',
    title: 'Discord Community',
    desc: 'Join our server to request sounds, report issues, and chat with the team.',
    action: (
      <a
        href={DISCORD_URL}
        target="_blank"
        rel="noopener noreferrer"
        style={{ color: 'var(--accent-dark)', fontWeight: 700, fontSize: 14, textDecoration: 'none' }}
      >
        Join Discord →
      </a>
    ),
  },
  {
    icon: '⏱️',
    title: 'Response Time',
    desc: 'We aim to respond to all email enquiries within 24–48 hours on business days.',
    action: (
      <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)' }}>
        24–48 hours
      </span>
    ),
  },
  {
    icon: '⚖️',
    title: 'DMCA / Copyright',
    desc: 'For copyright takedown requests we have a dedicated page and 24-hour removal policy.',
    action: (
      <Link
        to="/dmca"
        style={{ color: 'var(--accent-dark)', fontWeight: 700, fontSize: 14, textDecoration: 'none' }}
      >
        DMCA Policy →
      </Link>
    ),
  },
]

// ── Helpers ───────────────────────────────────────────────────────────────────

const inputBase: React.CSSProperties = {
  width: '100%', boxSizing: 'border-box',
  border: '1px solid var(--border)', borderRadius: 'var(--r-md)',
  background: 'var(--bg)', color: 'var(--text)',
  fontSize: 14, fontFamily: 'var(--font)', outline: 'none',
  transition: 'border-color var(--t)',
}

function FieldLabel({ htmlFor, required, children }: {
  htmlFor: string; required?: boolean; children: React.ReactNode
}) {
  return (
    <label htmlFor={htmlFor} style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', display: 'block', marginBottom: 6 }}>
      {children}
      {required && <span style={{ color: 'var(--error)', marginLeft: 3 }}>*</span>}
    </label>
  )
}

function FieldError({ msg }: { msg?: string }) {
  if (!msg) return null
  return <span style={{ fontSize: 12, color: 'var(--error)', marginTop: 4, display: 'block' }}>{msg}</span>
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function ContactPage() {
  const [form,      setForm]      = useState<ContactForm>(EMPTY)
  const [errors,    setErrors]    = useState<Partial<ContactForm>>({})
  const [focused,   setFocused]   = useState<string | null>(null)
  const [submitted, setSubmitted] = useState(false)
  const [hoveredCard, setHoveredCard] = useState<number | null>(null)

  function set<K extends keyof ContactForm>(key: K, val: string) {
    setForm(prev => ({ ...prev, [key]: val }))
    if (errors[key]) setErrors(prev => ({ ...prev, [key]: undefined }))
  }

  function validate(): boolean {
    const e: Partial<ContactForm> = {}
    if (!form.name.trim())                         e.name    = 'Your name is required.'
    if (!form.email.trim())                        e.email   = 'Your email address is required.'
    else if (!/\S+@\S+\.\S+/.test(form.email))    e.email   = 'Please enter a valid email address.'
    if (!form.subject)                             e.subject = 'Please select a topic.'
    if (!form.message.trim())                      e.message = 'Please enter your message.'
    else if (form.message.trim().length < 20)      e.message = 'Message must be at least 20 characters.'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!validate()) return
    setSubmitted(true)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function borderColor(field: keyof ContactForm) {
    if (errors[field])    return 'var(--error)'
    if (focused === field) return 'var(--accent)'
    return 'var(--border)'
  }

  const subjectLabel = SUBJECTS.find(s => s.value === form.subject)?.label ?? ''

  return (
    <>
      <Helmet>
        <title>Contact Us — ZapSoundboard</title>
        <meta
          name="description"
          content="Get in touch with the ZapSoundboard team. Submit bug reports, sound requests, business enquiries, or DMCA notices. We respond within 24–48 hours."
        />
        <meta property="og:title"       content="Contact Us — ZapSoundboard" />
        <meta property="og:description" content="Reach the ZapSoundboard team — support, bugs, partnerships, and DMCA." />
        <meta property="og:type"        content="website" />
        <link rel="canonical"           href="https://zapsoundboard.com/contact" />
      </Helmet>

      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <Navbar />
        <main style={{ flex: 1 }}>

          {/* ── Hero ── */}
          <section style={{ borderBottom: '1px solid var(--border)', padding: 'var(--sp-10) 0 var(--sp-8)' }}>
            <div className="container" style={{ maxWidth: 900 }}>
              <div style={{
                display: 'inline-flex', alignItems: 'center', gap: 8,
                background: 'var(--accent-subtle)', border: '1px solid var(--accent-border)',
                borderRadius: 'var(--r-full)', padding: '4px 14px',
                fontSize: 12, fontWeight: 700, color: 'var(--accent-dark)',
                letterSpacing: '0.04em', textTransform: 'uppercase', marginBottom: 20,
              }}>
                ✉️ Contact
              </div>
              <h1 style={{
                fontSize: 'clamp(26px, 4vw, 42px)', fontWeight: 800,
                letterSpacing: '-0.03em', color: 'var(--text)', marginBottom: 12,
              }}>
                Get in touch
              </h1>
              <p style={{ fontSize: 15, color: 'var(--text-secondary)', lineHeight: 1.7, maxWidth: 520, margin: 0 }}>
                Have a question, found a bug, or want to partner with us? Fill in the form or
                reach us directly — we read every message.
              </p>
            </div>
          </section>

          {/* ── Body ── */}
          <div className="container" style={{ maxWidth: 900, padding: 'var(--sp-10) var(--sp-6) var(--sp-16)' }}>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'minmax(0,1fr) 280px',
              gap: 'var(--sp-10)',
              alignItems: 'flex-start',
            }}
              className="contact-grid"
            >

              {/* ── Form column ── */}
              <div>
                {submitted ? (
                  /* Success state */
                  <div style={{
                    background: 'var(--success-bg)', border: '1px solid var(--success)',
                    borderRadius: 'var(--r-xl)', padding: 'var(--sp-10)',
                    textAlign: 'center',
                  }}>
                    <div style={{ fontSize: 48, marginBottom: 20 }}>✅</div>
                    <h2 style={{ fontSize: 22, fontWeight: 800, color: 'var(--success)', marginBottom: 10, letterSpacing: '-0.02em' }}>
                      Message sent!
                    </h2>
                    <p style={{ fontSize: 14, color: 'var(--success)', lineHeight: 1.7, maxWidth: 400, margin: '0 auto 8px' }}>
                      Thanks, <strong>{form.name.split(' ')[0]}</strong>. We've received your{' '}
                      <strong>{subjectLabel.replace(/^.+?\s+/, '')}</strong> message and will
                      reply to <strong>{form.email}</strong> within 24–48 hours.
                    </p>
                    <p style={{ fontSize: 13, color: 'var(--success)', opacity: 0.75, marginBottom: 28 }}>
                      For urgent copyright issues, also email{' '}
                      <a href="mailto:dmca@zapsoundboard.com" style={{ color: 'var(--success)', fontWeight: 600 }}>
                        dmca@zapsoundboard.com
                      </a>
                      .
                    </p>
                    <button
                      onClick={() => { setForm(EMPTY); setErrors({}); setSubmitted(false) }}
                      style={{
                        padding: '10px 28px', borderRadius: 'var(--r-md)',
                        border: '1px solid var(--success)', background: 'transparent',
                        color: 'var(--success)', fontSize: 14, fontWeight: 600,
                        cursor: 'pointer', fontFamily: 'var(--font)',
                        transition: 'background var(--t)',
                      }}
                      onMouseEnter={e => (e.currentTarget.style.background = '#dcfce7')}
                      onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                    >
                      Send another message
                    </button>
                  </div>
                ) : (
                  /* Contact form */
                  <div style={{
                    background: 'var(--bg-secondary)', border: '1px solid var(--border)',
                    borderRadius: 'var(--r-xl)', padding: 'var(--sp-7)',
                  }}>
                    <h2 style={{
                      fontSize: 16, fontWeight: 800, color: 'var(--text)',
                      marginBottom: 'var(--sp-6)', letterSpacing: '-0.01em',
                    }}>
                      Send us a message
                    </h2>

                    <form onSubmit={handleSubmit} noValidate style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-5)' }}>

                      {/* Name + Email */}
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px,1fr))', gap: 'var(--sp-4)' }}>
                        <div>
                          <FieldLabel htmlFor="name" required>Your name</FieldLabel>
                          <input
                            id="name" type="text" value={form.name}
                            maxLength={100} placeholder="Jane Smith"
                            onChange={e => set('name', e.target.value)}
                            onFocus={() => setFocused('name')}
                            onBlur={()  => setFocused(null)}
                            style={{ ...inputBase, height: 44, padding: '0 14px', borderColor: borderColor('name') }}
                          />
                          <FieldError msg={errors.name} />
                        </div>
                        <div>
                          <FieldLabel htmlFor="email" required>Email address</FieldLabel>
                          <input
                            id="email" type="email" value={form.email}
                            maxLength={200} placeholder="jane@example.com"
                            onChange={e => set('email', e.target.value)}
                            onFocus={() => setFocused('email')}
                            onBlur={()  => setFocused(null)}
                            style={{ ...inputBase, height: 44, padding: '0 14px', borderColor: borderColor('email') }}
                          />
                          <FieldError msg={errors.email} />
                        </div>
                      </div>

                      {/* Subject */}
                      <div>
                        <FieldLabel htmlFor="subject" required>Topic</FieldLabel>
                        <select
                          id="subject" value={form.subject}
                          onChange={e => set('subject', e.target.value)}
                          onFocus={() => setFocused('subject')}
                          onBlur={()  => setFocused(null)}
                          style={{
                            ...inputBase, height: 44, padding: '0 14px',
                            cursor: 'pointer', borderColor: borderColor('subject'),
                            color: form.subject ? 'var(--text)' : 'var(--text-muted)',
                          }}
                        >
                          {SUBJECTS.map(s => (
                            <option
                              key={s.value}
                              value={s.value}
                              disabled={!!s.disabled}
                              style={{ color: 'var(--text)' }}
                            >
                              {s.label}
                            </option>
                          ))}
                        </select>
                        <FieldError msg={errors.subject} />
                      </div>

                      {/* Message */}
                      <div>
                        <FieldLabel htmlFor="message" required>Message</FieldLabel>
                        <textarea
                          id="message" value={form.message}
                          maxLength={3000} rows={6}
                          placeholder="Tell us what's on your mind…"
                          onChange={e => set('message', e.target.value)}
                          onFocus={() => setFocused('message')}
                          onBlur={()  => setFocused(null)}
                          style={{
                            ...inputBase, padding: '12px 14px',
                            minHeight: 140, resize: 'vertical',
                            borderColor: borderColor('message'),
                          }}
                        />
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
                          <FieldError msg={errors.message} />
                          <span style={{ fontSize: 12, color: 'var(--text-muted)', marginLeft: 'auto' }}>
                            {form.message.length} / 3000
                          </span>
                        </div>
                      </div>

                      {/* DMCA hint */}
                      {form.subject === 'dmca' && (
                        <div style={{
                          background: 'var(--warning-bg)', border: '1px solid var(--warning)',
                          borderRadius: 'var(--r-lg)', padding: 'var(--sp-4)',
                          fontSize: 13, color: 'var(--warning)', lineHeight: 1.65,
                        }}>
                          ⚖️ For copyright takedowns, please use our dedicated{' '}
                          <Link to="/dmca" style={{ color: 'var(--warning)', fontWeight: 700 }}>
                            DMCA page
                          </Link>{' '}
                          — it includes a structured form and guarantees a 24-hour response.
                          You can still submit here but the DMCA form is faster.
                        </div>
                      )}

                      {/* Submit */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-4)', flexWrap: 'wrap' }}>
                        <button
                          type="submit"
                          style={{
                            padding: '12px 32px', borderRadius: 'var(--r-lg)',
                            border: 'none', background: 'var(--accent)',
                            color: 'var(--accent-text)', fontSize: 14, fontWeight: 700,
                            cursor: 'pointer', fontFamily: 'var(--font)',
                            transition: 'background var(--t)',
                          }}
                          onMouseEnter={e => (e.currentTarget.style.background = 'var(--accent-hover)')}
                          onMouseLeave={e => (e.currentTarget.style.background = 'var(--accent)')}
                        >
                          Send Message ⚡
                        </button>
                        <span style={{ fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.5 }}>
                          We reply within 24–48 hours
                        </span>
                      </div>

                    </form>
                  </div>
                )}
              </div>

              {/* ── Right column — contact cards ── */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-4)' }}>

                <div style={{
                  fontSize: 11, fontWeight: 700, color: 'var(--text-muted)',
                  letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 4,
                }}>
                  Other ways to reach us
                </div>

                {CARDS.map((card, i) => (
                  <div
                    key={card.title}
                    onMouseEnter={() => setHoveredCard(i)}
                    onMouseLeave={() => setHoveredCard(null)}
                    style={{
                      background: hoveredCard === i ? 'var(--bg-secondary)' : 'var(--bg)',
                      border: `1px solid ${hoveredCard === i ? 'var(--border-hover)' : 'var(--border)'}`,
                      borderRadius: 'var(--r-xl)', padding: 'var(--sp-5)',
                      transition: 'background var(--t), border-color var(--t)',
                    }}
                  >
                    <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                      <div style={{
                        width: 36, height: 36, borderRadius: 'var(--r-md)',
                        background: 'var(--accent-subtle)', border: '1px solid var(--accent-border)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 17, flexShrink: 0,
                      }}>
                        {card.icon}
                      </div>
                      <div style={{ minWidth: 0 }}>
                        <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)', marginBottom: 4 }}>
                          {card.title}
                        </div>
                        <div style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: 8 }}>
                          {card.desc}
                        </div>
                        {card.action}
                      </div>
                    </div>
                  </div>
                ))}

                {/* Legal links */}
                <div style={{
                  borderTop: '1px solid var(--border)', paddingTop: 'var(--sp-4)', marginTop: 'var(--sp-2)',
                  display: 'flex', flexDirection: 'column', gap: 8,
                }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 4 }}>
                    Legal
                  </div>
                  {[
                    { to: '/privacy', label: '🔒 Privacy Policy' },
                    { to: '/terms',   label: '📋 Terms of Service' },
                    { to: '/dmca',    label: '⚖️ DMCA Policy' },
                    { to: '/about',   label: '⚡ About Us' },
                  ].map(link => (
                    <Link
                      key={link.to}
                      to={link.to}
                      style={{
                        fontSize: 13, color: 'var(--text-secondary)',
                        textDecoration: 'none', transition: 'color var(--t)',
                      }}
                      onMouseEnter={e => (e.currentTarget.style.color = 'var(--text)')}
                      onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-secondary)')}
                    >
                      {link.label}
                    </Link>
                  ))}
                </div>

              </div>
            </div>
          </div>
        </main>
        <Footer />
      </div>

      {/* Stack columns on mobile */}
      <style>{`
        @media (max-width: 680px) {
          .contact-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </>
  )
}
