/**
 * ZapSoundboard — Cloudflare Worker API
 * Handles: R2 operations, sitemap, play tracking
 */

export interface Env {
  AUDIO_BUCKET: R2Bucket
  SUPABASE_URL: string
  SUPABASE_SERVICE_KEY: string
  RESEND_API_KEY: string
}

function cors() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': '*',
    'Access-Control-Max-Age': '86400',
  }
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    if (request.method === 'OPTIONS')
      return new Response(null, { headers: cors() })

    const url = new URL(request.url)
    const path = url.pathname

    try {
      if (path === '/sitemap.xml' && request.method === 'GET')
        return handleSitemap(env)
      if (path === '/api/admin/upload' && request.method === 'POST')
        return handleUpload(request, env)
      if (path === '/api/admin/approve' && request.method === 'POST')
        return handleApprove(request, env)
      if (path === '/api/admin/reject' && request.method === 'POST')
        return handleReject(request, env)
      if (path === '/api/admin/delete' && request.method === 'DELETE')
        return handleDelete(request, env)

      return new Response(JSON.stringify({ error: 'Not found' }), {
        status: 404,
        headers: { ...cors(), 'Content-Type': 'application/json' },
      })
    } catch (e) {
      console.error(e)
      return new Response(JSON.stringify({ error: 'Internal server error' }), {
        status: 500,
        headers: { ...cors(), 'Content-Type': 'application/json' },
      })
    }
  },
}

// ── Sitemap Handler ────────────────────────────────────
async function handleSitemap(env: Env): Promise<Response> {
  const res = await fetch(
    `${env.SUPABASE_URL}/rest/v1/sounds?status=eq.approved&select=slug,approved_at&order=approved_at.desc`,
    { headers: { apikey: env.SUPABASE_SERVICE_KEY, Authorization: `Bearer ${env.SUPABASE_SERVICE_KEY}` } }
  )
  const sounds = await res.json() as { slug: string; approved_at: string }[]

  const categories = [
    'meme','discord','reaction','gaming','brainrot',
    'culture','music','viral','whatsapp','anime',
    'movies','sports','politics','pranks','sound-effects','ai-voices',
  ]

  const staticUrls = [
    { url: 'https://zapsoundboard.com/', priority: '1.0' },
    { url: 'https://zapsoundboard.com/soundboard', priority: '0.9' },
    { url: 'https://zapsoundboard.com/trending', priority: '0.8' },
    { url: 'https://zapsoundboard.com/upload', priority: '0.7' },
    { url: 'https://zapsoundboard.com/blog', priority: '0.7' },
    { url: 'https://zapsoundboard.com/tools', priority: '0.7' },
    ...categories.map(c => ({ url: `https://zapsoundboard.com/soundboard/${c}`, priority: '0.8' })),
  ]

  const soundUrls = sounds.map(s => ({
    url: `https://zapsoundboard.com/sounds/${s.slug}`,
    lastmod: s.approved_at?.split('T')[0] ?? new Date().toISOString().split('T')[0],
    priority: '0.6',
  }))

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${[...staticUrls, ...soundUrls].map(u => `  <url>
    <loc>${u.url}</loc>
    ${'lastmod' in u ? `<lastmod>${u.lastmod}</lastmod>` : ''}
    <priority>${u.priority}</priority>
  </url>`).join('\n')}
</urlset>`

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 'public, max-age=3600',
      ...cors(),
    },
  })
}

// ── Upload Sound ───────────────────────────────────────
async function handleUpload(request: Request, env: Env): Promise<Response> {
  const form = await request.formData()
  const file        = form.get('file')        as File   | null
  const title       = form.get('title')       as string | null
  const slug        = form.get('slug')        as string | null
  const category    = form.get('category')    as string | null
  const subcategory = form.get('subcategory') as string | null
  const character   = form.get('character')   as string | null
  const color       = form.get('color')       as string ?? '#f5c518'

  if (!file || !slug || !category) {
    return new Response(JSON.stringify({ error: 'Missing required fields: file, slug, category' }), {
      status: 400, headers: { ...cors(), 'Content-Type': 'application/json' },
    })
  }

  const parts = ['approved', category]
  if (subcategory?.trim()) parts.push(subcategory.trim())
  if (character?.trim())   parts.push(character.trim())
  parts.push(`${slug}.mp3`)
  const r2Key = parts.join('/')
  const r2Url = `https://sounds.zapsoundboard.com/${r2Key}`

  await env.AUDIO_BUCKET.put(r2Key, file.stream(), {
    httpMetadata: { contentType: 'audio/mpeg' },
    customMetadata: { title: title ?? slug },
  })

  // Insert approved record directly into Supabase
  await fetch(`${env.SUPABASE_URL}/rest/v1/sounds`, {
    method: 'POST',
    headers: {
      apikey: env.SUPABASE_SERVICE_KEY,
      Authorization: `Bearer ${env.SUPABASE_SERVICE_KEY}`,
      'Content-Type': 'application/json',
      Prefer: 'return=minimal',
    },
    body: JSON.stringify({
      title: title ?? slug,
      slug,
      category,
      color,
      status: 'approved',
      r2_key: r2Key,
      r2_url: r2Url,
      approved_at: new Date().toISOString(),
    }),
  })

  return new Response(JSON.stringify({ r2Key, r2Url }), {
    headers: { ...cors(), 'Content-Type': 'application/json' },
  })
}

