import { useState } from 'react'
import { Helmet } from 'react-helmet-async'
import { Link } from 'react-router-dom'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'

const LAST_UPDATED  = 'April 26, 2026'
const DMCA_EMAIL    = 'dmca@zapsoundboard.com'
const LEGAL_EMAIL   = 'legal@zapsoundboard.com'

// ── Types ────────────────────────────────────────────────────────────────────

interface TakedownForm {
  fullName:         string
  email:            string
  relationship:     string
  address:          string
  copyrightedWork:  string
  infringingUrls:   string
  goodFaith:        boolean
  accuracy:         boolean
}

const EMPTY_FORM: TakedownForm = {
  fullName:        '',
  email:           '',
  relationship:    'owner',
  address:         '',
  copyrightedWork: '',
  infringingUrls:  '',
  goodFaith:       false,
  accuracy:        false,
}

// ── Micro-components ─────────────────────────────────────────────────────────

function P({ children }: { children: React.ReactNode }) {
  return (
    <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.8, marginBottom: 12, marginTop: 0 }}>
      {children}
    </p>
  )
}

function SubHeading({ children }: { children: React.ReactNode }) {
  return (
    <h3 style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)', margin: '20px 0 8px', letterSpacing: '-0.01em' }}>
      {children}
    </h3>
  )
}

function EmailLink({ email }: { email: string }) {
  return (
    <a href={`mailto:${email}`} style={{ color: 'var(--accent-dark)', fontWeight: 600, textDecoration: 'none' }}>
      {email}
    </a>
  )
}


