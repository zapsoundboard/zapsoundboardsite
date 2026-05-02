import { useState } from 'react'
import { Helmet } from 'react-helmet-async'
import { Link } from 'react-router-dom'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'

const LAST_UPDATED    = 'April 30, 2026'
const PRIVACY_EMAIL   = 'privacy@zapsoundboard.com'

interface Section {
  id:      string
  title:   string
  content: React.ReactNode
}

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

function ExternalLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <a href={href} target="_blank" rel="noopener noreferrer"
      style={{ color: 'var(--accent-dark)', fontWeight: 600, textDecoration: 'none' }}>
      {children}
    </a>
  )
}

function Callout({ icon, variant, children }: { icon: string; variant: 'warning' | 'info' | 'error'; children: React.ReactNode }) {
  const styles: Record<typeof variant, { bg: string; border: string; color: string }> = {
    warning: { bg: 'var(--warning-bg)',    border: 'var(--warning)',       color: 'var(--warning)' },
    info:    { bg: 'var(--accent-subtle)', border: 'var(--accent-border)', color: 'var(--accent-dark)' },
    error:   { bg: 'var(--error-bg)',      border: 'var(--error)',         color: 'var(--error)' },
  }
  const s = styles[variant]
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
  margin: '0 0 12px 0', paddingLeft: 20,
  display: 'flex', flexDirection: 'column', gap: 8,
}
const liStyle: React.CSSProperties = {
  fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.75,
}

// ── Cookie table ─────────────────────────────────────────────────────────────

interface CookieRow {
  name:     string
  provider: string
  purpose:  string
  type:     string
  duration: string
}

const COOKIE_TABLE: CookieRow[] = [
  { name: 'sb-*',               provider: 'Supabase',        purpose: 'Authentication session token — keeps you logged in to your account',           type: 'Essential',   duration: 'Session / 1 year' },
  { name: 'theme',              provider: 'ZapSoundboard',   purpose: 'Stores your light/dark theme preference',                                       type: 'Functional',  duration: '1 year' },
  { name: 'volume',             provider: 'ZapSoundboard',   purpose: 'Remembers your last-used playback volume',                                       type: 'Functional',  duration: '1 year' },
  { name: 'cookie_consent',     provider: 'ZapSoundboard',   purpose: 'Records whether you have acknowledged the cookie banner',                        type: 'Essential',   duration: '1 year' },
  { name: '_ga',                provider: 'Google Analytics', purpose: 'Distinguishes unique users for aggregate analytics (G-E6X061VCPX)',             type: 'Analytics',   duration: '2 years' },
  { name: '_ga_*',              provider: 'Google Analytics', purpose: 'Stores and counts page-views for the GA4 property',                             type: 'Analytics',   duration: '2 years' },
  { name: '_gid',               provider: 'Google Analytics', purpose: 'Distinguishes users — expires after 24 hours',                                  type: 'Analytics',   duration: '24 hours' },
  { name: '_gat',               provider: 'Google Analytics', purpose: 'Throttles the request rate to Google Analytics',                                type: 'Analytics',   duration: '1 minute' },
  { name: '__gads / __gpi',     provider: 'Google AdSense',  purpose: 'Registers ad impressions, prevents duplicate ads (ca-pub-5238937416358061)',     type: 'Advertising', duration: '13 months' },
  { name: 'IDE',                provider: 'Google DoubleClick', purpose: 'Used by Google to register and report actions after seeing/clicking an ad',  type: 'Advertising', duration: '13 months' },
  { name: 'test_cookie',        provider: 'Google',          purpose: 'Checks if the browser supports cookies',                                         type: 'Essential',   duration: 'Session' },
  { name: '__cf_bm',            provider: 'Cloudflare',      purpose: 'Bot management — distinguishes humans from automated traffic',                   type: 'Essential',   duration: '30 minutes' },
  { name: 'cf_clearance',       provider: 'Cloudflare',      purpose: 'Stores proof of passing a Cloudflare challenge (DDoS protection)',               type: 'Essential',   duration: 'Session / varies' },
]