// ── Approve Sound ──────────────────────────────────────
async function handleApprove(request: Request, env: Env): Promise<Response> {
  const { soundId, pendingKey, category, slug } = await request.json() as {
    soundId: string; pendingKey: string; category: string; slug: string
  }

  // Move R2: pending/ → approved/
  const obj = await env.AUDIO_BUCKET.get(pendingKey)
  if (!obj) {
    return new Response(JSON.stringify({ error: 'File not found in R2' }), {
      status: 404, headers: { ...cors(), 'Content-Type': 'application/json' },
    })
  }

  const newKey = `approved/${category}/${slug}.mp3`
  const r2Url = `https://sounds.zapsoundboard.com/${newKey}`

  await env.AUDIO_BUCKET.put(newKey, obj.body, {
    httpMetadata: { contentType: 'audio/mpeg' },
  })
  await env.AUDIO_BUCKET.delete(pendingKey)

  // Update Supabase
  await fetch(
    `${env.SUPABASE_URL}/rest/v1/sounds?id=eq.${soundId}`,
    {
      method: 'PATCH',
      headers: {
        apikey: env.SUPABASE_SERVICE_KEY,
        Authorization: `Bearer ${env.SUPABASE_SERVICE_KEY}`,
        'Content-Type': 'application/json',
        Prefer: 'return=minimal',
      },
      body: JSON.stringify({
        status: 'approved',
        r2_key: newKey,
        r2_url: r2Url,
        approved_at: new Date().toISOString(),
      }),
    }
  )

  return new Response(JSON.stringify({ success: true, r2Url }), {
    headers: { ...cors(), 'Content-Type': 'application/json' },
  })
}

// ── Reject Sound ───────────────────────────────────────
async function handleReject(request: Request, env: Env): Promise<Response> {
  const { soundId, r2Key, reason } = await request.json() as {
    soundId: string; r2Key: string; reason: string
  }

  // Delete from R2
  await env.AUDIO_BUCKET.delete(r2Key)

  // Update Supabase
  await fetch(
    `${env.SUPABASE_URL}/rest/v1/sounds?id=eq.${soundId}`,
    {
      method: 'PATCH',
      headers: {
        apikey: env.SUPABASE_SERVICE_KEY,
        Authorization: `Bearer ${env.SUPABASE_SERVICE_KEY}`,
        'Content-Type': 'application/json',
        Prefer: 'return=minimal',
      },
      body: JSON.stringify({ status: 'rejected', reject_reason: reason, r2_key: null }),
    }
  )

  return new Response(JSON.stringify({ success: true }), {
    headers: { ...cors(), 'Content-Type': 'application/json' },
  })
}

// ── Delete Sound ───────────────────────────────────────
async function handleDelete(request: Request, env: Env): Promise<Response> {
  const { soundId, r2Key } = await request.json() as { soundId: string; r2Key: string }
  await env.AUDIO_BUCKET.delete(r2Key)
  await fetch(
    `${env.SUPABASE_URL}/rest/v1/sounds?id=eq.${soundId}`,
    {
      method: 'DELETE',
      headers: {
        apikey: env.SUPABASE_SERVICE_KEY,
        Authorization: `Bearer ${env.SUPABASE_SERVICE_KEY}`,
      },
    }
  )
  return new Response(JSON.stringify({ success: true }), {
    headers: { ...cors(), 'Content-Type': 'application/json' },
  })
}