function Callout({ icon, variant, children }: {
  icon: string
  variant: 'warning' | 'info' | 'success' | 'error'
  children: React.ReactNode
}) {
  const map = {
    warning: { bg: 'var(--warning-bg)',    border: 'var(--warning)',       color: 'var(--warning)' },
    info:    { bg: 'var(--accent-subtle)', border: 'var(--accent-border)', color: 'var(--accent-dark)' },
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

const listStyle: React.CSSProperties = {
  margin: '0 0 12px 0', paddingLeft: 20, display: 'flex', flexDirection: 'column', gap: 8,
}
const liStyle: React.CSSProperties = {
  fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.75,
}
const olStyle: React.CSSProperties = {
  ...listStyle, listStyleType: 'decimal',
}

// ── Field components ─────────────────────────────────────────────────────────

function FieldLabel({ htmlFor, required, children }: {
  htmlFor: string
  required?: boolean
  children: React.ReactNode
}) {
  return (
    <label htmlFor={htmlFor} style={{
      fontSize: 13, fontWeight: 600, color: 'var(--text)',
      display: 'block', marginBottom: 6,
    }}>
      {children}
      {required && <span style={{ color: 'var(--error)', marginLeft: 3 }}>*</span>}
    </label>
  )
}

const inputBase: React.CSSProperties = {
  width: '100%', boxSizing: 'border-box',
  border: '1px solid var(--border)', borderRadius: 'var(--r-md)',
  background: 'var(--bg)', color: 'var(--text)',
  fontSize: 14, fontFamily: 'var(--font)', outline: 'none',
  transition: 'border-color var(--t)',
}

// ── Section definitions ───────────────────────────────────────────────────────

interface Section { id: string; title: string; content: React.ReactNode }

function buildSections(): Section[] {
  return [
    {
      id: 'overview',
      title: '1. DMCA Safe Harbor',
      content: (
        <>
          <P>
            ZapSoundboard operates as an online service provider and qualifies for the safe harbor
            protections of the <strong>Digital Millennium Copyright Act (DMCA), 17 U.S.C. § 512</strong>,
            as well as equivalent provisions under EU Directive 2019/790 and other applicable
            copyright laws.
          </P>
          <P>
            As a platform that hosts user-uploaded audio content, we take copyright infringement
            seriously. We have established this notice-and-takedown procedure to respond expeditiously
            to claims of copyright infringement and to protect the rights of copyright owners while
            also safeguarding users who upload legitimate content.
          </P>
          <Callout icon="⏱️" variant="info">
            <strong>24-hour removal policy:</strong> Valid, complete takedown notices received at{' '}
            <EmailLink email={DMCA_EMAIL} /> will be acknowledged within 24 hours and the infringing
            content will be removed or disabled within that window, typically sooner.
          </Callout>
          <P>
            This page covers: how to submit a takedown notice, the counter-notice process, our
            repeat infringer policy, and what happens after each step.
          </P>
        </>
      ),
    },
    {
      id: 'what-is-dmca',
      title: '2. What Is the DMCA?',
      content: (
        <>
          <P>
            The Digital Millennium Copyright Act is a United States copyright law that implements
            two 1996 World Intellectual Property Organisation (WIPO) treaties and addresses the
            relationship between copyright law and digital technology.
          </P>
          <SubHeading>Safe Harbor for Service Providers</SubHeading>
          <P>
            Section 512 of the DMCA provides a "safe harbor" for online service providers —
            platforms like ZapSoundboard — that host user-generated content. To maintain safe
            harbor protection, we must:
          </P>
          <ul style={listStyle}>
            <li style={liStyle}>Not have actual knowledge of infringing material, or upon obtaining such knowledge, act expeditiously to remove it.</li>
            <li style={liStyle}>Not receive a financial benefit directly attributable to infringing activity when we have the right and ability to control it.</li>
            <li style={liStyle}>Designate an agent to receive takedown notices and register that agent with the US Copyright Office.</li>
            <li style={liStyle}>Respond expeditiously to valid takedown notices by removing or disabling access to the claimed infringing material.</li>
            <li style={liStyle}>Implement and enforce a repeat infringer policy.</li>
          </ul>
          <P>
            We comply with all of these requirements. Our designated DMCA agent can be reached at{' '}
            <EmailLink email={DMCA_EMAIL} />.
          </P>
        </>
      ),
    },
    {
      id: 'takedown-requirements',
      title: '3. Takedown Notice Requirements',
      content: (
        <>
          <P>
            To be valid under 17 U.S.C. § 512(c)(3), a takedown notice must include all of the
            following elements. <strong>Incomplete notices will not be actioned</strong> — we will
            notify you of what is missing.
          </P>
          <ol style={olStyle}>
            <li style={liStyle}>
              <strong>Signature</strong> — A physical or electronic signature of the copyright owner
              or a person authorised to act on their behalf.
            </li>
            <li style={liStyle}>
              <strong>Identification of the copyrighted work</strong> — A description of the
              copyrighted work claimed to have been infringed. If multiple works are covered by a
              single notice, a representative list is acceptable.
            </li>
            <li style={liStyle}>
              <strong>Identification of the infringing material</strong> — The URL or other specific
              location of the material you claim is infringing on zapsoundboard.com, with enough
              detail for us to locate it.
            </li>
            <li style={liStyle}>
              <strong>Your contact information</strong> — Your name, address, telephone number, and
              email address so we can contact you about the notice.
            </li>
            <li style={liStyle}>
              <strong>Good-faith statement</strong> — A statement that you have a good-faith belief
              that the use of the material in the manner complained of is not authorised by the
              copyright owner, its agent, or the law.
            </li>
            <li style={liStyle}>
              <strong>Accuracy statement</strong> — A statement, made under penalty of perjury, that
              the information in the notice is accurate and that you are the copyright owner or are
              authorised to act on behalf of the owner.
            </li>
          </ol>
          <Callout icon="⚠️" variant="warning">
            Submitting a false or materially misrepresentative DMCA notice may expose you to
            liability under 17 U.S.C. § 512(f), including damages, attorneys' fees, and other costs.
          </Callout>
        </>
      ),
    },
    {
      id: 'submit-notice',
      title: '4. Submit a Takedown Notice',
      content: (
        <P>
          Use the form below or email <EmailLink email={DMCA_EMAIL} /> directly with all required
          elements listed in Section 3. The form pre-fills the required legal statements for
          your convenience.
        </P>
      ),
    },
    {
      id: 'after-notice',
      title: '5. What Happens After a Notice',
      content: (
        <>
          <P>Once we receive a complete, valid takedown notice:</P>
          <ol style={olStyle}>
            <li style={liStyle}><strong>Acknowledgement (within 24 hours)</strong> — We send a confirmation email to the address provided in the notice.</li>
            <li style={liStyle}><strong>Content removal (within 24 hours)</strong> — We remove or disable access to the claimed infringing Sound on zapsoundboard.com.</li>
            <li style={liStyle}><strong>Uploader notification</strong> — We notify the user who uploaded the content that it has been removed and provide them with a copy of the notice (with your personal contact details redacted if you request it).</li>
            <li style={liStyle}><strong>Counter-notice window</strong> — The uploader has 10–14 business days to file a counter-notice if they believe the takedown was in error.</li>
            <li style={liStyle}><strong>Potential restoration</strong> — If a valid counter-notice is received and you do not seek a court order within the counter-notice window, we may restore the content.</li>
          </ol>
        </>
      ),
    },
    {
      id: 'counter-notice',
      title: '6. Counter-Notice Process',
      content: (
        <>
          <P>
            If your content was removed as a result of a takedown notice and you believe the removal
            was a mistake or misidentification, you may file a counter-notice. Filing a counter-notice
            is a legal action — do not file one if the material is genuinely infringing.
          </P>
          <SubHeading>Required elements (17 U.S.C. § 512(g)(3))</SubHeading>
          <ol style={olStyle}>
            <li style={liStyle}><strong>Your signature</strong> — Physical or electronic.</li>
            <li style={liStyle}><strong>Identification of removed material</strong> — Description of the content and its URL before removal.</li>
            <li style={liStyle}><strong>Good-faith statement</strong> — A statement under penalty of perjury that you have a good-faith belief the material was removed by mistake or misidentification.</li>
            <li style={liStyle}><strong>Your contact information</strong> — Name, address, and phone number.</li>
            <li style={liStyle}><strong>Consent to jurisdiction</strong> — A statement that you consent to jurisdiction of the federal district court for your address (or if outside the US, any judicial district in which ZapSoundboard may be found), and that you will accept service of process from the original complainant.</li>
          </ol>
          <P>
            Send counter-notices to <EmailLink email={DMCA_EMAIL} /> with the subject line{' '}
            <strong>"DMCA Counter-Notice"</strong>. We will forward it to the original complainant.
            If they do not notify us that they have filed a court action within 10–14 business days,
            we may restore the removed content.
          </P>
          <Callout icon="⚠️" variant="warning">
            Filing a false counter-notice may also expose you to liability under 17 U.S.C. § 512(f).
          </Callout>
        </>
      ),
    },
    {
      id: 'repeat-infringer',
      title: '7. Repeat Infringer Policy',
      content: (
        <>
          <P>
            In accordance with 17 U.S.C. § 512(i), ZapSoundboard maintains and enforces a policy
            to terminate the accounts of users who are repeat copyright infringers.
          </P>
          <SubHeading>How it works</SubHeading>
          <ul style={listStyle}>
            <li style={liStyle}><strong>First valid notice:</strong> The infringing Sound is removed. The user receives a written warning.</li>
            <li style={liStyle}><strong>Second valid notice:</strong> The infringing Sound is removed. The user's upload privileges are suspended for 90 days.</li>
            <li style={liStyle}><strong>Third valid notice:</strong> All content uploaded by the user is removed and their account is permanently terminated.</li>
          </ul>
          <P>
            We track notices per account. Notices that are later withdrawn, found to be invalid,
            or successfully countered do not count toward this threshold. We reserve the right to
            accelerate this process — including immediate account termination — for egregious or
            deliberate infringement.
          </P>
          <Callout icon="ℹ️" variant="info">
            All upload submissions go through <strong>admin approval</strong> before being made
            public. This pre-publication review is our first line of defence against infringing
            content reaching the platform.
          </Callout>
        </>
      ),
    },
    {
      id: 'fair-use',
      title: '8. Fair Use & Meme Content',
      content: (
        <>
          <P>
            ZapSoundboard is a meme and gaming soundboard. Much of our content consists of short
            audio clips that may qualify as <strong>fair use</strong> under US copyright law
            (17 U.S.C. § 107) or equivalent doctrines in other jurisdictions, based on factors
            including purpose, nature, amount used, and effect on the market for the original work.
          </P>
          <P>
            We evaluate fair use claims on a case-by-case basis and will not remove content simply
            because a notice is received if we have a reasonable belief that the use is transformative,
            non-commercial, and unlikely to harm the market for the original work.
          </P>
          <P>
            If you believe your takedown notice was rejected on fair use grounds and you disagree,
            contact <EmailLink email={LEGAL_EMAIL} /> for further review.
          </P>
        </>
      ),
    },
    {
      id: 'contact',
      title: '9. Contact',
      content: (
        <>
          <div style={{
            background: 'var(--bg-secondary)', border: '1px solid var(--border)',
            borderRadius: 'var(--r-lg)', padding: 'var(--sp-5)',
            fontSize: 14, color: 'var(--text)', lineHeight: 1.9, marginBottom: 16,
          }}>
            <strong>ZapSoundboard — DMCA Agent</strong><br />
            DMCA takedowns: <EmailLink email={DMCA_EMAIL} /><br />
            General legal: <EmailLink email={LEGAL_EMAIL} /><br />
            Response time: within 24 hours for DMCA, 30 days for general legal
          </div>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <Link to="/terms" style={{ fontSize: 13, color: 'var(--text-secondary)', textDecoration: 'none' }}>
              📋 Terms of Service →
            </Link>
            <Link to="/privacy" style={{ fontSize: 13, color: 'var(--text-secondary)', textDecoration: 'none' }}>
              🔒 Privacy Policy →
            </Link>
          </div>
        </>
      ),
    },
  ]
}

// ── Takedown Form ─────────────────────────────────────────────────────────────

function TakedownForm() {
  const [form,      setForm]      = useState<TakedownForm>(EMPTY_FORM)
  const [errors,    setErrors]    = useState<Partial<Record<keyof TakedownForm, string>>>({})
  const [submitted, setSubmitted] = useState(false)
  const [focused,   setFocused]   = useState<string | null>(null)

  function set<K extends keyof TakedownForm>(key: K, value: TakedownForm[K]) {
    setForm(prev => ({ ...prev, [key]: value }))
    if (errors[key]) setErrors(prev => ({ ...prev, [key]: undefined }))
  }

  function validate(): boolean {
    const e: Partial<Record<keyof TakedownForm, string>> = {}
    if (!form.fullName.trim())        e.fullName        = 'Your full name is required.'
    if (!form.email.trim())           e.email           = 'Your email address is required.'
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = 'Please enter a valid email address.'
    if (!form.address.trim())         e.address         = 'Your contact address is required.'
    if (!form.copyrightedWork.trim()) e.copyrightedWork = 'Please describe the copyrighted work.'
    if (!form.infringingUrls.trim())  e.infringingUrls  = 'Please provide at least one infringing URL.'
    if (!form.goodFaith)              e.goodFaith       = 'You must confirm the good-faith statement.'
    if (!form.accuracy)               e.accuracy        = 'You must confirm the accuracy statement under penalty of perjury.'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!validate()) return
    // In production this would POST to an API endpoint.
    setSubmitted(true)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function inputStyle(field: keyof TakedownForm): React.CSSProperties {
    const hasError = !!errors[field]
    const isFocused = focused === field
    return {
      ...inputBase,
      padding: '0 14px',
      height: 44,
      borderColor: hasError ? 'var(--error)' : isFocused ? 'var(--accent)' : 'var(--border)',
    }
  }

  function textareaStyle(field: keyof TakedownForm): React.CSSProperties {
    const hasError = !!errors[field]
    const isFocused = focused === field
    return {
      ...inputBase,
      padding: '12px 14px',
      minHeight: 100,
      resize: 'vertical' as const,
      borderColor: hasError ? 'var(--error)' : isFocused ? 'var(--accent)' : 'var(--border)',
    }
  }

  function FieldError({ field }: { field: keyof TakedownForm }) {
    if (!errors[field]) return null
    return (
      <span style={{ fontSize: 12, color: 'var(--error)', marginTop: 4, display: 'block' }}>
        {errors[field]}
      </span>
    )
  }

  if (submitted) {
    return (
      <div style={{
        background: 'var(--success-bg)', border: '1px solid var(--success)',
        borderRadius: 'var(--r-xl)', padding: 'var(--sp-8)',
        textAlign: 'center',
      }}>
        <div style={{ fontSize: 40, marginBottom: 16 }}>✅</div>
        <h3 style={{ fontSize: 18, fontWeight: 800, color: 'var(--success)', marginBottom: 10 }}>
          Notice Received
        </h3>
        <p style={{ fontSize: 14, color: 'var(--success)', lineHeight: 1.7, marginBottom: 20, maxWidth: 460, margin: '0 auto 20px' }}>
          Your takedown notice has been submitted. We will acknowledge it and action the removal
          within <strong>24 hours</strong>. A confirmation will be sent to{' '}
          <strong>{form.email}</strong>.
        </p>
        <button
          onClick={() => { setForm(EMPTY_FORM); setSubmitted(false) }}
          style={{
            padding: '10px 24px', borderRadius: 'var(--r-md)',
            border: '1px solid var(--success)', background: 'transparent',
            color: 'var(--success)', fontSize: 14, fontWeight: 600,
            cursor: 'pointer', fontFamily: 'var(--font)',
          }}
        >
          Submit another notice
        </button>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} noValidate style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-5)' }}>

      {/* Name + Email row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 'var(--sp-4)' }}>
        <div>
          <FieldLabel htmlFor="fullName" required>Full name</FieldLabel>
          <input
            id="fullName" type="text" value={form.fullName} maxLength={120}
            placeholder="Jane Smith"
            onChange={e => set('fullName', e.target.value)}
            onFocus={() => setFocused('fullName')}
            onBlur={()  => setFocused(null)}
            style={inputStyle('fullName')}
          />
          <FieldError field="fullName" />
        </div>
        <div>
          <FieldLabel htmlFor="email" required>Email address</FieldLabel>
          <input
            id="email" type="email" value={form.email} maxLength={200}
            placeholder="jane@example.com"
            onChange={e => set('email', e.target.value)}
            onFocus={() => setFocused('email')}
            onBlur={()  => setFocused(null)}
            style={inputStyle('email')}
          />
          <FieldError field="email" />
        </div>
      </div>

      {/* Relationship */}
      <div>
        <FieldLabel htmlFor="relationship" required>Your relationship to the copyright</FieldLabel>
        <select
          id="relationship" value={form.relationship}
          onChange={e => set('relationship', e.target.value)}
          onFocus={() => setFocused('relationship')}
          onBlur={()  => setFocused(null)}
          style={{
            ...inputBase, height: 44, padding: '0 14px', cursor: 'pointer',
            borderColor: focused === 'relationship' ? 'var(--accent)' : 'var(--border)',
          }}
        >
          <option value="owner">I am the copyright owner</option>
          <option value="agent">I am authorised to act on behalf of the copyright owner</option>
        </select>
      </div>

      {/* Address */}
      <div>
        <FieldLabel htmlFor="address" required>Contact address</FieldLabel>
        <textarea
          id="address" value={form.address} maxLength={500}
          rows={2}
          placeholder="Street address, city, country (required for legal validity)"
          onChange={e => set('address', e.target.value)}
          onFocus={() => setFocused('address')}
          onBlur={()  => setFocused(null)}
          style={{ ...textareaStyle('address'), minHeight: 72 }}
        />
        <FieldError field="address" />
      </div>

      {/* Copyrighted work */}
      <div>
        <FieldLabel htmlFor="copyrightedWork" required>Description of the copyrighted work</FieldLabel>
        <textarea
          id="copyrightedWork" value={form.copyrightedWork} maxLength={2000}
          rows={4}
          placeholder={"Describe the original copyrighted work — e.g. 'The song XYZ released by ABC Records in 2022, available at [original URL]. I am the composer and hold all rights.'"}
          onChange={e => set('copyrightedWork', e.target.value)}
          onFocus={() => setFocused('copyrightedWork')}
          onBlur={()  => setFocused(null)}
          style={textareaStyle('copyrightedWork')}
        />
        <FieldError field="copyrightedWork" />
      </div>

      {/* Infringing URLs */}
      <div>
        <FieldLabel htmlFor="infringingUrls" required>URL(s) of the infringing content on ZapSoundboard</FieldLabel>
        <textarea
          id="infringingUrls" value={form.infringingUrls} maxLength={2000}
          rows={3}
          placeholder={`https://zapsoundboard.com/sounds/example-sound\nhttps://zapsoundboard.com/sounds/another-sound`}
          onChange={e => set('infringingUrls', e.target.value)}
          onFocus={() => setFocused('infringingUrls')}
          onBlur={()  => setFocused(null)}
          style={textareaStyle('infringingUrls')}
        />
        <span style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4, display: 'block' }}>
          One URL per line. Must be a zapsoundboard.com URL.
        </span>
        <FieldError field="infringingUrls" />
      </div>

      {/* Legal statements */}
      <div style={{
        background: 'var(--bg-secondary)', border: '1px solid var(--border)',
        borderRadius: 'var(--r-lg)', padding: 'var(--sp-5)',
        display: 'flex', flexDirection: 'column', gap: 'var(--sp-4)',
      }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 4 }}>
          Required Legal Statements
        </div>

        {/* Good faith */}
        <label style={{ display: 'flex', gap: 12, alignItems: 'flex-start', cursor: 'pointer' }}>
          <input
            type="checkbox" checked={form.goodFaith}
            onChange={e => set('goodFaith', e.target.checked)}
            style={{ marginTop: 2, flexShrink: 0, accentColor: 'var(--accent)', width: 16, height: 16 }}
          />
          <div>
            <span style={{ fontSize: 13, color: 'var(--text)', lineHeight: 1.65, display: 'block' }}>
              I have a good-faith belief that use of the material in the manner complained of is not
              authorised by the copyright owner, its agent, or the law.
            </span>
            {errors.goodFaith && (
              <span style={{ fontSize: 12, color: 'var(--error)', display: 'block', marginTop: 4 }}>
                {errors.goodFaith}
              </span>
            )}
          </div>
        </label>

        {/* Accuracy / perjury */}
        <label style={{ display: 'flex', gap: 12, alignItems: 'flex-start', cursor: 'pointer' }}>
          <input
            type="checkbox" checked={form.accuracy}
            onChange={e => set('accuracy', e.target.checked)}
            style={{ marginTop: 2, flexShrink: 0, accentColor: 'var(--accent)', width: 16, height: 16 }}
          />
          <div>
            <span style={{ fontSize: 13, color: 'var(--text)', lineHeight: 1.65, display: 'block' }}>
              I declare, <strong>under penalty of perjury</strong>, that the information in this
              notice is accurate and that I am the copyright owner or am authorised to act on behalf
              of the owner of the exclusive right that is allegedly infringed.
            </span>
            {errors.accuracy && (
              <span style={{ fontSize: 12, color: 'var(--error)', display: 'block', marginTop: 4 }}>
                {errors.accuracy}
              </span>
            )}
          </div>
        </label>
      </div>

      {/* Submit */}
      <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
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
          Submit Takedown Notice
        </button>
        <span style={{ fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.5 }}>
          Or email directly to <EmailLink email={DMCA_EMAIL} />
        </span>
      </div>

    </form>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function DMCAPage() {
  const [activeSection, setActiveSection] = useState<string | null>(null)
  const SECTIONS = buildSections()

  function scrollTo(id: string) {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <>
      <Helmet>
        <title>DMCA Policy — ZapSoundboard</title>
        <meta
          name="description"
          content="ZapSoundboard DMCA Safe Harbor policy. Submit a copyright takedown notice, learn about the counter-notice process, and our 24-hour removal commitment."
        />
        <meta property="og:title"       content="DMCA Policy — ZapSoundboard" />
        <meta property="og:description" content="Submit a DMCA takedown notice to ZapSoundboard. 24-hour removal policy." />
        <meta property="og:type"        content="website" />
        <link rel="canonical"           href="https://zapsoundboard.com/dmca" />
        <meta name="robots"             content="noindex, follow" />
      </Helmet>

      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <Navbar />
        <main style={{ flex: 1 }}>

          {/* ── Hero ── */}
          <section style={{ borderBottom: '1px solid var(--border)', padding: 'var(--sp-10) 0 var(--sp-8)' }}>
            <div className="container" style={{ maxWidth: 920 }}>
              <div style={{
                display: 'inline-flex', alignItems: 'center', gap: 8,
                background: 'var(--bg-secondary)', border: '1px solid var(--border)',
                borderRadius: 'var(--r-full)', padding: '4px 14px',
                fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)',
                letterSpacing: '0.04em', textTransform: 'uppercase', marginBottom: 20,
              }}>
                ⚖️ Legal
              </div>
              <h1 style={{
                fontSize: 'clamp(24px, 4vw, 40px)', fontWeight: 800,
                letterSpacing: '-0.03em', color: 'var(--text)', marginBottom: 12,
              }}>
                DMCA Policy
              </h1>
              <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: 0 }}>
                Last updated: <strong style={{ color: 'var(--text)' }}>{LAST_UPDATED}</strong>
                {' '}·{' '}
                Copyright complaints: <EmailLink email={DMCA_EMAIL} />
                {' '}·{' '}
                Removal within <strong style={{ color: 'var(--text)' }}>24 hours</strong>
              </p>
            </div>
          </section>

          {/* ── Body ── */}
          <div className="container" style={{ maxWidth: 920, padding: 'var(--sp-10) var(--sp-6) var(--sp-16)' }}>
            <div style={{ display: 'flex', gap: 'var(--sp-10)', alignItems: 'flex-start' }}>

              {/* Sidebar TOC */}
              <nav
                className="dmca-toc"
                style={{
                  position: 'sticky', top: 'calc(var(--navbar-h) + 24px)',
                  width: 210, flexShrink: 0,
                  display: 'flex', flexDirection: 'column', gap: 2, minWidth: 210,
                }}
              >
                <div style={{
                  fontSize: 11, fontWeight: 700, color: 'var(--text-muted)',
                  letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 10,
                }}>
                  Contents
                </div>
                {SECTIONS.map(s => (
                  <button
                    key={s.id}
                    onClick={() => { scrollTo(s.id); setActiveSection(s.id) }}
                    style={{
                      textAlign: 'left', border: 'none',
                      padding: '6px 10px', borderRadius: 'var(--r-md)', cursor: 'pointer',
                      fontSize: 12, fontFamily: 'var(--font)',
                      color:      activeSection === s.id ? 'var(--text)'         : 'var(--text-secondary)',
                      fontWeight: activeSection === s.id ? 600                   : 400,
                      background: activeSection === s.id ? 'var(--bg-secondary)' : 'transparent',
                      transition: 'all var(--t)',
                    }}
                    onMouseEnter={e => { if (activeSection !== s.id) e.currentTarget.style.color = 'var(--text)' }}
                    onMouseLeave={e => { if (activeSection !== s.id) e.currentTarget.style.color = 'var(--text-secondary)' }}
                  >
                    {s.title}
                  </button>
                ))}

                {/* Quick-action card */}
                <div style={{
                  marginTop: 'var(--sp-6)',
                  background: 'var(--accent-subtle)', border: '1px solid var(--accent-border)',
                  borderRadius: 'var(--r-lg)', padding: 'var(--sp-4)',
                }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--accent-dark)', marginBottom: 8 }}>
                    Quick Actions
                  </div>
                  <button
                    onClick={() => { scrollTo('submit-notice'); setActiveSection('submit-notice') }}
                    style={{
                      width: '100%', padding: '8px 12px', borderRadius: 'var(--r-md)',
                      border: 'none', background: 'var(--accent)',
                      color: 'var(--accent-text)', fontSize: 12, fontWeight: 700,
                      cursor: 'pointer', fontFamily: 'var(--font)', marginBottom: 6,
                      transition: 'background var(--t)',
                    }}
                    onMouseEnter={e => (e.currentTarget.style.background = 'var(--accent-hover)')}
                    onMouseLeave={e => (e.currentTarget.style.background = 'var(--accent)')}
                  >
                    ↓ Submit Notice
                  </button>
                  <a
                    href={`mailto:${DMCA_EMAIL}?subject=DMCA%20Counter-Notice`}
                    style={{
                      display: 'block', width: '100%', padding: '8px 12px',
                      borderRadius: 'var(--r-md)', border: '1px solid var(--accent-border)',
                      background: 'transparent', color: 'var(--accent-dark)',
                      fontSize: 12, fontWeight: 600, textAlign: 'center',
                      textDecoration: 'none', boxSizing: 'border-box',
                      transition: 'border-color var(--t)',
                    }}
                    onMouseEnter={e => (e.currentTarget.style.borderColor = 'var(--accent)')}
                    onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--accent-border)')}
                  >
                    Counter-Notice →
                  </a>
                </div>
              </nav>

              {/* Main content */}
              <div style={{ flex: 1, minWidth: 0 }}>

                {/* Summary */}
                <div style={{
                  background: 'var(--accent-subtle)', border: '1px solid var(--accent-border)',
                  borderRadius: 'var(--r-xl)', padding: 'var(--sp-5) var(--sp-6)',
                  marginBottom: 'var(--sp-8)',
                }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--accent-dark)', marginBottom: 10 }}>
                    ⚡ At a Glance
                  </div>
                  <ul style={{ ...listStyle, marginBottom: 0 }}>
                    {[
                      'Valid takedown notices are acknowledged and actioned within 24 hours.',
                      'All user uploads go through admin review before going public — first line of defence.',
                      'Uploaders are notified and given a counter-notice window of 10–14 business days.',
                      'Three strikes = permanent account termination under our repeat infringer policy.',
                      'Meme and transformative content may be evaluated for fair use before removal.',
                    ].map((point, i) => (
                      <li key={i} style={{ ...liStyle, color: 'var(--text)' }}>{point}</li>
                    ))}
                  </ul>
                </div>

                {/* Sections */}
                {SECTIONS.map(section => (
                  <section
                    key={section.id}
                    id={section.id}
                    style={{ marginBottom: 'var(--sp-10)', scrollMarginTop: 'calc(var(--navbar-h) + 24px)' }}
                  >
                    <h2 style={{
                      fontSize: 'clamp(15px, 2vw, 18px)', fontWeight: 800,
                      color: 'var(--text)', letterSpacing: '-0.02em',
                      marginBottom: 'var(--sp-4)', paddingBottom: 'var(--sp-3)',
                      borderBottom: '1px solid var(--border)', marginTop: 0,
                    }}>
                      {section.title}
                    </h2>
                    {section.content}
                    {/* Inject form under section 4 */}
                    {section.id === 'submit-notice' && (
                      <div style={{
                        background: 'var(--bg-secondary)', border: '1px solid var(--border)',
                        borderRadius: 'var(--r-xl)', padding: 'var(--sp-6)',
                        marginTop: 'var(--sp-2)',
                      }}>
                        <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)', marginBottom: 'var(--sp-5)' }}>
                          Takedown Notice Form
                        </div>
                        <TakedownForm />
                      </div>
                    )}
                  </section>
                ))}

                {/* Footer bar */}
                <div style={{
                  borderTop: '1px solid var(--border)', paddingTop: 'var(--sp-6)',
                  display: 'flex', justifyContent: 'space-between',
                  alignItems: 'center', flexWrap: 'wrap', gap: 12,
                }}>
                  <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>
                    © {new Date().getFullYear()} ZapSoundboard. All rights reserved.
                  </span>
                  <div style={{ display: 'flex', gap: 12 }}>
                    <Link to="/" style={{ fontSize: 13, color: 'var(--text-secondary)', textDecoration: 'none' }}>
                      ← Back to Soundboard
                    </Link>
                    <button
                      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                      style={{
                        background: 'none', border: 'none', cursor: 'pointer',
                        fontSize: 13, color: 'var(--accent-dark)', fontWeight: 600,
                        fontFamily: 'var(--font)', padding: 0,
                      }}
                    >
                      ↑ Back to top
                    </button>
                  </div>
                </div>

              </div>
            </div>
          </div>
        </main>
        <Footer />
      </div>

      <style>{`
        @media (max-width: 680px) {
          .dmca-toc { display: none !important; }
        }
      `}</style>
    </>
  )
}
