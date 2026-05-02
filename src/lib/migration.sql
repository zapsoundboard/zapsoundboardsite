-- ZapSoundboard Complete Database Schema (FIXED)
-- Run this in Supabase SQL Editor

-- Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ─── Users Table ───────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
  id          uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email       text NOT NULL,
  username    text,
  is_admin    boolean NOT NULL DEFAULT false,
  is_banned   boolean NOT NULL DEFAULT false,
  created_at  timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users readable by all authenticated"
  ON users FOR SELECT TO authenticated USING (true);

-- ─── Sounds Table ──────────────────────────────────────
CREATE TABLE IF NOT EXISTS sounds (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title           text NOT NULL,
  slug            text UNIQUE NOT NULL,
  description     text,
  sound_category  text NOT NULL DEFAULT 'meme',
  subcategory     text,
  tags            text[] NOT NULL DEFAULT '{}',
  r2_url          text,
  r2_key          text,
  file_size       integer NOT NULL DEFAULT 0,
  duration        numeric(6,2),
  plays           integer NOT NULL DEFAULT 0,
  likes           integer NOT NULL DEFAULT 0,
  downloads       integer NOT NULL DEFAULT 0,
  is_featured     boolean NOT NULL DEFAULT false,
  is_ai_generated boolean NOT NULL DEFAULT false,
  status          text NOT NULL DEFAULT 'pending'
                  CHECK (status IN ('pending','approved','rejected')),
  uploaded_by     uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  reject_reason   text,
  created_at      timestamptz NOT NULL DEFAULT now(),
  approved_at     timestamptz
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_sounds_status   ON sounds(status);
CREATE INDEX IF NOT EXISTS idx_sounds_category ON sounds(sound_category);
CREATE INDEX IF NOT EXISTS idx_sounds_plays    ON sounds(plays DESC);
CREATE INDEX IF NOT EXISTS idx_sounds_slug     ON sounds(slug);
CREATE INDEX IF NOT EXISTS idx_sounds_featured ON sounds(is_featured)
  WHERE is_featured = true;

ALTER TABLE sounds ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Approved sounds public"
  ON sounds FOR SELECT
  USING (status = 'approved');

CREATE POLICY "Admin full access"
  ON sounds FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid() AND is_admin = true
    )
  );

-- ─── Site Settings ────────────────────────────────────
CREATE TABLE IF NOT EXISTS site_settings (
  id                        integer PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  announcement_enabled      boolean NOT NULL DEFAULT false,
  announcement_text         text NOT NULL DEFAULT '',
  announcement_color        text NOT NULL DEFAULT '#f5c518',
  announcement_link         text,
  announcement_dismissable  boolean NOT NULL DEFAULT true,
  adsense_enabled           boolean NOT NULL DEFAULT false,
  adsense_client_id         text NOT NULL DEFAULT '',
  custom_ads_enabled        boolean NOT NULL DEFAULT false,
  maintenance_mode          boolean NOT NULL DEFAULT false,
  updated_at                timestamptz NOT NULL DEFAULT now()
);

INSERT INTO site_settings (id) VALUES (1) ON CONFLICT DO NOTHING;

ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Settings public read"
  ON site_settings FOR SELECT USING (true);

CREATE POLICY "Admin settings write"
  ON site_settings FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid() AND is_admin = true
    )
  );

-- ─── Custom Ads ───────────────────────────────────────
CREATE TABLE IF NOT EXISTS custom_ads (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title       text NOT NULL,
  image_url   text NOT NULL,
  target_url  text NOT NULL,
  position    text NOT NULL DEFAULT 'top'
              CHECK (position IN ('top','sidebar','between-sounds','download')),
  is_active   boolean NOT NULL DEFAULT true,
  clicks      integer NOT NULL DEFAULT 0,
  impressions integer NOT NULL DEFAULT 0,
  created_at  timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE custom_ads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Active ads public"
  ON custom_ads FOR SELECT USING (
    is_active = true OR 
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND is_admin = true)
  );

CREATE POLICY "Admin full access custom_ads"
  ON custom_ads FOR ALL TO authenticated USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND is_admin = true)
  );

-- ─── Sound Requests ───────────────────────────────────
CREATE TABLE IF NOT EXISTS sound_requests (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title        text NOT NULL,
  description  text,
  req_category text,
  requested_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  upvotes      integer NOT NULL DEFAULT 0,
  status       text NOT NULL DEFAULT 'pending'
               CHECK (status IN ('pending','fulfilled','rejected')),
  created_at   timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE sound_requests ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Requests public read"
  ON sound_requests FOR SELECT USING (true);
CREATE POLICY "Anyone can insert requests"
  ON sound_requests FOR INSERT WITH CHECK (true);

-- ─── Blog Posts ───────────────────────────────────────
CREATE TABLE IF NOT EXISTS blog_posts (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title        text NOT NULL,
  slug         text UNIQUE NOT NULL,
  content      text NOT NULL DEFAULT '',
  excerpt      text NOT NULL DEFAULT '',
  cover_image  text,
  tags         text[] NOT NULL DEFAULT '{}',
  author_id    uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  is_published boolean NOT NULL DEFAULT false,
  views        integer NOT NULL DEFAULT 0,
  published_at timestamptz,
  created_at   timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Published posts public"
  ON blog_posts FOR SELECT USING (is_published = true);

-- ─── RPCs ─────────────────────────────────────────────
CREATE OR REPLACE FUNCTION increment_play(sid uuid)
RETURNS void LANGUAGE sql SECURITY DEFINER AS $$
  UPDATE sounds
  SET plays = plays + 1
  WHERE id = sid AND status = 'approved';
$$;

CREATE OR REPLACE FUNCTION increment_download(sid uuid)
RETURNS void LANGUAGE sql SECURITY DEFINER AS $$
  UPDATE sounds
  SET downloads = downloads + 1
  WHERE id = sid AND status = 'approved';
$$;

CREATE OR REPLACE FUNCTION increment_like(sid uuid)
RETURNS void LANGUAGE sql SECURITY DEFINER AS $$
  UPDATE sounds SET likes = likes + 1 WHERE id = sid;
$$;

CREATE OR REPLACE FUNCTION decrement_like(sid uuid)
RETURNS void LANGUAGE sql SECURITY DEFINER AS $$
  UPDATE sounds
  SET likes = GREATEST(likes - 1, 0)
  WHERE id = sid;
$$;

-- ─── Ad Tracking ───────────────────────────────────────
CREATE OR REPLACE FUNCTION increment_ad_click(ad_id uuid)
RETURNS void LANGUAGE sql SECURITY DEFINER AS $$
  UPDATE custom_ads
  SET clicks = clicks + 1
  WHERE id = ad_id;
$$;

CREATE OR REPLACE FUNCTION increment_ad_impression(ad_id uuid)
RETURNS void LANGUAGE sql SECURITY DEFINER AS $$
  UPDATE custom_ads
  SET impressions = impressions + 1
  WHERE id = ad_id;
$$;

-- ─── Trending View ────────────────────────────────────
CREATE OR REPLACE VIEW trending_sounds AS
  SELECT *,
    (plays * 0.6 + likes * 0.3 + downloads * 0.1) AS score
  FROM sounds
  WHERE status = 'approved'
    AND created_at > now() - interval '30 days'
  ORDER BY score DESC;