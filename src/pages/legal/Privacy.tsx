import { useState } from 'react'
import { Helmet } from 'react-helmet-async'
import { Link } from 'react-router-dom'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'

const LAST_UPDATED = 'April 26, 2026'
const CONTACT_EMAIL = 'privacy@zapsoundboard.com'

interface Section {
  id:       string
  title:    string
  content:  React.ReactNode
}

// Must be declared before SECTIONS so JSX inside the array can reference them
const listStyle: React.CSSProperties = {
  margin: '0 0 12px 0', paddingLeft: 20, display: 'flex', flexDirection: 'column', gap: 8,
}
const liStyle: React.CSSProperties = {
  fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.75,
}
const tableStyle: React.CSSProperties = {
  width: '100%', borderCollapse: 'collapse',
  border: '1px solid var(--border)', borderRadius: 'var(--r-lg)',
  overflow: 'hidden', marginBottom: 16, fontSize: 13,
}
const tdStyle: React.CSSProperties = {
  padding: '10px 14px', borderBottom: '1px solid var(--border)',
  color: 'var(--text-secondary)', verticalAlign: 'top', lineHeight: 1.6,
}

const SECTIONS: Section[] = [
  {
    id: 'overview',
    title: '1. Overview',
    content: (
      <>
        <P>
          ZapSoundboard ("we", "us", or "our") operates the website at{' '}
          <strong>zapsoundboard.com</strong> (the "Service"). This Privacy Policy explains what information
          we collect, why we collect it, how we use it, and the rights you have over your data.
        </P>
        <P>
          We are committed to processing your personal data in accordance with the{' '}
          <strong>General Data Protection Regulation (GDPR)</strong>, the UK GDPR, and other applicable
          data protection laws. By using the Service, you acknowledge that you have read and understood
          this policy.
        </P>
        <P>
          If you do not agree with any part of this policy, please discontinue use of the Service and
          contact us at <EmailLink /> to request deletion of any data we may hold about you.
        </P>
      </>
    ),
  },
  {
    id: 'data-we-collect',
    title: '2. Data We Collect',
    content: (
      <>
        <P>We collect information in two ways: data you provide directly, and data collected automatically.</P>

        <SubHeading>2.1 Data You Provide</SubHeading>
        <ul style={listStyle}>
          <li style={liStyle}><strong>Account information</strong> — If you create an account via Supabase Auth (email/password or OAuth), we store your email address, a hashed password, and a user ID. OAuth sign-ins (e.g. Google) share only the email and display name permitted by your OAuth provider settings.</li>
          <li style={liStyle}><strong>Sound uploads</strong> — When you upload a sound, we store the audio file, the title, category, tags, and the uploader's user ID you provide. Uploaded files are stored on Supabase Storage.</li>
          <li style={liStyle}><strong>Sound requests</strong> — If you submit a sound request, we store the title and category you enter. No account is required; requests are not linked to a user identity.</li>
        </ul>

        <SubHeading>2.2 Data Collected Automatically</SubHeading>
        <ul style={listStyle}>
          <li style={liStyle}><strong>Play counts</strong> — Each time a sound is played, we increment an anonymous counter stored in our database. We do not log which user played which sound.</li>
          <li style={liStyle}><strong>Download counts</strong> — Similarly, download events increment a counter with no user linkage.</li>
          <li style={liStyle}><strong>Analytics data</strong> — Cloudflare Analytics collects aggregated, anonymised traffic data including page views, referrer, browser type, and country. No personally identifiable information (PII) is included. See <strong>Section 4.2</strong> for details.</li>
          <li style={liStyle}><strong>Server logs</strong> — Cloudflare and our hosting infrastructure may temporarily log IP addresses for security and abuse prevention. These logs are automatically purged after 72 hours.</li>
        </ul>

        <SubHeading>2.3 Data We Do NOT Collect</SubHeading>
        <ul style={listStyle}>
          <li style={liStyle}>We do not build individual behavioural profiles.</li>
          <li style={liStyle}>We do not sell, rent, or broker personal data to third parties.</li>
          <li style={liStyle}>We do not track users across other websites.</li>
          <li style={liStyle}>We do not collect payment information — the Service is free.</li>
        </ul>
      </>
    ),
  },
  {
    id: 'legal-basis',
    title: '3. Legal Basis for Processing (GDPR)',
    content: (
      <>
        <P>Under the GDPR, we rely on the following legal bases:</P>
        <table style={tableStyle}>
          <thead>
            <tr>
              <Th>Processing activity</Th>
              <Th>Legal basis</Th>
            </tr>
          </thead>
          <tbody>
            {[
              ['Account creation & authentication', 'Contract (Art. 6(1)(b)) — necessary to provide the account feature you requested'],
              ['Sound uploads', 'Contract (Art. 6(1)(b)) — necessary to fulfil the upload service'],
              ['Anonymised play/download counts', 'Legitimate interests (Art. 6(1)(f)) — understanding which content is popular to improve the Service'],
              ['Cloudflare Analytics', 'Legitimate interests (Art. 6(1)(f)) — aggregated, cookieless analytics with no PII'],
              ['Google AdSense', 'Consent (Art. 6(1)(a)) — personalised ads require your explicit consent via the cookie banner'],
              ['Security & fraud prevention logs', 'Legitimate interests (Art. 6(1)(f)) — protecting the Service from abuse'],
            ].map(([activity, basis], i) => (
              <tr key={i} style={{ background: i % 2 === 0 ? 'var(--bg)' : 'var(--bg-secondary)' }}>
                <td style={tdStyle}>{activity}</td>
                <td style={tdStyle}>{basis}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </>
    ),
  },
  {
    id: 'cookies',
    title: '4. Cookies & Tracking',
    content: (
      <>
        <SubHeading>4.1 Cookies We Set</SubHeading>
        <table style={tableStyle}>
          <thead>
            <tr>
              <Th>Cookie name</Th>
              <Th>Purpose</Th>
              <Th>Duration</Th>
            </tr>
          </thead>
          <tbody>
            {[
              ['zap-theme',      'Stores your light/dark theme preference (localStorage)',                                   'Persistent (local)'],
              ['zap-dismissed-*','Tracks which announcement banners you have dismissed (localStorage)',                      'Persistent (local)'],
              ['sb-*',           'Supabase authentication session tokens — only set if you create an account',               'Session / 1 week'],
            ].map(([name, purpose, duration], i) => (
              <tr key={i} style={{ background: i % 2 === 0 ? 'var(--bg)' : 'var(--bg-secondary)' }}>
                <td style={{ ...tdStyle, fontFamily: 'var(--font-mono)', fontSize: 12 }}>{name}</td>
                <td style={tdStyle}>{purpose}</td>
                <td style={{ ...tdStyle, whiteSpace: 'nowrap' }}>{duration}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <SubHeading>4.2 Cloudflare Analytics</SubHeading>
        <P>
          We use <strong>Cloudflare Web Analytics</strong> — a privacy-first, cookieless analytics
          solution. It does not use cookies, does not fingerprint individual users, and does not share
          data with advertising networks. All metrics are aggregated. See{' '}
          <ExternalLink href="https://www.cloudflare.com/privacypolicy/">
            Cloudflare's Privacy Policy
          </ExternalLink>
          .
        </P>

        <SubHeading>4.3 Google AdSense</SubHeading>
        <P>
          We display advertisements served by <strong>Google AdSense</strong>. If you have given consent
          via our cookie banner, Google may set cookies to serve personalised ads based on your interests.
          If you decline, only non-personalised ads are shown and no advertising cookies are set.
        </P>
        <P>
          Google's use of advertising cookies is governed by the{' '}
          <ExternalLink href="https://policies.google.com/privacy">
            Google Privacy Policy
          </ExternalLink>
          . You can opt out of personalised advertising at{' '}
          <ExternalLink href="https://adssettings.google.com">
            adssettings.google.com
          </ExternalLink>
          .
        </P>

        <SubHeading>4.4 Managing Cookies</SubHeading>
        <P>
          You can withdraw consent or manage cookies at any time via:
        </P>
        <ul style={listStyle}>
          <li style={liStyle}>Our <strong>cookie banner</strong> (re-open it by clearing site data in your browser settings).</li>
          <li style={liStyle}>Your <strong>browser settings</strong> — all major browsers allow you to block or delete cookies.</li>
          <li style={liStyle}><ExternalLink href="https://optout.aboutads.info/">aboutads.info</ExternalLink> or <ExternalLink href="https://www.youronlinechoices.eu/">Your Online Choices</ExternalLink> for advertising opt-outs.</li>
        </ul>
      </>
    ),
  },
  {
    id: 'third-parties',
    title: '5. Third-Party Services',
    content: (
      <>
        <P>We integrate the following third-party services. Each has its own privacy policy and data processing terms:</P>
        <table style={tableStyle}>
          <thead>
            <tr>
              <Th>Service</Th>
              <Th>Purpose</Th>
              <Th>Data shared</Th>
            </tr>
          </thead>
          <tbody>
            {[
              ['Supabase',             'Database, authentication, file storage',   'Email, user ID, uploaded files',        'https://supabase.com/privacy'],
              ['Cloudflare',           'CDN, DDoS protection, analytics',          'IP (transient, 72h), page URL, referrer','https://www.cloudflare.com/privacypolicy/'],
              ['Google AdSense',       'Advertising',                              'Cookies (consent required), ad events', 'https://policies.google.com/privacy'],
            ].map(([service, purpose, data, url], i) => (
              <tr key={i} style={{ background: i % 2 === 0 ? 'var(--bg)' : 'var(--bg-secondary)' }}>
                <td style={tdStyle}>
                  <ExternalLink href={url as string}>{service}</ExternalLink>
                </td>
                <td style={tdStyle}>{purpose}</td>
                <td style={tdStyle}>{data}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <P>
          All third-party processors we use are either based in the EEA or covered by Standard
          Contractual Clauses (SCCs) or an equivalent adequacy decision for international data transfers.
        </P>
      </>
    ),
  },
  {
    id: 'data-retention',
    title: '6. Data Retention',
    content: (
      <>
        <ul style={listStyle}>
          <li style={liStyle}><strong>Account data</strong> — Retained for as long as your account is active. Deleted within 30 days of an account deletion request.</li>
          <li style={liStyle}><strong>Uploaded sounds</strong> — Retained indefinitely unless you delete them from your account, or we remove them for policy violations. Contact us to request removal of a specific upload.</li>
          <li style={liStyle}><strong>Play/download counters</strong> — Aggregated, anonymous counters retained indefinitely as they contain no personal data.</li>
          <li style={liStyle}><strong>Server/security logs</strong> — Automatically deleted after 72 hours.</li>
          <li style={liStyle}><strong>Cloudflare Analytics</strong> — Aggregated data retained for up to 6 months per Cloudflare's policy.</li>
          <li style={liStyle}><strong>AdSense cookies</strong> — Governed by Google's own retention schedules. Typically 13 months.</li>
        </ul>
      </>
    ),
  },
  {
    id: 'your-rights',
    title: '7. Your Rights',
    content: (
      <>
        <P>
          Under the GDPR (and equivalent laws in the UK and other jurisdictions), you have the following
          rights regarding your personal data:
        </P>
        <ul style={listStyle}>
          <li style={liStyle}><strong>Right of access (Art. 15)</strong> — Request a copy of all personal data we hold about you.</li>
          <li style={liStyle}><strong>Right to rectification (Art. 16)</strong> — Ask us to correct inaccurate or incomplete data.</li>
          <li style={liStyle}><strong>Right to erasure / "right to be forgotten" (Art. 17)</strong> — Request deletion of your personal data. We will comply within 30 days unless we have a lawful reason to retain it.</li>
          <li style={liStyle}><strong>Right to restriction of processing (Art. 18)</strong> — Ask us to limit how we process your data in certain circumstances.</li>
          <li style={liStyle}><strong>Right to data portability (Art. 20)</strong> — Receive your data in a structured, machine-readable format (e.g. JSON).</li>
          <li style={liStyle}><strong>Right to object (Art. 21)</strong> — Object to processing based on legitimate interests, including direct marketing.</li>
          <li style={liStyle}><strong>Right to withdraw consent</strong> — Where processing is based on consent (e.g. personalised ads), you may withdraw it at any time without affecting the lawfulness of prior processing.</li>
          <li style={liStyle}><strong>Right to lodge a complaint</strong> — You have the right to complain to your local supervisory authority. In the EU, find your authority at <ExternalLink href="https://edpb.europa.eu/about-edpb/about-edpb/members_en">edpb.europa.eu</ExternalLink>. In the UK: <ExternalLink href="https://ico.org.uk">ico.org.uk</ExternalLink>.</li>
        </ul>
        <P>
          To exercise any of these rights, email us at <EmailLink />. We will respond within{' '}
          <strong>30 days</strong>. We may ask you to verify your identity before fulfilling a request.
        </P>
      </>
    ),
  },
  {
    id: 'data-deletion',
    title: '8. Data Deletion',
    content: (
      <>
        <P>To delete your account and all associated personal data:</P>
        <ol style={{ ...listStyle, listStyleType: 'decimal' }}>
          <li style={liStyle}>Email <EmailLink /> with the subject line <strong>"Account Deletion Request"</strong>.</li>
          <li style={liStyle}>Include the email address associated with your account.</li>
          <li style={liStyle}>We will confirm receipt within 48 hours and complete the deletion within 30 days.</li>
        </ol>
        <P>
          Note: Deleting your account removes your email and authentication credentials. Sounds you
          uploaded will also be removed unless they have been incorporated into a playlist or
          feature that requires them to remain (in which case we will anonymise them). Aggregated,
          anonymous play counters cannot be deleted as they contain no personal data.
        </P>
      </>
    ),
  },
  {
    id: 'children',
    title: '9. Children\'s Privacy',
    content: (
      <>
        <P>
          The Service is not directed at children under the age of <strong>13</strong> (or 16 in
          jurisdictions that apply a higher age threshold). We do not knowingly collect personal
          data from children. If you believe a child has provided us with personal information,
          please contact us at <EmailLink /> and we will delete it promptly.
        </P>
      </>
    ),
  },
  {
    id: 'security',
    title: '10. Security',
    content: (
      <>
        <P>
          We take reasonable technical and organisational measures to protect your personal data:
        </P>
        <ul style={listStyle}>
          <li style={liStyle}>All data in transit is encrypted via <strong>TLS 1.2+</strong>.</li>
          <li style={liStyle}>Passwords are hashed using <strong>bcrypt</strong> via Supabase Auth and are never stored in plaintext.</li>
          <li style={liStyle}>Database access is restricted to application service roles with least-privilege principles.</li>
          <li style={liStyle}>Cloudflare provides DDoS mitigation and WAF protection at the network layer.</li>
        </ul>
        <P>
          No method of transmission or storage is 100% secure. If you discover a security
          vulnerability, please disclose it responsibly to <EmailLink />.
        </P>
      </>
    ),
  },
  {
    id: 'changes',
    title: '11. Changes to This Policy',
    content: (
      <>
        <P>
          We may update this Privacy Policy from time to time. When we do, we will revise the
          "Last updated" date at the top of this page and, where changes are material, display a
          notice on the website. Your continued use of the Service after changes are posted
          constitutes acceptance of the updated policy.
        </P>
        <P>
          We encourage you to review this page periodically. Previous versions can be requested
          by emailing <EmailLink />.
        </P>
      </>
    ),
  },
  {
    id: 'contact',
    title: '12. Contact & Data Controller',
    content: (
      <>
        <P>
          ZapSoundboard is the data controller for all personal data processed under this policy.
          For any privacy-related questions, data subject requests, or complaints, please contact:
        </P>
        <div style={{
          background: 'var(--bg-secondary)', border: '1px solid var(--border)',
          borderRadius: 'var(--r-lg)', padding: 'var(--sp-5)',
          fontSize: 14, color: 'var(--text)', lineHeight: 1.8,
          marginTop: 'var(--sp-3)',
        }}>
          <strong>ZapSoundboard</strong><br />
          Privacy enquiries: <EmailLink /><br />
          Response time: within 30 days of receipt
        </div>
      </>
    ),
  },
]

// ── Shared micro-components ─────────────────────────────────────────────────

function P({ children }: { children: React.ReactNode }) {
  return (
    <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.8, marginBottom: 12, marginTop: 0 }}>
      {children}
    </p>
  )
}

function SubHeading({ children }: { children: React.ReactNode }) {
  return (
    <h3 style={{
      fontSize: 14, fontWeight: 700, color: 'var(--text)',
      margin: '20px 0 8px', letterSpacing: '-0.01em',
    }}>
      {children}
    </h3>
  )
}

function EmailLink() {
  return (
    <a href={`mailto:${CONTACT_EMAIL}`} style={{ color: 'var(--accent-dark)', fontWeight: 600, textDecoration: 'none' }}>
      {CONTACT_EMAIL}
    </a>
  )
}

function ExternalLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      style={{ color: 'var(--accent-dark)', fontWeight: 600, textDecoration: 'none' }}
    >
      {children}
    </a>
  )
}

function Th({ children }: { children: React.ReactNode }) {
  return (
    <th style={{
      padding: '10px 14px', textAlign: 'left', fontSize: 12,
      fontWeight: 700, color: 'var(--text)', background: 'var(--bg-tertiary)',
      borderBottom: '1px solid var(--border)', whiteSpace: 'nowrap',
    }}>
      {children}
    </th>
  )
}

// ── Page ────────────────────────────────────────────────────────────────────

export default function PrivacyPage() {
  const [activeSection, setActiveSection] = useState<string | null>(null)

  function scrollTo(id: string) {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <>
      <Helmet>
        <title>Privacy Policy — ZapSoundboard</title>
        <meta
          name="description"
          content="ZapSoundboard's Privacy Policy — how we collect, use, and protect your data, your GDPR rights, and how to contact us."
        />
        <meta property="og:title"       content="Privacy Policy — ZapSoundboard" />
        <meta property="og:description" content="How ZapSoundboard handles your data, cookies, and GDPR rights." />
        <meta property="og:type"        content="website" />
        <link rel="canonical"           href="https://zapsoundboard.com/privacy" />
        <meta name="robots"             content="noindex, follow" />
      </Helmet>

      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <Navbar />
        <main style={{ flex: 1 }}>

          {/* ── Hero ── */}
          <section style={{ borderBottom: '1px solid var(--border)', padding: 'var(--sp-10) 0 var(--sp-8)' }}>
            <div className="container" style={{ maxWidth: 880 }}>
              <div style={{
                display: 'inline-flex', alignItems: 'center', gap: 8,
                background: 'var(--bg-secondary)', border: '1px solid var(--border)',
                borderRadius: 'var(--r-full)', padding: '4px 14px',
                fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)',
                letterSpacing: '0.04em', textTransform: 'uppercase', marginBottom: 20,
              }}>
                🔒 Legal
              </div>
              <h1 style={{
                fontSize: 'clamp(24px, 4vw, 40px)', fontWeight: 800,
                letterSpacing: '-0.03em', color: 'var(--text)', marginBottom: 12,
              }}>
                Privacy Policy
              </h1>
              <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: 0 }}>
                Last updated: <strong style={{ color: 'var(--text)' }}>{LAST_UPDATED}</strong>
                {' '}·{' '}
                Applies to <strong style={{ color: 'var(--text)' }}>zapsoundboard.com</strong>
                {' '}·{' '}
                Questions? <EmailLink />
              </p>
            </div>
          </section>

          {/* ── Body ── */}
          <div className="container" style={{ maxWidth: 880, padding: 'var(--sp-10) var(--sp-6) var(--sp-16)' }}>
            <div style={{ display: 'flex', gap: 'var(--sp-10)', alignItems: 'flex-start' }}>

              {/* Sidebar TOC — hidden on small screens via maxWidth trick */}
              <nav style={{
                position: 'sticky', top: 'calc(var(--navbar-h) + 24px)',
                width: 200, flexShrink: 0,
                display: 'flex', flexDirection: 'column', gap: 2,
                // Hide below ~780px by collapsing — simple approach without media query
                minWidth: 200,
              }}
                className="privacy-toc"
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
                      textAlign: 'left',
                      border: 'none', padding: '6px 10px',
                      borderRadius: 'var(--r-md)', cursor: 'pointer',
                      fontSize: 13, fontFamily: 'var(--font)',
                      color: activeSection === s.id ? 'var(--text)' : 'var(--text-secondary)',
                      fontWeight: activeSection === s.id ? 600 : 400,
                      background: activeSection === s.id ? 'var(--bg-secondary)' : 'transparent',
                      transition: 'all var(--t)',
                    }}
                    onMouseEnter={e => { if (activeSection !== s.id) e.currentTarget.style.color = 'var(--text)' }}
                    onMouseLeave={e => { if (activeSection !== s.id) e.currentTarget.style.color = 'var(--text-secondary)' }}
                  >
                    {s.title}
                  </button>
                ))}
              </nav>

              {/* Main content */}
              <div style={{ flex: 1, minWidth: 0 }}>

                {/* Summary callout */}
                <div style={{
                  background: 'var(--accent-subtle)', border: '1px solid var(--accent-border)',
                  borderRadius: 'var(--r-xl)', padding: 'var(--sp-5) var(--sp-6)',
                  marginBottom: 'var(--sp-8)',
                }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--accent-dark)', marginBottom: 10 }}>
                    ⚡ Plain-English Summary
                  </div>
                  <ul style={{ ...listStyle, marginBottom: 0 }}>
                    <li style={{ ...liStyle, color: 'var(--text)' }}>We collect <strong>minimal data</strong> — only what's needed to run the Service.</li>
                    <li style={{ ...liStyle, color: 'var(--text)' }}>Sound plays are <strong>anonymous counters</strong> — we don't know who played what.</li>
                    <li style={{ ...liStyle, color: 'var(--text)' }}>Analytics are <strong>cookieless</strong> (Cloudflare Web Analytics — no fingerprinting).</li>
                    <li style={{ ...liStyle, color: 'var(--text)' }}>Personalised ads (Google AdSense) only activate with your <strong>explicit consent</strong>.</li>
                    <li style={{ ...liStyle, color: 'var(--text)' }}>You can request <strong>full deletion</strong> of your data at any time.</li>
                  </ul>
                </div>

                {/* Sections */}
                {SECTIONS.map(section => (
                  <section
                    key={section.id}
                    id={section.id}
                    style={{
                      marginBottom: 'var(--sp-10)',
                      scrollMarginTop: 'calc(var(--navbar-h) + 24px)',
                    }}
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
                  </section>
                ))}

                {/* Back to top */}
                <div style={{ borderTop: '1px solid var(--border)', paddingTop: 'var(--sp-6)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
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

      {/* Hide TOC on narrow viewports */}
      <style>{`
        @media (max-width: 680px) {
          .privacy-toc { display: none !important; }
        }
      `}</style>
    </>
  )
}
