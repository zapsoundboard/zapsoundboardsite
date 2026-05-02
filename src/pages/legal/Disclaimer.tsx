import { useState } from 'react'
import { Helmet } from 'react-helmet-async'
import { Link } from 'react-router-dom'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'

const LAST_UPDATED  = 'April 30, 2026'
const CONTACT_EMAIL = 'legal@zapsoundboard.com'
const DMCA_EMAIL    = 'dmca@zapsoundboard.com'

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

const SECTIONS: Section[] = [
  {
    id: 'general-information',
    title: '1. General Information Only',
    content: (
      <>
        <P>
          ZapSoundboard (<strong>zapsoundboard.com</strong>) is an online soundboard platform provided
          for entertainment and personal use. The information, audio content, and materials available
          on this website are provided for <strong>general informational and entertainment purposes only</strong>.
        </P>
        <P>
          Nothing on this website constitutes professional advice of any kind — legal, financial,
          medical, or otherwise. You should not rely on any content on this platform as a substitute
          for professional advice specific to your situation.
        </P>
        <Callout icon="ℹ️" variant="info">
          By accessing or using ZapSoundboard, you acknowledge that you have read and understood
          this Disclaimer and agree to be bound by its terms.
        </Callout>
        <P>
          This Disclaimer applies to the website at <strong>zapsoundboard.com</strong>, all associated
          subdomains, mobile versions, and any future versions of the Service.
        </P>
      </>
    ),
  },
  {
    id: 'no-warranties',
    title: '2. No Warranties',
    content: (
      <>
        <Callout icon="⚠️" variant="warning">
          The Service is provided on an "AS IS" and "AS AVAILABLE" basis, without any warranties of
          any kind — express, implied, or statutory.
        </Callout>
        <P>
          To the fullest extent permitted by applicable law, ZapSoundboard expressly disclaims all
          warranties, including but not limited to:
        </P>
        <ul style={listStyle}>
          <li style={liStyle}><strong>Implied warranties of merchantability</strong> — we make no warranty that the Service meets your requirements or expectations.</li>
          <li style={liStyle}><strong>Fitness for a particular purpose</strong> — the Service may not be suitable for every use case you intend.</li>
          <li style={liStyle}><strong>Non-infringement</strong> — while we take reasonable steps to ensure compliance, we cannot guarantee that all content is free from third-party IP claims.</li>
          <li style={liStyle}><strong>Uninterrupted or error-free operation</strong> — the Service may be temporarily unavailable due to maintenance, technical issues, or factors outside our control.</li>
          <li style={liStyle}><strong>Security</strong> — while we implement reasonable security measures, we cannot guarantee that the Service is free from vulnerabilities or unauthorised access.</li>
        </ul>
        <P>
          No advice or information, whether oral or written, obtained by you from ZapSoundboard or
          through the Service shall create any warranty not expressly stated in this Disclaimer or
          our Terms of Service.
        </P>
      </>
    ),
  },
  {
    id: 'copyright',
    title: '3. Copyright Disclaimer',
    content: (
      <>
        <SubHeading>3.1 Copyright Ownership</SubHeading>
        <P>
          ZapSoundboard respects the intellectual property rights of all creators. Sound clips hosted
          on this platform may be subject to copyright owned by their respective creators, studios,
          broadcasters, or other rights holders.
        </P>

        <SubHeading>3.2 Basis for Hosting Sound Content</SubHeading>
        <P>
          Audio content on ZapSoundboard is hosted under one or more of the following bases:
        </P>
        <ul style={listStyle}>
          <li style={liStyle}><strong>Fair use / fair dealing</strong> — short clips used for commentary, criticism, education, parody, or transformative purposes under applicable copyright law (17 U.S.C. § 107 in the USA; equivalent provisions elsewhere).</li>
          <li style={liStyle}><strong>Creative Commons licence</strong> — content released by its creator under a Creative Commons or other open licence permitting redistribution.</li>
          <li style={liStyle}><strong>Original creation</strong> — sounds created and submitted by users who own full rights to the content.</li>
          <li style={liStyle}><strong>Explicit permission</strong> — content for which ZapSoundboard has obtained written authorisation from the rights holder.</li>
          <li style={liStyle}><strong>Public domain</strong> — content whose copyright has expired or which was dedicated to the public domain by its creator.</li>
        </ul>

        <SubHeading>3.3 DMCA Takedown</SubHeading>
        <P>
          If you believe that any content on ZapSoundboard infringes your copyright, you have the
          right to submit a <strong>DMCA takedown notice</strong>. We take all such notices seriously
          and will promptly investigate and remove infringing content where appropriate.
        </P>
        <div style={{
          background: 'var(--bg-secondary)', border: '1px solid var(--border)',
          borderRadius: 'var(--r-lg)', padding: 'var(--sp-5)',
          fontSize: 14, lineHeight: 1.9, marginBottom: 16,
        }}>
          <strong style={{ color: 'var(--text)' }}>Submit a DMCA notice:</strong>{' '}
          <EmailLink email={DMCA_EMAIL} /><br />
          <span style={{ color: 'var(--text-secondary)' }}>
            Target removal time: <strong style={{ color: 'var(--text)' }}>24 hours</strong> of verified receipt.
          </span>
        </div>
        <P>
          Please see our full{' '}
          <Link to="/dmca" style={{ color: 'var(--accent-dark)', fontWeight: 600, textDecoration: 'none' }}>
            DMCA Policy
          </Link>{' '}
          for required notice elements, counter-notice procedures, and repeat-infringer policy.
        </P>

        <SubHeading>3.4 Trademarks</SubHeading>
        <P>
          Any trademarks, brand names, or product names mentioned on this platform are the property
          of their respective owners. Their appearance on ZapSoundboard does not imply any affiliation,
          endorsement, or sponsorship by those owners.
        </P>
      </>
    ),
  },
  {
    id: 'limitation-of-liability',
    title: '4. Limitation of Liability',
    content: (
      <>
        <Callout icon="⚠️" variant="warning">
          To the maximum extent permitted by law, ZapSoundboard's total liability to you for any
          claim arising out of or relating to this Service shall not exceed €100 (EUR) or the amount
          you paid us in the 12 months preceding the claim, whichever is greater.
        </Callout>
        <P>
          In no event shall ZapSoundboard, its owners, employees, or agents be liable for any:
        </P>
        <ul style={listStyle}>
          <li style={liStyle}><strong>Indirect, incidental, or consequential damages</strong> arising from your use of or inability to use the Service.</li>
          <li style={liStyle}><strong>Loss of data</strong>, including any audio files, uploaded content, or account information.</li>
          <li style={liStyle}><strong>Loss of profits or revenue</strong> — even if we were advised of the possibility of such damages.</li>
          <li style={liStyle}><strong>Damage to devices or software</strong> resulting from accessing the Service or downloading audio files.</li>
          <li style={liStyle}><strong>Third-party actions</strong> — including copyright claims, defamatory content submitted by other users, or conduct of third-party services linked from the platform.</li>
          <li style={liStyle}><strong>Service interruptions</strong> — downtime, maintenance windows, or force-majeure events beyond our reasonable control.</li>
        </ul>
        <P>
          Some jurisdictions do not allow the exclusion or limitation of certain warranties or
          liability, so some of the above limitations may not apply to you. In such cases, our
          liability is limited to the greatest extent permitted by applicable law.
        </P>
      </>
    ),
  },
  {
    id: 'external-links',
    title: '5. External Links Disclaimer',
    content: (
      <>
        <P>
          ZapSoundboard may contain links to third-party websites, services, or resources that are
          not owned or controlled by us — including but not limited to social media platforms,
          content delivery networks, analytics providers, and our sister platform FlashTTS.
        </P>
        <P>
          We have <strong>no control over</strong> the content, privacy policies, or practices of
          any third-party websites and accept no responsibility for them. Our inclusion of any link
          does not imply endorsement, affiliation, or recommendation of the linked site or its
          operators.
        </P>
        <P>
          We strongly advise you to review the Privacy Policy and Terms of Service of every
          third-party website you visit. External links are followed at your own risk.
        </P>
        <Callout icon="ℹ️" variant="info">
          Advertising served on ZapSoundboard (including via Google AdSense) is managed by
          third-party ad networks. ZapSoundboard is not responsible for the content of any
          advertisements displayed on the platform.
        </Callout>
      </>
    ),
  },
  {
    id: 'user-content',
    title: '6. User Content Disclaimer',
    content: (
      <>
        <SubHeading>6.1 Community Uploads</SubHeading>
        <P>
          ZapSoundboard allows registered users to submit sound clips for inclusion in the platform's
          library. All submitted content is subject to an <strong>administrative review process</strong>{' '}
          before it is made publicly available.
        </P>

        <SubHeading>6.2 No Guarantee of Accuracy or Appropriateness</SubHeading>
        <P>
          Despite our review process, ZapSoundboard does <strong>not guarantee</strong> that
          community-uploaded content:
        </P>
        <ul style={listStyle}>
          <li style={liStyle}>Is free from copyright infringement or other IP violations.</li>
          <li style={liStyle}>Is accurate, complete, or up-to-date.</li>
          <li style={liStyle}>Is appropriate for all audiences or age groups.</li>
          <li style={liStyle}>Does not contain harmful, offensive, or misleading material that evaded review.</li>
        </ul>

        <SubHeading>6.3 User Responsibility</SubHeading>
        <P>
          Users who upload content to ZapSoundboard are solely responsible for ensuring they hold
          all necessary rights to the submitted material. By uploading content, you represent and
          warrant that you have the legal right to do so. See our{' '}
          <Link to="/terms" style={{ color: 'var(--accent-dark)', fontWeight: 600, textDecoration: 'none' }}>
            Terms of Service
          </Link>{' '}
          for the full licence grant and content policy.
        </P>

        <SubHeading>6.4 Reporting Concerns</SubHeading>
        <P>
          If you encounter content you believe violates copyright, community standards, or applicable
          law, please report it to <EmailLink email={DMCA_EMAIL} />. We aim to investigate all
          reports within <strong>48 hours</strong> and take appropriate action.
        </P>
      </>
    ),
  },
  {
    id: 'accuracy',
    title: '7. Accuracy Disclaimer',
    content: (
      <>
        <P>
          While we make reasonable efforts to ensure that all information published on ZapSoundboard
          is accurate and current at the time of publication, we make <strong>no representations or
          warranties</strong> as to the accuracy, completeness, reliability, or timeliness of any
          content on the platform.
        </P>
        <P>
          Sound metadata — including titles, categories, tags, play counts, and attribution
          information — is provided in good faith but may contain errors or become outdated. We
          reserve the right to correct or update any information at any time without prior notice.
        </P>
        <P>
          Any reliance you place on such information is strictly at your own risk. ZapSoundboard
          shall not be liable for any errors, omissions, or inaccuracies in the content, nor for
          any actions taken in reliance on such content.
        </P>
      </>
    ),
  },
  {
    id: 'changes',
    title: '8. Changes to the Service',
    content: (
      <>
        <P>
          ZapSoundboard reserves the right to modify, suspend, or permanently discontinue any part
          of the Service — including individual sounds, features, categories, or the platform as a
          whole — at any time and without prior notice or liability.
        </P>
        <ul style={listStyle}>
          <li style={liStyle}><strong>Sound library</strong> — sounds may be added, removed, or reclassified at any time, including in response to DMCA notices, licensing changes, or quality reviews.</li>
          <li style={liStyle}><strong>Features</strong> — functionality such as upload, download, requests, and search may be altered or removed.</li>
          <li style={liStyle}><strong>URLs and slugs</strong> — while we endeavour to maintain stable URLs, we cannot guarantee that sound permalinks will remain unchanged indefinitely.</li>
          <li style={liStyle}><strong>Platform availability</strong> — the Service may be taken offline temporarily or permanently without advance notice.</li>
        </ul>
        <P>
          We are not liable to you or any third party for any modification, suspension, or
          discontinuation of the Service.
        </P>
      </>
    ),
  },
  {
    id: 'disclaimer-updates',
    title: '9. Updates to This Disclaimer',
    content: (
      <>
        <P>
          We may update this Disclaimer from time to time to reflect changes in our practices,
          applicable law, or the nature of the Service. The date at the top of this page indicates
          when this Disclaimer was last revised.
        </P>
        <P>
          We encourage you to review this page periodically. Continued use of the Service after
          any revision constitutes your acceptance of the updated Disclaimer. For material changes,
          we will post a notice on the website.
        </P>
      </>
    ),
  },
  {
    id: 'contact',
    title: '10. Contact',
    content: (
      <>
        <P>
          If you have any questions about this Disclaimer, or wish to report a concern regarding
          content on the platform, please contact us:
        </P>
        <div style={{
          background: 'var(--bg-secondary)', border: '1px solid var(--border)',
          borderRadius: 'var(--r-lg)', padding: 'var(--sp-5)',
          fontSize: 14, color: 'var(--text)', lineHeight: 1.9, marginBottom: 16,
        }}>
          <strong>ZapSoundboard — Legal</strong><br />
          General enquiries: <EmailLink email={CONTACT_EMAIL} /><br />
          Copyright / DMCA: <EmailLink email={DMCA_EMAIL} /><br />
          Privacy: <EmailLink email="privacy@zapsoundboard.com" /><br />
          Response time: within 30 days for legal requests
        </div>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <Link to="/dmca" style={{ fontSize: 13, color: 'var(--text-secondary)', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 6 }}>
            ⚖️ DMCA Policy →
          </Link>
          <Link to="/privacy" style={{ fontSize: 13, color: 'var(--text-secondary)', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 6 }}>
            🔒 Privacy Policy →
          </Link>
          <Link to="/terms" style={{ fontSize: 13, color: 'var(--text-secondary)', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 6 }}>
            📋 Terms of Service →
          </Link>
        </div>
      </>
    ),
  },
]

