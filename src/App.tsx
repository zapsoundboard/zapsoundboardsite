import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { HelmetProvider } from 'react-helmet-async'
import { useEffect } from 'react'
import { useThemeStore } from '@/store'

// UI
import ErrorBoundary from '@/components/ui/ErrorBoundary'
import ToastContainer from '@/components/ui/Toast'
import PWABanner from '@/components/ui/PWABanner'

// Pages — Phase 2
import HomePage from '@/pages/Home'

// Pages — Phase 4
import CategoryPage    from '@/pages/Category'
import CategoriesPage  from '@/pages/Categories'
import SoundPage       from '@/pages/Sound'
import RequestsPage    from '@/pages/Requests'
import {
  SearchPage, TrendingPage, UploadPage, NotFoundPage,
} from '@/pages/Pages'
import BlogPage     from '@/pages/Blog'
import BlogPostPage from '@/pages/BlogPost'
import AdminBlog   from '@/pages/admin/Blog'
import BlogEditor  from '@/pages/admin/BlogEditor'
import About        from '@/pages/legal/About'
import Privacy      from '@/pages/legal/Privacy'
import TermsPage    from '@/pages/legal/Terms'
import DMCAPage     from '@/pages/legal/DMCA'
import ContactPage        from '@/pages/legal/Contact'
import ContentRemovalPage from '@/pages/legal/ContentRemoval'
import Disclaimer   from '@/pages/legal/Disclaimer'
import CookiePolicy from '@/pages/legal/CookiePolicy'
import {
  GoofyAhhSoundboard, VineBoomSound, BruhSoundEffect,
  ItalianBrainrotSoundboard, RizzSoundboard, MemeSoundboard,
  DiscordSoundboard, FreeSoundboard, SoundboardUnblocked,
  FunnySoundboard, AnimeSoundboard, GamingSoundboard,
  SoundboardOnlinePage, MyInstantsPage, Soundboard101Page,
  SoundButtonsPage, SoundButtonsWorldPage, SoundboardGuysPage,
  SoundButtonsProPage, SoundboardWPage, SoundAlertsPage,
  KidSoundboardPage, SoundButtonAllPage, SoundButtonsMaxPage,
} from '@/pages/seo/SeoPages'

// Admin — Phase 3
import AdminGuard        from '@/components/admin/AdminGuard'
import AdminLogin        from '@/pages/admin/Login'
import AdminLayout       from '@/pages/admin/Layout'
import AdminDashboard    from '@/pages/admin/Dashboard'
import AdminPending      from '@/pages/admin/Pending'
import AdminSounds       from '@/pages/admin/Sounds'
import AdminAnnouncement from '@/pages/admin/Announcement'
import AdminAds          from '@/pages/admin/Ads'
import AdminAnalytics    from '@/pages/admin/Analytics'
import AdminBulkUpload   from '@/pages/admin/BulkUpload'
import AdminCategories   from '@/pages/admin/Categories'
import PageTracker       from '@/components/analytics/PageTracker'

export default function App() {
  const { theme } = useThemeStore()

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
  }, [theme])

  return (
    <ErrorBoundary>
      <HelmetProvider>
        <BrowserRouter>
          <PageTracker />
          {/* Global UI */}
          <ToastContainer />
          <PWABanner />

          <Routes>
            {/* ── Public ── */}
            <Route path="/"                          element={<HomePage />} />
            <Route path="/soundboard"                element={<CategoryPage />} />
            <Route path="/soundboard/:category"      element={<CategoryPage />} />
            <Route path="/soundboard/:category/:sub" element={<CategoryPage />} />
            <Route path="/categories"                element={<CategoriesPage />} />
            <Route path="/sounds/:slug"              element={<SoundPage />} />
            <Route path="/search"                    element={<SearchPage />} />
            <Route path="/trending"                  element={<TrendingPage />} />
            <Route path="/upload"                    element={<UploadPage />} />
            <Route path="/requests"                  element={<RequestsPage />} />
            <Route path="/blog"                      element={<BlogPage />} />
            <Route path="/blog/:slug"                element={<BlogPostPage />} />
            <Route path="/about"                     element={<About />} />
            <Route path="/privacy"                   element={<Privacy />} />
            <Route path="/terms"                     element={<TermsPage />} />
            <Route path="/dmca"                      element={<DMCAPage />} />
            <Route path="/contact"                   element={<ContactPage />} />
            <Route path="/content-removal"           element={<ContentRemovalPage />} />
            <Route path="/disclaimer"                element={<Disclaimer />} />
            <Route path="/cookie-policy"             element={<CookiePolicy />} />

            {/* ── SEO Pages ── */}
            <Route path="/goofy-ahh-soundboard"       element={<GoofyAhhSoundboard />} />
            <Route path="/vine-boom-sound"             element={<VineBoomSound />} />
            <Route path="/bruh-sound-effect"           element={<BruhSoundEffect />} />
            <Route path="/italian-brainrot-soundboard" element={<ItalianBrainrotSoundboard />} />
            <Route path="/rizz-soundboard"             element={<RizzSoundboard />} />
            <Route path="/meme-soundboard"             element={<MemeSoundboard />} />
            <Route path="/discord-soundboard"          element={<DiscordSoundboard />} />
            <Route path="/free-soundboard"             element={<FreeSoundboard />} />
            <Route path="/soundboard-unblocked"        element={<SoundboardUnblocked />} />
            <Route path="/funny-soundboard"            element={<FunnySoundboard />} />
            <Route path="/anime-soundboard"            element={<AnimeSoundboard />} />
            <Route path="/gaming-soundboard"           element={<GamingSoundboard />} />
            <Route path="/soundboard-online"           element={<SoundboardOnlinePage />} />
            <Route path="/myinstants"                  element={<MyInstantsPage />} />
            <Route path="/101soundboard"       element={<Soundboard101Page />} />
            <Route path="/sound-buttons"       element={<SoundButtonsPage />} />
            <Route path="/sound-buttons-world" element={<SoundButtonsWorldPage />} />
            <Route path="/soundboard-guys"     element={<SoundboardGuysPage />} />
            <Route path="/sound-buttons-pro"   element={<SoundButtonsProPage />} />
            <Route path="/soundboardw"         element={<SoundboardWPage />} />
            <Route path="/sound-alerts"        element={<SoundAlertsPage />} />
            <Route path="/kid-soundboard"      element={<KidSoundboardPage />} />
            <Route path="/sound-button-all"    element={<SoundButtonAllPage />} />
            <Route path="/sound-buttons-max"   element={<SoundButtonsMaxPage />} />

            {/* ── Admin ── */}
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/admin" element={<AdminGuard><AdminLayout /></AdminGuard>}>
              <Route index               element={<AdminDashboard />} />
              <Route path="pending"      element={<AdminPending />} />
              <Route path="sounds"       element={<AdminSounds />} />
              <Route path="announcement" element={<AdminAnnouncement />} />
              <Route path="ads"          element={<AdminAds />} />
              <Route path="blog"         element={<AdminBlog />} />
              <Route path="blog/new"     element={<BlogEditor />} />
              <Route path="blog/:id"     element={<BlogEditor />} />
              <Route path="bulk-upload"  element={<AdminBulkUpload />} />
              <Route path="analytics"    element={<AdminAnalytics />} />
              <Route path="categories"   element={<AdminCategories />} />
            </Route>

            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </BrowserRouter>
      </HelmetProvider>
    </ErrorBoundary>
  )
}
