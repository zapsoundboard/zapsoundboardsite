import { useState } from 'react'
import { Helmet } from 'react-helmet-async'
import { Link } from 'react-router-dom'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'

const LAST_UPDATED  = 'April 26, 2026'
const CONTACT_EMAIL = 'legal@zapsoundboard.com'
const DMCA_EMAIL    = 'dmca@zapsoundboard.com'

interface Section {
  id:      string
  title:   string
  content: React.ReactNode
}

// ── Micro-components ────────────────────────────────────────────────────────

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
    warning: { bg: 'var(--warning-bg)',    border: 'var(--warning)',  color: 'var(--warning)' },
    info:    { bg: 'var(--accent-subtle)', border: 'var(--accent-border)', color: 'var(--accent-dark)' },
    error:   { bg: 'var(--error-bg)',      border: 'var(--error)',    color: 'var(--error)' },
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
const olStyle: React.CSSProperties = {
  ...listStyle, listStyleType: 'decimal',
}

// ── Section definitions ──────────────────────────────────────────────────────

const SECTIONS: Section[] = [
  {
    id: 'acceptance',
    title: '1. Acceptance of Terms',
    content: (
      <>
        <P>
          These Terms of Service ("Terms") constitute a legally binding agreement between you ("User",
          "you") and ZapSoundboard ("we", "us", "our") governing your access to and use of the website
          at <strong>zapsoundboard.com</strong> and all related services (collectively, the "Service").
        </P>
        <P>
          By accessing or using the Service in any way — including browsing, playing sounds, uploading
          content, or submitting requests — you confirm that you have read, understood, and agree to be
          bound by these Terms and our{' '}
          <Link to="/privacy" style={{ color: 'var(--accent-dark)', fontWeight: 600, textDecoration: 'none' }}>
            Privacy Policy
          </Link>
          , which is incorporated herein by reference.
        </P>
        <Callout icon="⚠️" variant="warning">
          If you do not agree to these Terms, you must immediately stop using the Service.
          Continued use after any revision of these Terms constitutes acceptance of the updated version.
        </Callout>
        <P>
          You must be at least <strong>13 years old</strong> (or the minimum digital age of consent in
          your jurisdiction) to use the Service. By using the Service you represent that you meet this
          age requirement.
        </P>
      </>
    ),
  },
  {
    id: 'service-description',
    title: '2. Description of the Service',
    content: (
      <>
        <P>
          ZapSoundboard is a <strong>free online soundboard platform</strong> that allows users to
          discover, play, download, and upload short audio clips ("Sounds") across categories including
          meme, Discord, gaming, reaction, brainrot, culture, music, viral, and WhatsApp sounds.
        </P>
        <SubHeading>2.1 Free Access</SubHeading>
        <P>
          The Service is provided free of charge. No payment, subscription, or account creation is
          required to browse, search, or play Sounds. Account creation is optional and unlocks
          additional features such as uploading Sounds and submitting requests.
        </P>
        <SubHeading>2.2 No Guaranteed Availability</SubHeading>
        <P>
          We strive to maintain high availability but do not guarantee that the Service will be
          uninterrupted, error-free, or available at any particular time. We reserve the right to
          modify, suspend, or discontinue any part of the Service at any time without notice or
          liability to you.
        </P>
        <SubHeading>2.3 Service Changes</SubHeading>
        <P>
          We may add, remove, or modify features at our sole discretion. Any new features released
          are subject to these Terms unless explicitly stated otherwise.
        </P>
      </>
    ),
  },
  {
    id: 'user-accounts',
    title: '3. User Accounts',
    content: (
      <>
        <P>
          When you create an account, you agree to:
        </P>
        <ul style={listStyle}>
          <li style={liStyle}>Provide accurate, current, and complete registration information.</li>
          <li style={liStyle}>Maintain the security of your account credentials and not share them with others.</li>
          <li style={liStyle}>Notify us immediately at <EmailLink email={CONTACT_EMAIL} /> if you suspect unauthorised access to your account.</li>
          <li style={liStyle}>Accept responsibility for all activity that occurs under your account.</li>
        </ul>
        <P>
          We reserve the right to suspend or terminate accounts that violate these Terms, remain
          inactive for more than 24 months, or are used in a manner that harms the Service or
          other users.
        </P>
      </>
    ),
  },
  {
    id: 'user-uploads',
    title: '4. User Uploads & Content',
    content: (
      <>
        <Callout icon="ℹ️" variant="info">
          All uploaded Sounds are reviewed and must be approved by an administrator before
          appearing publicly on the platform.
        </Callout>

        <SubHeading>4.1 Ownership & Licensing</SubHeading>
        <P>
          By uploading a Sound to ZapSoundboard, you represent and warrant that:
        </P>
        <ul style={listStyle}>
          <li style={liStyle}>You are the original creator of the Sound, <strong>or</strong> you hold all necessary rights, licences, consents, and permissions to upload, share, and grant the licences described below.</li>
          <li style={liStyle}>The Sound does not infringe any copyright, trademark, trade secret, right of publicity, privacy right, or any other intellectual property or legal right of any third party.</li>
          <li style={liStyle}>You have obtained any and all required consents from individuals whose voice or likeness is captured in the Sound.</li>
          <li style={liStyle}>The Sound does not violate any applicable law or regulation.</li>
        </ul>

        <SubHeading>4.2 Licence Grant</SubHeading>
        <P>
          By uploading a Sound, you grant ZapSoundboard a <strong>worldwide, royalty-free,
          non-exclusive, sublicensable licence</strong> to host, store, reproduce, distribute,
          publicly perform, publicly display, and make the Sound available to users of the Service
          for the duration of its presence on the platform.
        </P>
        <P>
          This licence does not transfer ownership. You retain all ownership rights in your original
          content subject to the rights granted above.
        </P>

        <SubHeading>4.3 Admin Approval</SubHeading>
        <P>
          All uploads are subject to manual review by our moderation team. We reserve the right to
          reject or remove any Sound at our sole discretion, including Sounds that:
        </P>
        <ul style={listStyle}>
          <li style={liStyle}>Appear to infringe third-party intellectual property rights.</li>
          <li style={liStyle}>Contain prohibited content as described in <strong>Section 5</strong>.</li>
          <li style={liStyle}>Are of poor audio quality or are not relevant to our content categories.</li>
          <li style={liStyle}>Duplicate an existing Sound already in the library.</li>
        </ul>
        <P>
          Submission does not guarantee publication. We do not provide reasons for rejection and
          have no obligation to review submissions within any specified timeframe.
        </P>

        <SubHeading>4.4 Removal of Your Uploads</SubHeading>
        <P>
          You may request removal of a Sound you uploaded by contacting{' '}
          <EmailLink email={CONTACT_EMAIL} />. We will endeavour to process removal requests within
          14 days. Note that copies may persist briefly in caches or CDN edge nodes during propagation.
        </P>
      </>
    ),
  },
  {
    id: 'prohibited-content',
    title: '5. Prohibited Content & Conduct',
    content: (
      <>
        <P>
          You agree not to upload, submit, transmit, or otherwise make available through the Service
          any content or conduct that:
        </P>

        <SubHeading>5.1 Intellectual Property Violations</SubHeading>
        <ul style={listStyle}>
          <li style={liStyle}>Infringes any copyright, including uploading commercially released music tracks, sound effects from proprietary games, or any audio you do not own or licence.</li>
          <li style={liStyle}>Uses a trademark in a way that is likely to cause confusion or deception.</li>
          <li style={liStyle}>Misappropriates trade secrets or confidential information.</li>
        </ul>

        <SubHeading>5.2 Harmful or Illegal Content</SubHeading>
        <ul style={listStyle}>
          <li style={liStyle}>Is unlawful, defamatory, obscene, or threatening.</li>
          <li style={liStyle}>Contains hate speech targeting individuals or groups based on race, ethnicity, religion, gender, sexual orientation, disability, or national origin.</li>
          <li style={liStyle}>Constitutes harassment, bullying, or incitement to violence.</li>
          <li style={liStyle}>Depicts or solicits child sexual abuse material (CSAM) — we will report such content to the relevant authorities immediately.</li>
          <li style={liStyle}>Facilitates, promotes, or glorifies terrorism, mass violence, or self-harm.</li>
        </ul>

        <SubHeading>5.3 Technical Abuse</SubHeading>
        <ul style={listStyle}>
          <li style={liStyle}>Introduces malware, viruses, Trojan horses, or any other malicious code.</li>
          <li style={liStyle}>Attempts to scrape, crawl, or systematically download Sounds in bulk without prior written permission.</li>
          <li style={liStyle}>Interferes with or disrupts the integrity or performance of the Service or its infrastructure.</li>
          <li style={liStyle}>Attempts to gain unauthorised access to any part of the Service, servers, or databases.</li>
          <li style={liStyle}>Uses automated tools (bots, scripts) to artificially inflate play or download counts.</li>
        </ul>

        <SubHeading>5.4 Misrepresentation</SubHeading>
        <ul style={listStyle}>
          <li style={liStyle}>Impersonates any person or entity, or falsely claims an affiliation with ZapSoundboard.</li>
          <li style={liStyle}>Submits false DMCA takedown notices or counter-notices.</li>
        </ul>

        <Callout icon="🚫" variant="error">
          Violation of Section 5 may result in immediate account termination, content removal,
          and referral to law enforcement where applicable.
        </Callout>
      </>
    ),
  },
  {
    id: 'dmca',
    title: '6. DMCA & Copyright Complaints',
    content: (
      <>
        <P>
          ZapSoundboard respects intellectual property rights and complies with the{' '}
          <strong>Digital Millennium Copyright Act (DMCA)</strong> and equivalent international
          copyright laws. We respond expeditiously to valid takedown notices.
        </P>

        <SubHeading>6.1 Filing a Takedown Notice</SubHeading>
        <P>
          If you believe content on the Service infringes your copyright, send a written notice
          to <EmailLink email={DMCA_EMAIL} /> containing <strong>all</strong> of the following:
        </P>
        <ol style={olStyle}>
          <li style={liStyle}>A physical or electronic signature of the copyright owner or authorised agent.</li>
          <li style={liStyle}>Identification of the copyrighted work claimed to be infringed (or a representative list if multiple works).</li>
          <li style={liStyle}>Identification of the infringing material with sufficient detail for us to locate it (e.g. the URL of the specific Sound page).</li>
          <li style={liStyle}>Your contact information: name, address, telephone number, and email address.</li>
          <li style={liStyle}>A statement that you have a good-faith belief that the disputed use is not authorised by the copyright owner, its agent, or the law.</li>
          <li style={liStyle}>A statement, made under penalty of perjury, that the information in your notice is accurate and that you are the copyright owner or authorised to act on their behalf.</li>
        </ol>

        <SubHeading>6.2 Counter-Notice</SubHeading>
        <P>
          If you believe your content was removed as a result of a mistaken or misidentified
          takedown, you may submit a counter-notice to <EmailLink email={DMCA_EMAIL} /> containing:
        </P>
        <ol style={olStyle}>
          <li style={liStyle}>Your physical or electronic signature.</li>
          <li style={liStyle}>Identification of the removed material and its location before removal.</li>
          <li style={liStyle}>A statement under penalty of perjury that you have a good-faith belief the material was removed by mistake.</li>
          <li style={liStyle}>Your name, address, telephone number, and consent to jurisdiction of your local federal district court (or equivalent).</li>
        </ol>
        <P>
          Upon receiving a valid counter-notice, we will notify the original complainant and may
          restore the content after 10–14 business days unless the complainant seeks a court order.
        </P>

        <SubHeading>6.3 Repeat Infringers</SubHeading>
        <P>
          In accordance with the DMCA, we maintain a policy of terminating accounts of users who
          are found to be repeat infringers.
        </P>
      </>
    ),
  },
  {
    id: 'downloads',
    title: '7. Downloads & Personal Use',
    content: (
      <>
        <P>
          Sounds available for download on ZapSoundboard are provided for <strong>personal,
          non-commercial use only</strong>, unless explicitly stated otherwise in the sound's metadata
          or licence note.
        </P>
        <ul style={listStyle}>
          <li style={liStyle}><strong>Permitted:</strong> Playing sounds in Discord servers, streams, personal projects, or YouTube videos under fair use or where the original content is in the public domain or is a meme/viral clip that constitutes transformative use.</li>
          <li style={liStyle}><strong>Not permitted:</strong> Reselling, redistributing, or incorporating Sounds into commercial products or services without obtaining appropriate licences from the original rights holders.</li>
          <li style={liStyle}><strong>Your responsibility:</strong> It is your responsibility to verify that your intended use complies with applicable copyright law and any licence terms attached to a given Sound. ZapSoundboard makes no warranty as to the fitness of any Sound for a particular use.</li>
        </ul>
      </>
    ),
  },
  {
    id: 'third-party',
    title: '8. Third-Party Links & Services',
    content: (
      <>
        <P>
          The Service may contain links to third-party websites or services (including our sister
          platform <ExternalLink href="https://flashtts.com">FlashTTS</ExternalLink>). These links
          are provided for convenience only. We have no control over third-party content and assume
          no responsibility for it. Visiting third-party sites is at your own risk and subject to
          their own terms and privacy policies.
        </P>
        <P>
          The Service displays advertisements via <strong>Google AdSense</strong>. Advertisements
          are not endorsements. We are not responsible for the accuracy or content of advertisements
          or the products and services they promote.
        </P>
      </>
    ),
  },
  {
    id: 'intellectual-property',
    title: '9. ZapSoundboard Intellectual Property',
    content: (
      <>
        <P>
          All elements of the Service that are our original work — including the website design, logo,
          branding, source code, and editorial curation — are owned by or licenced to ZapSoundboard
          and are protected by copyright, trademark, and other intellectual property laws.
        </P>
        <P>
          You may not reproduce, distribute, modify, create derivative works from, or commercially
          exploit any part of the Service without our prior written consent. Fair use and other
          statutory exceptions to copyright are not affected by this clause.
        </P>
      </>
    ),
  },
  {
    id: 'disclaimers',
    title: '10. Disclaimer of Warranties',
    content: (
      <>
        <Callout icon="⚠️" variant="warning">
          THE SERVICE IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTY OF ANY KIND.
        </Callout>
        <P>
          To the fullest extent permitted by applicable law, ZapSoundboard expressly disclaims all
          warranties, whether express, implied, statutory, or otherwise, including but not limited to:
        </P>
        <ul style={listStyle}>
          <li style={liStyle}><strong>Implied warranties of merchantability</strong> — we make no warranty that the Service meets your requirements or expectations.</li>
          <li style={liStyle}><strong>Fitness for a particular purpose</strong> — we make no warranty that the Service is suitable for any specific use case.</li>
          <li style={liStyle}><strong>Non-infringement</strong> — we do not warrant that user-uploaded content is free from third-party intellectual property claims.</li>
          <li style={liStyle}><strong>Accuracy</strong> — we do not warrant that sound metadata, tags, or descriptions are accurate or complete.</li>
          <li style={liStyle}><strong>Uninterrupted or error-free operation</strong> — we do not warrant that the Service will be available at all times or free from bugs, errors, or security vulnerabilities.</li>
        </ul>
        <P>
          Some jurisdictions do not allow the exclusion of implied warranties; in such jurisdictions
          the above exclusions apply to the maximum extent permitted by law.
        </P>
      </>
    ),
  },
  {
    id: 'liability',
    title: '11. Limitation of Liability',
    content: (
      <>
        <Callout icon="⚠️" variant="warning">
          TO THE MAXIMUM EXTENT PERMITTED BY LAW, ZAPSOUNDBOARD SHALL NOT BE LIABLE FOR ANY
          INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES.
        </Callout>
        <P>
          This includes, without limitation, damages for:
        </P>
        <ul style={listStyle}>
          <li style={liStyle}>Loss of profits, revenue, data, goodwill, or business opportunities.</li>
          <li style={liStyle}>Costs of substitute services.</li>
          <li style={liStyle}>Any harm caused by user-uploaded content, including copyright infringement claims arising from content uploaded by third-party users.</li>
          <li style={liStyle}>Unauthorised access to or alteration of your transmissions or data.</li>
          <li style={liStyle}>Service interruptions, errors, or bugs.</li>
        </ul>
        <P>
          In jurisdictions where a total exclusion of liability is not permitted, our total aggregate
          liability to you for all claims arising out of or related to your use of the Service shall
          not exceed <strong>€100 EUR</strong> (or the local currency equivalent).
        </P>
        <P>
          Nothing in these Terms limits our liability for death or personal injury caused by our
          negligence, fraud, or any other liability that cannot be excluded by law.
        </P>
      </>
    ),
  },
  {
    id: 'indemnification',
    title: '12. Indemnification',
    content: (
      <>
        <P>
          You agree to defend, indemnify, and hold harmless ZapSoundboard and its affiliates,
          officers, directors, employees, and agents from and against any and all claims, damages,
          obligations, losses, liabilities, costs, and expenses (including reasonable legal fees)
          arising from:
        </P>
        <ul style={listStyle}>
          <li style={liStyle}>Your use of or access to the Service.</li>
          <li style={liStyle}>Content you upload, submit, or transmit through the Service.</li>
          <li style={liStyle}>Your violation of these Terms.</li>
          <li style={liStyle}>Your violation of any third-party rights, including intellectual property rights.</li>
          <li style={liStyle}>Any claim that your content caused damage to a third party.</li>
        </ul>
      </>
    ),
  },
  {
    id: 'governing-law',
    title: '13. Governing Law & Disputes',
    content: (
      <>
        <SubHeading>13.1 Governing Law</SubHeading>
        <P>
          These Terms are governed by and construed in accordance with the laws of the{' '}
          <strong>European Union</strong> and applicable member-state law, without regard to conflict
          of law principles. Where EU law does not apply, the laws of the jurisdiction in which
          ZapSoundboard is primarily operated shall govern.
        </P>
        <SubHeading>13.2 Informal Resolution</SubHeading>
        <P>
          Before initiating any formal dispute, you agree to first contact us at{' '}
          <EmailLink email={CONTACT_EMAIL} /> and attempt to resolve the matter informally. We will
          try in good faith to resolve any dispute within 30 days of receiving your written notice.
        </P>
        <SubHeading>13.3 Formal Disputes</SubHeading>
        <P>
          If informal resolution fails, disputes shall be submitted to the competent courts of the
          jurisdiction governing these Terms. You retain the right to bring individual claims in small
          claims court where applicable. Nothing herein prevents either party from seeking injunctive
          or other equitable relief in any court of competent jurisdiction.
        </P>
        <SubHeading>13.4 EU Consumer Rights</SubHeading>
        <P>
          If you are an EU consumer, you may also submit a complaint through the EU Online Dispute
          Resolution platform at{' '}
          <ExternalLink href="https://ec.europa.eu/consumers/odr">
            ec.europa.eu/consumers/odr
          </ExternalLink>
          .
        </P>
      </>
    ),
  },
  {
    id: 'termination',
    title: '14. Termination',
    content: (
      <>
        <P>
          Either party may terminate the relationship governed by these Terms at any time:
        </P>
        <ul style={listStyle}>
          <li style={liStyle}><strong>You</strong> may stop using the Service at any time and request account deletion per our <Link to="/privacy#data-deletion" style={{ color: 'var(--accent-dark)', fontWeight: 600, textDecoration: 'none' }}>Privacy Policy</Link>.</li>
          <li style={liStyle}><strong>We</strong> may suspend or terminate your access immediately and without notice if you breach these Terms, engage in conduct harmful to the Service, or if we are required to do so by law.</li>
        </ul>
        <P>
          Upon termination, all licences granted to you cease immediately. Sections 4.2, 5, 6, 9,
          10, 11, 12, and 13 survive termination.
        </P>
      </>
    ),
  },
  {
    id: 'changes',
    title: '15. Changes to These Terms',
    content: (
      <>
        <P>
          We may revise these Terms at any time by posting an updated version on this page.
          For material changes, we will provide at least <strong>14 days' notice</strong> via a
          prominent notice on the website or (if you have an account) by email.
        </P>
        <P>
          Your continued use of the Service after the effective date of any revision constitutes
          your acceptance of the updated Terms. If you do not agree, you must stop using the
          Service before the changes take effect.
        </P>
      </>
    ),
  },
  {
    id: 'contact',
    title: '16. Contact',
    content: (
      <>
        <P>
          For general legal enquiries regarding these Terms, contact us at:
        </P>
        <div style={{
          background: 'var(--bg-secondary)', border: '1px solid var(--border)',
          borderRadius: 'var(--r-lg)', padding: 'var(--sp-5)',
          fontSize: 14, color: 'var(--text)', lineHeight: 1.9,
          marginBottom: 16,
        }}>
          <strong>ZapSoundboard — Legal</strong><br />
          General legal: <EmailLink email={CONTACT_EMAIL} /><br />
          Copyright / DMCA: <EmailLink email={DMCA_EMAIL} /><br />
          Privacy: <EmailLink email="privacy@zapsoundboard.com" /><br />
          Response time: within 30 days for legal requests
        </div>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <Link to="/privacy" style={{
            fontSize: 13, color: 'var(--text-secondary)', textDecoration: 'none',
            display: 'inline-flex', alignItems: 'center', gap: 6,
          }}>
            🔒 Privacy Policy →
          </Link>
          <Link to="/about" style={{
            fontSize: 13, color: 'var(--text-secondary)', textDecoration: 'none',
            display: 'inline-flex', alignItems: 'center', gap: 6,
          }}>
            ⚡ About ZapSoundboard →
          </Link>
        </div>
      </>
    ),
  },
]