export default function DisclaimerPage() {
  const [activeSection, setActiveSection] = useState<string | null>(null)

  function scrollTo(id: string) {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <>
      <Helmet>
        <title>Disclaimer — ZapSoundboard</title>
        <meta
          name="description"
          content="ZapSoundboard Disclaimer — no warranties, copyright fair use policy, limitation of liability, external links, and user content disclaimer."
        />
        <meta property="og:title"       content="Disclaimer — ZapSoundboard" />
        <meta property="og:description" content="ZapSoundboard's full legal disclaimer covering warranties, copyright, liability, and user content." />
        <meta property="og:type"        content="website" />
        <link rel="canonical"           href="https://zapsoundboard.com/disclaimer" />
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
                Disclaimer
              </h1>
              <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: 0 }}>
                Last updated: <strong style={{ color: 'var(--text)' }}>{LAST_UPDATED}</strong>
                {' '}·{' '}
                Applies to <strong style={{ color: 'var(--text)' }}>zapsoundboard.com</strong>
                {' '}·{' '}
                Questions? <EmailLink email={CONTACT_EMAIL} />
              </p>
            </div>
          </section>

          {/* ── Body ── */}
          <div className="container" style={{ maxWidth: 920, padding: 'var(--sp-10) var(--sp-6) var(--sp-16)' }}>
            <div style={{ display: 'flex', gap: 'var(--sp-10)', alignItems: 'flex-start' }}>

              {/* Sidebar TOC */}
              <nav
                className="disclaimer-toc"
                style={{
                  position: 'sticky', top: 'calc(var(--navbar-h) + 24px)',
                  width: 210, flexShrink: 0,
                  display: 'flex', flexDirection: 'column', gap: 2,
                }}
              >
                <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 10, paddingLeft: 10 }}>
                  Contents
                </div>
                {SECTIONS.map(s => (
                  <button
                    key={s.id}
                    onClick={() => { scrollTo(s.id); setActiveSection(s.id) }}
                    style={{
                      textAlign: 'left', background: 'none',
                      border: activeSection === s.id ? '1px solid var(--border)' : '1px solid transparent',
                      borderRadius: 'var(--r-md)', padding: '6px 10px',
                      fontSize: 12, color: activeSection === s.id ? 'var(--text)' : 'var(--text-secondary)',
                      fontWeight: activeSection === s.id ? 600 : 400,
                      cursor: 'pointer', lineHeight: 1.45, fontFamily: 'var(--font)',
                      background: activeSection === s.id ? 'var(--bg-secondary)' : 'none' as string,
                      transition: 'color 150ms, background 150ms',
                    } as React.CSSProperties}
                  >
                    {s.title}
                  </button>
                ))}
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
          .disclaimer-toc { display: none !important; }
        }
      `}</style>
    </>
  )
}
