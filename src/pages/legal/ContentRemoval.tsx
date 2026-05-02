import { useState } from 'react'
import { Helmet } from 'react-helmet-async'
import { Link } from 'react-router-dom'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'

const REMOVAL_EMAIL = 'removal@zapsoundboard.com'
const LAST_UPDATED  = 'April 26, 2026'

const REASONS = [
  { value: '',            label: 'Select a reason…',                 disabled: true },
  { value: 'copyright',  label: '©  Copyright / Intellectual Property' },
  { value: 'privacy',    label: '🔒  Privacy Violation'               },
  { value: 'harmful',    label: '⚠️  Harmful or Dangerous Content'    },
  { value: 'hateful',    label: '🚫  Hateful or Discriminatory'       },
  { value: 'impersonation', label: '👤  Impersonation'               },
  { value: 'other',      label: '💬  Other'                           },
]

const REASON_HINTS: Record<string, string> = {
  copyright:     'Include the name of the original copyrighted work and your relationship to it (owner or authorised agent). For formal DMCA takedowns please use our dedicated DMCA page.',
  privacy:       'Describe which personal information is exposed — e.g. your voice, name, likeness, or private audio without consent.',
  harmful:       'Describe the specific harm — e.g. instructions for dangerous activities, content that targets a specific individual.',
  hateful:       'Describe the specific language or content that is hateful or discriminatory.',
  impersonation: 'State who is being impersonated and how the sound misrepresents their identity.',
  other:         'Please describe the issue in as much detail as possible in the field below.',
}

interface RemovalForm {
  soundUrl:    string
  soundTitle:  string
  reason:      string
  name:        string
  email:       string
  details:     string
  confirmed:   boolean
}

const EMPTY: RemovalForm = {
  soundUrl:   '',
  soundTitle: '',
  reason:     '',
  name:       '',
  email:      '',
  details:    '',
  confirmed:  false,
}

// ── Micro-components ─────────────────────────────────────────────────────────

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

function Callout({ icon, variant, children }: {
  icon: string; variant: 'info' | 'warning' | 'success' | 'error'; children: React.ReactNode
}) {
  const map = {
    info:    { bg: 'var(--accent-subtle)', border: 'var(--accent-border)', color: 'var(--accent-dark)' },
    warning: { bg: 'var(--warning-bg)',    border: 'var(--warning)',       color: 'var(--warning)' },
    success: { bg: 'var(--success-bg)',    border: 'var(--success)',       color: 'var(--success)' },
    error:   { bg: 'var(--error-bg)',      border: 'var(--error)',         color: 'var(--error)' },
  }
  const s = map[variant]
  return (
    <div style={{
      background: s.bg, border: `1px solid ${s.border}`,
      borderRadius: 'var(--r-lg)', padding: 'var(--sp-4) var(--sp-5)',
      marginBottom: 16, fontSize: 13, color: s.color, lineHeight: 1.7,
    }}>
      <span style={{ marginRight: 6 }}>{icon}</span>{children}
    </div>
  )
}

// ── "What happens next" steps ─────────────────────────────────────────────────

const STEPS = [
  {
    n: '1',
    title: 'Acknowledgement',
    when: 'Within 2 hours',
    desc: 'You will receive an automated confirmation email at the address you provide, with a reference number for your request.',
  },
  {
    n: '2',
    title: 'Review',
    when: 'Within 24 hours',
    desc: 'Our moderation team manually reviews your request against the sound in question, the stated reason, and any additional details you provide.',
  },
  {
    n: '3',
    title: 'Decision & Action',
    when: 'Within 24 hours',
    desc: 'If the request is valid, the sound is removed or restricted and you are notified. If we need more information, we will reply to your email. If the request is declined, we explain why.',
  },
  {
    n: '4',
    title: 'Uploader Notification',
    when: 'On removal',
    desc: 'The uploader is informed that their content was removed and the category of reason (e.g. "copyright claim"), without disclosing your personal details.',
  },
]

// ── Removal Form ──────────────────────────────────────────────────────────────