// ── Page ─────────────────────────────────────────────────────────────────────

export default function TermsPage() {
  const [activeSection, setActiveSection] = useState<string | null>(null)

  function scrollTo(id: string) {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <>
      <Helmet>
        <title>Terms of Service — ZapSoundboard</title>
        <meta
          name="description"
          content="ZapSoundboard Terms of Service — rules for using the platform, uploading sounds, DMCA policy, disclaimer of warranties, and governing law."
        />
        <meta property="og:title"       content="Terms of Service — ZapSoundboard" />
        <meta property="og:description" content="ZapSoundboard's Terms of Service covering uploads, DMCA, disclaimers, and liability." />
        <meta property="og:type"        content="website" />
        <link rel="canonical"           href="https://zapsoundboard.com/terms" />
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
                📋 Legal
              </div>
              <h1 style={{
                fontSize: 'clamp(24px, 4vw, 40px)', fontWeight: 800,
                letterSpacing: '-0.03em', color: 'var(--text)', marginBottom: 12,
              }}>
                Terms of Service
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
                className="terms-toc"
                style={{
                  position: 'sticky', top: 'calc(var(--navbar-h) + 24px)',
                  width: 210, flexShrink: 0,
                  display: 'flex', flexDirection: 'column', gap: 2,
                  minWidth: 210,
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
                      color:      activeSection === s.id ? 'var(--text)'           : 'var(--text-secondary)',
                      fontWeight: activeSection === s.id ? 600                     : 400,
                      background: activeSection === s.id ? 'var(--bg-secondary)'   : 'transparent',
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

                {/* Key points summary */}
                <div style={{
                  background: 'var(--accent-subtle)', border: '1px solid var(--accent-border)',
                  borderRadius: 'var(--r-xl)', padding: 'var(--sp-5) var(--sp-6)',
                  marginBottom: 'var(--sp-8)',
                }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--accent-dark)', marginBottom: 10 }}>
                    ⚡ Key Points
                  </div>
                  <ul style={{ ...listStyle, marginBottom: 0 }}>
                    {[
                      'The Service is free — no hidden fees, subscriptions, or paywalls.',
                      'You must own the rights to any Sound you upload. Infringing uploads will be removed.',
                      'All uploads require admin approval before going live.',
                      'We comply with the DMCA — valid takedown notices are acted on promptly.',
                      'Downloads are for personal, non-commercial use only.',
                      'We disclaim all warranties and cap our liability to €100.',
                    ].map((point, i) => (
                      <li key={i} style={{ ...liStyle, color: 'var(--text)' }}>{point}</li>
                    ))}
                  </ul>
                </div>

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
          .terms-toc { display: none !important; }
        }
      `}</style>
    </>
  )
}