const TYPE_COLORS: Record<string, { bg: string; color: string }> = {
  Essential:   { bg: 'rgba(34,197,94,0.1)',   color: '#22c55e' },
  Functional:  { bg: 'rgba(99,102,241,0.1)',  color: '#818cf8' },
  Analytics:   { bg: 'rgba(245,197,24,0.1)',  color: '#f5c518' },
  Advertising: { bg: 'rgba(239,68,68,0.1)',   color: '#f87171' },
}

function CookieTable() {
  const thStyle: React.CSSProperties = {
    padding: '10px 14px', textAlign: 'left', fontSize: 11,
    fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0.06em',
    textTransform: 'uppercase', borderBottom: '1px solid var(--border)',
    whiteSpace: 'nowrap',
  }
  const tdStyle: React.CSSProperties = {
    padding: '10px 14px', fontSize: 13, color: 'var(--text-secondary)',
    lineHeight: 1.5, verticalAlign: 'top', borderBottom: '1px solid var(--border)',
  }

  return (
    <div style={{ overflowX: 'auto', marginBottom: 16, borderRadius: 'var(--r-lg)', border: '1px solid var(--border)' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 640 }}>
        <thead>
          <tr style={{ background: 'var(--bg-secondary)' }}>
            <th style={thStyle}>Cookie</th>
            <th style={thStyle}>Provider</th>
            <th style={thStyle}>Purpose</th>
            <th style={thStyle}>Type</th>
            <th style={thStyle}>Duration</th>
          </tr>
        </thead>
        <tbody>
          {COOKIE_TABLE.map((row, i) => {
            const badge = TYPE_COLORS[row.type] ?? { bg: 'var(--bg-secondary)', color: 'var(--text-secondary)' }
            return (
              <tr key={i} style={{ background: i % 2 === 0 ? 'var(--bg)' : 'var(--bg-secondary)' }}>
                <td style={{ ...tdStyle, fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--text)', whiteSpace: 'nowrap' }}>
                  {row.name}
                </td>
                <td style={{ ...tdStyle, whiteSpace: 'nowrap' }}>{row.provider}</td>
                <td style={tdStyle}>{row.purpose}</td>
                <td style={{ ...tdStyle, whiteSpace: 'nowrap' }}>
                  <span style={{
                    padding: '2px 8px', borderRadius: 20, fontSize: 11,
                    fontWeight: 600, background: badge.bg, color: badge.color,
                  }}>
                    {row.type}
                  </span>
                </td>
                <td style={{ ...tdStyle, whiteSpace: 'nowrap' }}>{row.duration}</td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

// ── Sections ─────────────────────────────────────────────────────────────────

const SECTIONS: Section[] = [
  {
    id: 'what-are-cookies',
    title: '1. What Are Cookies?',
    content: (
      <>
        <P>
          Cookies are small text files that a website stores on your device (computer, tablet, or
          smartphone) when you visit it. They are widely used to make websites work more efficiently,
          to remember your preferences, and to provide information to website owners.
        </P>
        <P>
          In addition to cookies, we may use similar technologies such as <strong>local storage</strong>,{' '}
          <strong>session storage</strong>, and <strong>pixel tags</strong> that function in a
          comparable way. References to "cookies" in this policy include these technologies unless
          stated otherwise.
        </P>
        <P>
          Cookies can be set by the website you are visiting (<strong>first-party cookies</strong>)
          or by third-party services that the website uses — such as analytics or advertising
          providers (<strong>third-party cookies</strong>). They can last only for the duration of
          your browser session (<strong>session cookies</strong>) or persist for a set period of
          time after you close the browser (<strong>persistent cookies</strong>).
        </P>
      </>
    ),
  },
  {
    id: 'cookies-we-use',
    title: '2. Cookies We Use',
    content: (
      <>
        <P>
          The table below lists every cookie or similar technology that ZapSoundboard — or the
          third-party services embedded in the platform — may place on your device.
        </P>
        <CookieTable />

        <SubHeading>2.1 Essential Cookies</SubHeading>
        <P>
          Essential cookies are strictly necessary for the website to function. Without them,
          services such as authentication, security, and load balancing would not work. These
          cookies cannot be disabled without significantly impacting your experience.
        </P>

        <SubHeading>2.2 Functional Cookies</SubHeading>
        <P>
          Functional cookies remember your preferences — such as your chosen colour theme (light/dark)
          and playback volume — so that you do not need to reconfigure them on each visit. Disabling
          them means these settings will reset every session.
        </P>

        <SubHeading>2.3 Analytics Cookies (Google Analytics)</SubHeading>
        <P>
          We use <strong>Google Analytics 4</strong> (property ID:{' '}
          <code style={{ fontSize: 12, background: 'var(--bg-secondary)', padding: '1px 6px', borderRadius: 4 }}>
            G-E6X061VCPX
          </code>
          ) to collect aggregated, anonymised data about how visitors interact with the platform —
          including pages visited, session duration, referral sources, and device type.
        </P>
        <P>
          This data helps us understand which features are used most and where we can improve the
          experience. Google Analytics data is processed by Google LLC and is subject to{' '}
          <ExternalLink href="https://policies.google.com/privacy">Google's Privacy Policy</ExternalLink>.
          You can opt out at any time using the{' '}
          <ExternalLink href="https://tools.google.com/dlpage/gaoptout">Google Analytics Opt-out Browser Add-on</ExternalLink>.
        </P>

        <SubHeading>2.4 Advertising Cookies (Google AdSense)</SubHeading>
        <P>
          ZapSoundboard displays advertisements served by <strong>Google AdSense</strong> (publisher
          ID:{' '}
          <code style={{ fontSize: 12, background: 'var(--bg-secondary)', padding: '1px 6px', borderRadius: 4 }}>
            ca-pub-5238937416358061
          </code>
          ). AdSense uses cookies to serve ads that are relevant to your interests based on your
          browsing history across sites that use Google's services.
        </P>
        <P>
          You can review and control personalised advertising at{' '}
          <ExternalLink href="https://adssettings.google.com">adssettings.google.com</ExternalLink>{' '}
          or opt out of interest-based advertising via{' '}
          <ExternalLink href="https://optout.aboutads.info/">aboutads.info</ExternalLink>.
        </P>

        <SubHeading>2.5 Third-Party Service Cookies</SubHeading>
        <P>
          Our infrastructure providers may also set cookies as a necessary part of delivering
          the service securely:
        </P>
        <ul style={listStyle}>
          <li style={liStyle}><strong>Cloudflare</strong> — sets short-lived cookies (<code style={{ fontSize: 12 }}>__cf_bm</code>, <code style={{ fontSize: 12 }}>cf_clearance</code>) for bot detection and DDoS protection. These are essential for platform security.</li>
          <li style={liStyle}><strong>Supabase</strong> — sets session cookies (<code style={{ fontSize: 12 }}>sb-*</code>) for authenticated users. If you do not have an account or are not logged in, these cookies are not set.</li>
        </ul>
      </>
    ),
  },
  {
    id: 'control-cookies',
    title: '3. How to Control Cookies',
    content: (
      <>
        <P>
          You have the right to decide whether to accept or decline cookies. You can exercise your
          cookie preferences through the following methods:
        </P>

        <SubHeading>3.1 Browser Settings</SubHeading>
        <P>
          Most browsers allow you to view, manage, block, and delete cookies through their settings.
          Note that blocking all cookies may affect website functionality. Find instructions for
          your browser below:
        </P>
        <ul style={listStyle}>
          <li style={liStyle}>
            <strong>Google Chrome</strong> — Settings → Privacy and security → Cookies and other site data.{' '}
            <ExternalLink href="https://support.google.com/chrome/answer/95647">Manage cookies in Chrome →</ExternalLink>
          </li>
          <li style={liStyle}>
            <strong>Mozilla Firefox</strong> — Settings → Privacy & Security → Cookies and Site Data.{' '}
            <ExternalLink href="https://support.mozilla.org/en-US/kb/enhanced-tracking-protection-firefox-desktop">Manage cookies in Firefox →</ExternalLink>
          </li>
          <li style={liStyle}>
            <strong>Apple Safari</strong> — Preferences → Privacy → Manage Website Data.{' '}
            <ExternalLink href="https://support.apple.com/guide/safari/manage-cookies-sfri11471/mac">Manage cookies in Safari →</ExternalLink>
          </li>
          <li style={liStyle}>
            <strong>Microsoft Edge</strong> — Settings → Cookies and site permissions → Cookies and site data.{' '}
            <ExternalLink href="https://support.microsoft.com/en-us/microsoft-edge/delete-cookies-in-microsoft-edge-63947406-40ac-c3b8-57b9-2a946a29ae09">Manage cookies in Edge →</ExternalLink>
          </li>
          <li style={liStyle}>
            <strong>Opera</strong> — Settings → Advanced → Privacy & security → Content settings → Cookies.
          </li>
        </ul>

        <SubHeading>3.2 Opt-Out Tools</SubHeading>
        <P>
          For more granular control over advertising and analytics cookies, the following opt-out
          tools are available:
        </P>
        <ul style={listStyle}>
          <li style={liStyle}><ExternalLink href="https://tools.google.com/dlpage/gaoptout">Google Analytics Opt-out Add-on</ExternalLink> — prevents your data from being sent to Google Analytics across all sites.</li>
          <li style={liStyle}><ExternalLink href="https://adssettings.google.com">Google Ad Settings</ExternalLink> — control personalised advertising from Google.</li>
          <li style={liStyle}><ExternalLink href="https://optout.aboutads.info/">Digital Advertising Alliance (DAA) Opt-out</ExternalLink> — opt out of interest-based advertising from DAA member companies.</li>
          <li style={liStyle}><ExternalLink href="https://www.youronlinechoices.eu/">Your Online Choices (EU)</ExternalLink> — manage advertising preferences for European users.</li>
          <li style={liStyle}><ExternalLink href="https://optout.networkadvertising.org/">Network Advertising Initiative (NAI) Opt-out</ExternalLink> — opt out from NAI member ad networks.</li>
        </ul>

        <Callout icon="⚠️" variant="warning">
          Disabling essential or functional cookies may break certain features of ZapSoundboard,
          such as staying logged in or remembering your theme preference.
        </Callout>
      </>
    ),
  },
  {
    id: 'cookie-consent',
    title: '4. Cookie Consent',
    content: (
      <>
        <P>
          When you first visit ZapSoundboard, a cookie notice informs you that we use cookies.
          By continuing to browse the site, you consent to our use of cookies in accordance with
          this Cookie Policy.
        </P>
        <P>
          <strong>Essential cookies</strong> do not require your consent as they are strictly
          necessary for the operation of the website. For <strong>analytics</strong> and{' '}
          <strong>advertising cookies</strong>, we rely on your implied consent through continued
          use of the platform, and you may withdraw consent at any time using the opt-out methods
          described in Section 3.
        </P>
        <Callout icon="ℹ️" variant="info">
          You can withdraw your consent at any time by clearing your cookies and adjusting your
          browser settings. This will not affect the lawfulness of any processing carried out before
          your withdrawal.
        </Callout>
      </>
    ),
  },
  {
    id: 'gdpr-rights',
    title: '5. GDPR & Your Rights',
    content: (
      <>
        <P>
          If you are located in the <strong>European Economic Area (EEA)</strong>, the United
          Kingdom, or another jurisdiction with equivalent data protection legislation, you have
          the following rights regarding cookie-related personal data:
        </P>
        <ul style={listStyle}>
          <li style={liStyle}><strong>Right of access (Art. 15 GDPR)</strong> — Request a copy of the personal data we process about you via cookies.</li>
          <li style={liStyle}><strong>Right to erasure (Art. 17 GDPR)</strong> — Request deletion of your personal data. Clearing cookies in your browser removes locally stored data immediately.</li>
          <li style={liStyle}><strong>Right to restrict processing (Art. 18 GDPR)</strong> — Ask us to limit how we use your data.</li>
          <li style={liStyle}><strong>Right to object (Art. 21 GDPR)</strong> — Object to processing of your data for analytics or advertising purposes at any time.</li>
          <li style={liStyle}><strong>Right to withdraw consent</strong> — You may withdraw consent to non-essential cookies at any time without penalty.</li>
          <li style={liStyle}><strong>Right to lodge a complaint</strong> — You have the right to complain to your local supervisory authority. Find your authority at{' '}
            <ExternalLink href="https://edpb.europa.eu/about-edpb/about-edpb/members_en">edpb.europa.eu</ExternalLink>.
          </li>
        </ul>
        <P>
          To exercise any of these rights, contact us at <EmailLink email={PRIVACY_EMAIL} />. We
          will respond within <strong>30 days</strong> of receiving your verified request.
        </P>
        <P>
          For full details of how we handle personal data, including the legal bases for processing,
          please read our{' '}
          <Link to="/privacy" style={{ color: 'var(--accent-dark)', fontWeight: 600, textDecoration: 'none' }}>
            Privacy Policy
          </Link>.
        </P>
      </>
    ),
  },
  {
    id: 'policy-updates',
    title: '6. Updates to This Policy',
    content: (
      <>
        <P>
          We may update this Cookie Policy from time to time to reflect changes in the cookies we
          use, applicable law, or the way our services operate. The "last updated" date at the top
          of this page indicates when the policy was last revised.
        </P>
        <P>
          We encourage you to review this page periodically. For significant changes, we will
          post a notice on the website. Continued use of ZapSoundboard after any revision
          constitutes your acceptance of the updated Cookie Policy.
        </P>
      </>
    ),
  },
  {
    id: 'contact',
    title: '7. Contact',
    content: (
      <>
        <P>
          If you have any questions about this Cookie Policy or how we handle your data, please
          contact us:
        </P>
        <div style={{
          background: 'var(--bg-secondary)', border: '1px solid var(--border)',
          borderRadius: 'var(--r-lg)', padding: 'var(--sp-5)',
          fontSize: 14, color: 'var(--text)', lineHeight: 1.9, marginBottom: 16,
        }}>
          <strong>ZapSoundboard — Privacy</strong><br />
          Privacy & cookies: <EmailLink email={PRIVACY_EMAIL} /><br />
          Response time: within 30 days
        </div>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <Link to="/privacy" style={{ fontSize: 13, color: 'var(--text-secondary)', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 6 }}>
            🔒 Privacy Policy →
          </Link>
          <Link to="/terms" style={{ fontSize: 13, color: 'var(--text-secondary)', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 6 }}>
            📋 Terms of Service →
          </Link>
          <Link to="/disclaimer" style={{ fontSize: 13, color: 'var(--text-secondary)', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 6 }}>
            ⚖️ Disclaimer →
          </Link>
        </div>
      </>
    ),
  },
]

// ── Page ─────────────────────────────────────────────────────────────────────

export default function CookiePolicyPage() {
  const [activeSection, setActiveSection] = useState<string | null>(null)

  function scrollTo(id: string) {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <>
      <Helmet>
        <title>Cookie Policy — ZapSoundboard</title>
        <meta
          name="description"
          content="ZapSoundboard Cookie Policy — what cookies we use, Google Analytics, Google AdSense, Cloudflare, how to control or delete cookies, and your GDPR rights."
        />
        <meta property="og:title"       content="Cookie Policy — ZapSoundboard" />
        <meta property="og:description" content="Full cookie policy for ZapSoundboard covering analytics, advertising, essential, and third-party cookies." />
        <meta property="og:type"        content="website" />
        <link rel="canonical"           href="https://zapsoundboard.com/cookie-policy" />
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
                🍪 Legal
              </div>
              <h1 style={{
                fontSize: 'clamp(24px, 4vw, 40px)', fontWeight: 800,
                letterSpacing: '-0.03em', color: 'var(--text)', marginBottom: 12,
              }}>
                Cookie Policy
              </h1>
              <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: 0 }}>
                Last updated: <strong style={{ color: 'var(--text)' }}>{LAST_UPDATED}</strong>
                {' '}·{' '}
                Applies to <strong style={{ color: 'var(--text)' }}>zapsoundboard.com</strong>
                {' '}·{' '}
                Questions? <EmailLink email={PRIVACY_EMAIL} />
              </p>
            </div>
          </section>

          {/* ── Body ── */}
          <div className="container" style={{ maxWidth: 920, padding: 'var(--sp-10) var(--sp-6) var(--sp-16)' }}>
            <div style={{ display: 'flex', gap: 'var(--sp-10)', alignItems: 'flex-start' }}>

              {/* Sidebar TOC */}
              <nav
                className="cookie-toc"
                style={{
                  position: 'sticky', top: 'calc(var(--navbar-h) + 24px)',
                  width: 210, flexShrink: 0,
                  display: 'flex', flexDirection: 'column', gap: 2,
                }}
              >
                <div style={{
                  fontSize: 11, fontWeight: 700, color: 'var(--text-muted)',
                  letterSpacing: '0.08em', textTransform: 'uppercase',
                  marginBottom: 10, paddingLeft: 10,
                }}>
                  Contents
                </div>
                {SECTIONS.map(s => (
                  <button
                    key={s.id}
                    onClick={() => { scrollTo(s.id); setActiveSection(s.id) }}
                    style={{
                      textAlign: 'left', background: activeSection === s.id ? 'var(--bg-secondary)' : 'none',
                      border: activeSection === s.id ? '1px solid var(--border)' : '1px solid transparent',
                      borderRadius: 'var(--r-md)', padding: '6px 10px',
                      fontSize: 12,
                      color: activeSection === s.id ? 'var(--text)' : 'var(--text-secondary)',
                      fontWeight: activeSection === s.id ? 600 : 400,
                      cursor: 'pointer', lineHeight: 1.45, fontFamily: 'var(--font)',
                      transition: 'color 150ms, background 150ms',
                    } as React.CSSProperties}
                  >
                    {s.title}
                  </button>
                ))}

                {/* Cookie type legend */}
                <div style={{ marginTop: 20, paddingLeft: 10 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 8 }}>
                    Cookie Types
                  </div>
                  {Object.entries(TYPE_COLORS).map(([type, c]) => (
                    <div key={type} style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 5 }}>
                      <span style={{ width: 8, height: 8, borderRadius: '50%', background: c.color, flexShrink: 0 }} />
                      <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{type}</span>
                    </div>
                  ))}
                </div>
              </nav>

              {/* Main content */}
              <div style={{ flex: 1, minWidth: 0 }}>
                {SECTIONS.map((s, i) => (
                  <section
                    key={s.id}
                    id={s.id}
                    style={{
                      paddingBottom: 'var(--sp-8)',
                      marginBottom: 'var(--sp-8)',
                      borderBottom: i < SECTIONS.length - 1 ? '1px solid var(--border)' : 'none',
                    }}
                  >
                    <h2 style={{
                      fontSize: 'clamp(15px, 2vw, 18px)', fontWeight: 800,
                      color: 'var(--text)', letterSpacing: '-0.02em',
                      marginBottom: 'var(--sp-4)', marginTop: 0,
                    }}>
                      {s.title}
                    </h2>
                    {s.content}
                  </section>
                ))}
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </div>

      <style>{`
        @media (max-width: 720px) {
          .cookie-toc { display: none !important; }
        }
      `}</style>
    </>
  )
}