function RemovalForm() {
  const [form,      setForm]      = useState<RemovalForm>(EMPTY)
  const [errors,    setErrors]    = useState<Partial<Record<keyof RemovalForm, string>>>({})
  const [focused,   setFocused]   = useState<string | null>(null)
  const [submitted, setSubmitted] = useState(false)

  function set<K extends keyof RemovalForm>(key: K, val: RemovalForm[K]) {
    setForm(prev => ({ ...prev, [key]: val }))
    if (errors[key]) setErrors(prev => ({ ...prev, [key]: undefined }))
  }

  function validate(): boolean {
    const e: Partial<Record<keyof RemovalForm, string>> = {}
    if (!form.soundUrl.trim() && !form.soundTitle.trim())
      e.soundUrl = 'Please provide the URL or title of the sound you want removed.'
    if (form.soundUrl.trim() && !/^https?:\/\//i.test(form.soundUrl.trim()))
      e.soundUrl = 'URL must start with http:// or https://'
    if (!form.reason)
      e.reason = 'Please select a reason for removal.'
    if (!form.name.trim())
      e.name = 'Your name is required.'
    if (!form.email.trim())
      e.email = 'Your email address is required.'
    else if (!/\S+@\S+\.\S+/.test(form.email))
      e.email = 'Please enter a valid email address.'
    if (!form.details.trim())
      e.details = 'Please provide additional details about your request.'
    else if (form.details.trim().length < 20)
      e.details = 'Please provide at least 20 characters of detail.'
    if (!form.confirmed)
      e.confirmed = 'You must confirm the accuracy of your request.'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!validate()) return
    setSubmitted(true)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function bc(field: keyof RemovalForm) {
    if (errors[field])     return 'var(--error)'
    if (focused === field)  return 'var(--accent)'
    return 'var(--border)'
  }

  const hint = REASON_HINTS[form.reason] ?? ''
  const reasonLabel = REASONS.find(r => r.value === form.reason)?.label?.replace(/^.+?\s+/, '') ?? ''

  if (submitted) {
    return (
      <div style={{
        background: 'var(--success-bg)', border: '1px solid var(--success)',
        borderRadius: 'var(--r-xl)', padding: 'var(--sp-10)',
        textAlign: 'center',
      }}>
        <div style={{ fontSize: 48, marginBottom: 20 }}>✅</div>
        <h3 style={{ fontSize: 20, fontWeight: 800, color: 'var(--success)', marginBottom: 10, letterSpacing: '-0.02em' }}>
          Request Submitted
        </h3>
        <p style={{ fontSize: 14, color: 'var(--success)', lineHeight: 1.75, maxWidth: 440, margin: '0 auto 8px' }}>
          Your <strong>{reasonLabel}</strong> removal request has been received.
          A confirmation will be sent to <strong>{form.email}</strong> within 2 hours
          and our team will review it within <strong>24 hours</strong>.
        </p>
        <p style={{ fontSize: 13, color: 'var(--success)', opacity: 0.8, marginBottom: 28, lineHeight: 1.6 }}>
          Please check your spam folder if you don't receive the confirmation. For urgent
          copyright matters also email{' '}
          <a href={`mailto:${REMOVAL_EMAIL}`} style={{ color: 'var(--success)', fontWeight: 700 }}>
            {REMOVAL_EMAIL}
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
          Submit another request
        </button>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} noValidate style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-5)' }}>

      {/* Sound URL */}
      <div>
        <FieldLabel htmlFor="soundUrl">Sound URL on ZapSoundboard</FieldLabel>
        <input
          id="soundUrl" type="url" value={form.soundUrl}
          maxLength={500}
          placeholder="https://zapsoundboard.com/sounds/example-sound"
          onChange={e => set('soundUrl', e.target.value)}
          onFocus={() => setFocused('soundUrl')}
          onBlur={()  => setFocused(null)}
          style={{ ...inputBase, height: 44, padding: '0 14px', borderColor: bc('soundUrl') }}
        />
        <FieldError msg={errors.soundUrl} />
      </div>

      {/* Sound title fallback */}
      <div>
        <FieldLabel htmlFor="soundTitle">Sound title (if you don't have the URL)</FieldLabel>
        <input
          id="soundTitle" type="text" value={form.soundTitle}
          maxLength={200}
          placeholder="e.g. 'Vine Boom Sound Effect'"
          onChange={e => set('soundTitle', e.target.value)}
          onFocus={() => setFocused('soundTitle')}
          onBlur={()  => setFocused(null)}
          style={{ ...inputBase, height: 44, padding: '0 14px', borderColor: bc('soundTitle') }}
        />
        <span style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4, display: 'block' }}>
          Providing both helps us locate the content faster.
        </span>
      </div>

      {/* Reason */}
      <div>
        <FieldLabel htmlFor="reason" required>Reason for removal</FieldLabel>
        <select
          id="reason" value={form.reason}
          onChange={e => set('reason', e.target.value)}
          onFocus={() => setFocused('reason')}
          onBlur={()  => setFocused(null)}
          style={{
            ...inputBase, height: 44, padding: '0 14px', cursor: 'pointer',
            borderColor: bc('reason'),
            color: form.reason ? 'var(--text)' : 'var(--text-muted)',
          }}
        >
          {REASONS.map(r => (
            <option key={r.value} value={r.value} disabled={!!r.disabled} style={{ color: 'var(--text)' }}>
              {r.label}
            </option>
          ))}
        </select>
        <FieldError msg={errors.reason} />
        {hint && (
          <div style={{
            marginTop: 8, padding: 'var(--sp-3) var(--sp-4)',
            background: 'var(--accent-subtle)', border: '1px solid var(--accent-border)',
            borderRadius: 'var(--r-md)', fontSize: 12, color: 'var(--accent-dark)', lineHeight: 1.65,
          }}>
            💡 {hint}
            {form.reason === 'copyright' && (
              <>
                {' '}
                <Link to="/dmca" style={{ color: 'var(--accent-dark)', fontWeight: 700 }}>
                  Use the DMCA page →
                </Link>
              </>
            )}
          </div>
        )}
      </div>

      {/* Name + Email */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px,1fr))', gap: 'var(--sp-4)' }}>
        <div>
          <FieldLabel htmlFor="name" required>Your name</FieldLabel>
          <input
            id="name" type="text" value={form.name}
            maxLength={120} placeholder="Jane Smith"
            onChange={e => set('name', e.target.value)}
            onFocus={() => setFocused('name')}
            onBlur={()  => setFocused(null)}
            style={{ ...inputBase, height: 44, padding: '0 14px', borderColor: bc('name') }}
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
            style={{ ...inputBase, height: 44, padding: '0 14px', borderColor: bc('email') }}
          />
          <FieldError msg={errors.email} />
        </div>
      </div>

      {/* Details */}
      <div>
        <FieldLabel htmlFor="details" required>Additional details</FieldLabel>
        <textarea
          id="details" value={form.details}
          maxLength={3000} rows={5}
          placeholder="Describe the issue in as much detail as possible — include how the content affects you and any supporting evidence you can share."
          onChange={e => set('details', e.target.value)}
          onFocus={() => setFocused('details')}
          onBlur={()  => setFocused(null)}
          style={{
            ...inputBase, padding: '12px 14px',
            minHeight: 120, resize: 'vertical',
            borderColor: bc('details'),
          }}
        />
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
          <FieldError msg={errors.details} />
          <span style={{ fontSize: 12, color: 'var(--text-muted)', marginLeft: 'auto' }}>
            {form.details.length} / 3000
          </span>
        </div>
      </div>

      {/* Accuracy confirmation */}
      <div style={{
        background: 'var(--bg-secondary)', border: `1px solid ${errors.confirmed ? 'var(--error)' : 'var(--border)'}`,
        borderRadius: 'var(--r-lg)', padding: 'var(--sp-5)',
        transition: 'border-color var(--t)',
      }}>
        <label style={{ display: 'flex', gap: 12, alignItems: 'flex-start', cursor: 'pointer' }}>
          <input
            type="checkbox" checked={form.confirmed}
            onChange={e => set('confirmed', e.target.checked)}
            style={{ marginTop: 3, flexShrink: 0, accentColor: 'var(--accent)', width: 16, height: 16 }}
          />
          <div>
            <span style={{ fontSize: 13, color: 'var(--text)', lineHeight: 1.65, display: 'block' }}>
              I confirm that the information provided in this request is accurate to the best of my
              knowledge, and that I have a genuine belief that the content described should be removed
              for the reason stated. I understand that submitting a false or misleading request may
              result in my request being dismissed and future requests being declined.
            </span>
            <FieldError msg={errors.confirmed} />
          </div>
        </label>
      </div>

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
          Submit Removal Request
        </button>
        <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
          Or email <a href={`mailto:${REMOVAL_EMAIL}`} style={{ color: 'var(--accent-dark)', fontWeight: 600, textDecoration: 'none' }}>{REMOVAL_EMAIL}</a>
        </span>
      </div>

    </form>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function ContentRemovalPage() {
  const [hoveredStep, setHoveredStep] = useState<number | null>(null)

  return (
    <>
      <Helmet>
        <title>Content Removal — ZapSoundboard</title>
        <meta
          name="description"
          content="Request removal of a sound from ZapSoundboard. Covers copyright, privacy violations, harmful content, and more. Our team reviews all requests within 24 hours."
        />
        <meta property="og:title"       content="Content Removal — ZapSoundboard" />
        <meta property="og:description" content="Submit a content removal request to ZapSoundboard. 24-hour review policy." />
        <meta property="og:type"        content="website" />
        <link rel="canonical"           href="https://zapsoundboard.com/content-removal" />
        <meta name="robots"             content="noindex, follow" />
      </Helmet>

      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <Navbar />
        <main style={{ flex: 1 }}>

          {/* ── Hero ── */}
          <section style={{ borderBottom: '1px solid var(--border)', padding: 'var(--sp-10) 0 var(--sp-8)' }}>
            <div className="container" style={{ maxWidth: 860 }}>
              <div style={{
                display: 'inline-flex', alignItems: 'center', gap: 8,
                background: 'var(--bg-secondary)', border: '1px solid var(--border)',
                borderRadius: 'var(--r-full)', padding: '4px 14px',
                fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)',
                letterSpacing: '0.04em', textTransform: 'uppercase', marginBottom: 20,
              }}>
                🗑️ Content Removal
              </div>
              <h1 style={{
                fontSize: 'clamp(26px, 4vw, 42px)', fontWeight: 800,
                letterSpacing: '-0.03em', color: 'var(--text)', marginBottom: 14,
              }}>
                Request content removal
              </h1>
              <p style={{
                fontSize: 15, color: 'var(--text-secondary)', lineHeight: 1.75,
                maxWidth: 560, marginBottom: 0,
              }}>
                If you believe a sound on ZapSoundboard infringes your rights, violates your privacy,
                or otherwise should not be on the platform — use this page to request its removal.
                All requests are reviewed by our team within <strong style={{ color: 'var(--text)' }}>24 hours</strong>.
              </p>
            </div>
          </section>

          {/* ── Body ── */}
          <div className="container" style={{ maxWidth: 860, padding: 'var(--sp-10) var(--sp-6) var(--sp-16)' }}>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'minmax(0,1fr) 260px',
              gap: 'var(--sp-10)',
              alignItems: 'flex-start',
            }}
              className="removal-grid"
            >

              {/* ── Left: process + form ── */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-8)' }}>

                {/* Process explained */}
                <section>
                  <div style={{
                    fontSize: 11, fontWeight: 700, color: 'var(--text-muted)',
                    letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 'var(--sp-4)',
                  }}>
                    How it works
                  </div>

                  <Callout icon="⏱️" variant="info">
                    <strong>24-hour review policy</strong> — we manually check every request.
                    For formal DMCA copyright takedowns with a 24-hour <em>removal</em> guarantee,
                    use our dedicated{' '}
                    <Link to="/dmca" style={{ color: 'var(--accent-dark)', fontWeight: 700 }}>
                      DMCA page
                    </Link>
                    .
                  </Callout>

                  <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.75, marginBottom: 16 }}>
                    Content removal requests are evaluated on a case-by-case basis. We consider
                    the type of content, the reason provided, supporting evidence, and the applicable
                    legal framework. Submitting a request does not guarantee removal, but every
                    valid request is taken seriously.
                  </p>

                  <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.75, margin: 0 }}>
                    Grounds for removal include — but are not limited to — copyright infringement,
                    unlawful recording of a private individual's voice, content that is
                    defamatory, hateful, or violates our{' '}
                    <Link to="/terms" style={{ color: 'var(--accent-dark)', fontWeight: 600, textDecoration: 'none' }}>
                      Terms of Service
                    </Link>
                    .
                  </p>
                </section>

                {/* Form */}
                <section>
                  <div style={{
                    fontSize: 11, fontWeight: 700, color: 'var(--text-muted)',
                    letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 'var(--sp-4)',
                  }}>
                    Removal request form
                  </div>
                  <div style={{
                    background: 'var(--bg-secondary)', border: '1px solid var(--border)',
                    borderRadius: 'var(--r-xl)', padding: 'var(--sp-7)',
                  }}>
                    <RemovalForm />
                  </div>
                </section>

              </div>

              {/* ── Right: what happens next + related links ── */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-6)' }}>

                {/* What happens next */}
                <div>
                  <div style={{
                    fontSize: 11, fontWeight: 700, color: 'var(--text-muted)',
                    letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 'var(--sp-4)',
                  }}>
                    What happens next
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-3)' }}>
                    {STEPS.map((step, i) => (
                      <div
                        key={step.n}
                        onMouseEnter={() => setHoveredStep(i)}
                        onMouseLeave={() => setHoveredStep(null)}
                        style={{
                          display: 'flex', gap: 14,
                          background: hoveredStep === i ? 'var(--bg-secondary)' : 'var(--bg)',
                          border: `1px solid ${hoveredStep === i ? 'var(--border-hover)' : 'var(--border)'}`,
                          borderRadius: 'var(--r-lg)', padding: 'var(--sp-4)',
                          transition: 'background var(--t), border-color var(--t)',
                        }}
                      >
                        {/* Step number */}
                        <div style={{
                          width: 28, height: 28, borderRadius: 'var(--r-full)',
                          background: 'var(--accent)', color: 'var(--accent-text)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: 12, fontWeight: 800, flexShrink: 0,
                        }}>
                          {step.n}
                        </div>
                        <div>
                          <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, flexWrap: 'wrap', marginBottom: 4 }}>
                            <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)' }}>
                              {step.title}
                            </span>
                            <span style={{
                              fontSize: 11, padding: '1px 7px', borderRadius: 'var(--r-full)',
                              background: 'var(--accent-subtle)', color: 'var(--accent-dark)',
                              fontWeight: 600, border: '1px solid var(--accent-border)',
                              whiteSpace: 'nowrap',
                            }}>
                              {step.when}
                            </span>
                          </div>
                          <p style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.65, margin: 0 }}>
                            {step.desc}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Direct email */}
                <div style={{
                  background: 'var(--bg-secondary)', border: '1px solid var(--border)',
                  borderRadius: 'var(--r-xl)', padding: 'var(--sp-5)',
                }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)', marginBottom: 6 }}>
                    📧 Prefer to email?
                  </div>
                  <p style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.65, marginBottom: 10 }}>
                    Send your request directly — include the sound URL, your reason, name,
                    and contact details.
                  </p>
                  <a
                    href={`mailto:${REMOVAL_EMAIL}?subject=Content%20Removal%20Request`}
                    style={{
                      display: 'block', fontSize: 13, fontWeight: 700,
                      color: 'var(--accent-dark)', textDecoration: 'none',
                    }}
                  >
                    {REMOVAL_EMAIL}
                  </a>
                  <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 6, marginBottom: 0 }}>
                    Last updated: {LAST_UPDATED}
                  </p>
                </div>

                {/* Related links */}
                <div style={{ borderTop: '1px solid var(--border)', paddingTop: 'var(--sp-4)' }}>
                  <div style={{
                    fontSize: 11, fontWeight: 700, color: 'var(--text-muted)',
                    letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 10,
                  }}>
                    Related
                  </div>
                  {[
                    { to: '/dmca',    label: '⚖️  DMCA Policy'       },
                    { to: '/privacy', label: '🔒  Privacy Policy'    },
                    { to: '/terms',   label: '📋  Terms of Service'  },
                    { to: '/contact', label: '✉️  Contact Us'        },
                  ].map(link => (
                    <Link
                      key={link.to}
                      to={link.to}
                      style={{
                        display: 'block', fontSize: 13,
                        color: 'var(--text-secondary)', textDecoration: 'none',
                        marginBottom: 8, transition: 'color var(--t)',
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

      <style>{`
        @media (max-width: 680px) {
          .removal-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </>
  )
}
