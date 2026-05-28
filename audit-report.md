# Merkei Solutions Website — Full Audit Report
**Date:** 2026-05-28  
**Audited by:** Claude (Cowork)  
**Scope:** All HTML pages, sitemap, assets  
**Pages Scanned:** index.html, 360-assessment.html, cloud-migration.html, office-setup.html, sms-gateway.html, web-portfolio.html

---

## Severity Legend
| Level | Meaning |
|---|---|
| 🔴 Critical | Security risk or major SEO/UX failure — fix immediately |
| 🟠 High | Significant issue affecting performance, discoverability, or trust |
| 🟡 Medium | Best-practice violation; should be fixed before next deploy |
| 🟢 Low | Minor improvement opportunity |
| ✅ Pass | No issues found |

---

## 1. Security Audit

### 🔴 Web3Forms API Key Exposed in HTML Source
**File:** `index.html` — Line 221  
**Issue:** `access_key` value `fd16fcd3-3691-4b6d-87a8-f855182a7887` is visible in plain HTML. Anyone can scrape this key and abuse your Web3Forms quota to spam your inbox or exhaust your submission limits.  
**Fix:** This is unavoidable with Web3Forms' design (it's client-side), but you should:
- Enable **domain restriction** in your Web3Forms dashboard (only allow submissions from `merkeisolutions.com`)
- Enable reCAPTCHA/hCaptcha via Web3Forms settings
- Consider migrating to a server-side form handler (Cloudflare Worker or a simple Flask endpoint on your VPS)

### 🔴 `target="_blank"` Without `rel="noopener noreferrer"`
**File:** `index.html` — Line 234 (WhatsApp button)  
**Issue:** `<a href="https://wa.me/..." target="_blank">` — missing `rel="noopener noreferrer"`. This is a **reverse tabnapping** vulnerability; the opened tab can manipulate `window.opener`.  
**Fix:**
```html
<a href="https://wa.me/94701113511" class="whatsapp" target="_blank" rel="noopener noreferrer">
```

### 🟠 No Subresource Integrity (SRI) on External CDN Assets
**Affects:** All 6 pages  
**Issue:** Font Awesome 6.0.0 from `cdnjs.cloudflare.com` and Google Fonts are loaded without `integrity` and `crossorigin` attributes. If the CDN is compromised, malicious CSS/scripts would load silently.  
**Fix:** Add SRI hashes. Example for Font Awesome:
```html
<link rel="stylesheet"
  href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css"
  integrity="sha512-9usAa10IRO0HhonpyAIVpjrylPvoDwiPUiKdWk5t3PyolY1cOd4DSE0Ga+ri4AuTroPR5aQvXU9xC6qOK5iqA=="
  crossorigin="anonymous"
  referrerpolicy="no-referrer" />
```

### 🟡 `index_backup.html` is Publicly Accessible
**Issue:** `index_backup.html` sits in the web root. While small (2KB), backup files in the document root are a security and professionalism concern — they can expose revision history or partial configs.  
**Fix:** Delete or move it outside the web root / add a `.htaccess` / Nginx deny rule for `*_backup*` patterns.

### 🟡 No `robots.txt` File
**Issue:** No `robots.txt` exists. Without it, crawlers have no directives. The backup file and any future sensitive paths will be indexed.  
**Fix:** Create `/robots.txt`:
```
User-agent: *
Disallow: /index_backup.html
Sitemap: https://merkeisolutions.com/sitemap.xml
```

### 🟡 No HTTP Security Headers Defined at Application Level
**Note:** These are best enforced at the server/CDN layer (Nginx, Cloudflare), but worth documenting.  
Missing headers: `Content-Security-Policy`, `X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy`.  
**Fix (Nginx example):**
```nginx
add_header X-Frame-Options "SAMEORIGIN" always;
add_header X-Content-Type-Options "nosniff" always;
add_header Referrer-Policy "strict-origin-when-cross-origin" always;
add_header Content-Security-Policy "default-src 'self'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://cdnjs.cloudflare.com; font-src https://fonts.gstatic.com https://cdnjs.cloudflare.com; connect-src https://api.web3forms.com;" always;
```

---

## 2. SEO Audit

### 🔴 Sitemap Incomplete — Only Homepage Listed
**File:** `sitemap.xml`  
**Issue:** Sitemap only contains `https://merkeisolutions.com/`. All 5 case study pages are invisible to search engines via the sitemap.  
**Fix:** Update sitemap to include all pages:
```xml
<url><loc>https://merkeisolutions.com/sms-gateway.html</loc></url>
<url><loc>https://merkeisolutions.com/360-assessment.html</loc></url>
<url><loc>https://merkeisolutions.com/cloud-migration.html</loc></url>
<url><loc>https://merkeisolutions.com/office-setup.html</loc></url>
<url><loc>https://merkeisolutions.com/web-portfolio.html</loc></url>
```

### 🔴 Meta Description Missing on 5 of 6 Pages
**Affected:** `360-assessment.html`, `cloud-migration.html`, `office-setup.html`, `sms-gateway.html`, `web-portfolio.html`  
**Issue:** No `<meta name="description">` tag. Google will auto-generate a snippet from page body, which is usually poor quality and hurts CTR in search results.  
**Fix (example for each page):**
```html
<!-- sms-gateway.html -->
<meta name="description" content="How Merkei Solutions re-engineered a global SMS delivery infrastructure using Jasmin SMS and Docker, achieving 3x higher throughput for financial institutions.">

<!-- 360-assessment.html -->
<meta name="description" content="Merkei Solutions architected a high-availability 360-degree assessment platform with Cloudflare Zero Trust and Nginx, handling thousands of concurrent users securely.">
```

### 🟠 No Open Graph (OG) or Twitter Card Meta Tags on Any Page
**Affects:** All 6 pages  
**Issue:** When the site URL is shared on LinkedIn, WhatsApp, Twitter/X, or Slack, no rich preview (title, image, description) is generated. This is critical for a B2B professional services site.  
**Note:** You already have `images/og-banner.jpg` (197KB) — it just isn't referenced anywhere.  
**Fix (add to all pages):**
```html
<meta property="og:title" content="Merkei Solutions | Enterprise Cloud & Infrastructure">
<meta property="og:description" content="Strategic Multicloud Architecting, Secure Messaging Gateways, and High-Availability Systems.">
<meta property="og:image" content="https://merkeisolutions.com/images/og-banner.jpg">
<meta property="og:url" content="https://merkeisolutions.com/">
<meta property="og:type" content="website">
<meta name="twitter:card" content="summary_large_image">
```

### 🟠 No Canonical Tags
**Affects:** All 6 pages  
**Issue:** Without `<link rel="canonical">`, if the site is accessible via both `www.` and non-`www.`, or HTTP and HTTPS, Google may index duplicate pages and split ranking signals.  
**Fix (add to each page):**
```html
<link rel="canonical" href="https://merkeisolutions.com/">
<!-- or per-page: https://merkeisolutions.com/sms-gateway.html etc. -->
```

### 🟡 No Favicon
**Affects:** All pages  
**Issue:** No `<link rel="icon">` tag. Browser tabs show a blank/default icon, reducing brand recognition.  
**Fix:** Add a 32x32 PNG or SVG favicon and link it:
```html
<link rel="icon" type="image/png" href="/images/favicon.png">
```

### 🟡 No Structured Data (JSON-LD / schema.org)
**Issue:** No structured data means Google cannot generate rich results (e.g., sitelinks, organization info, breadcrumbs). For a services company, `Organization` and `BreadcrumbList` schemas are high-value.  
**Fix (add to index.html `<head>`):**
```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "Merkei Solutions",
  "url": "https://merkeisolutions.com",
  "logo": "https://merkeisolutions.com/images/og-banner.jpg",
  "contactPoint": {
    "@type": "ContactPoint",
    "contactType": "Customer Support",
    "email": "info@merkeisolutions.com"
  }
}
</script>
```

---

## 3. Accessibility (a11y) Audit

### 🟠 Contact Form Inputs Missing `<label>` Elements
**File:** `index.html` — Lines 222–224  
**Issue:** Form uses `placeholder` only. Screen readers don't reliably read placeholders as labels; when a user starts typing, the placeholder disappears, leaving no visible label.  
**Fix:**
```html
<label for="name" style="display:block; margin-bottom:6px; color:#aaa;">Full Name</label>
<input id="name" type="text" name="name" placeholder="Full Name" required>
```

### 🟠 No ARIA Labels or Roles
**Affects:** All pages  
**Issue:** No `aria-label`, `aria-labelledby`, `role`, or `aria-describedby` attributes anywhere. Navigation, sections, and interactive elements have no semantic accessibility hints.  
**Fix (examples):**
```html
<nav aria-label="Main navigation">
<a href="https://wa.me/..." class="whatsapp" aria-label="Contact us on WhatsApp">
<section id="services" aria-labelledby="services-heading">
```

### 🟡 Mobile Navigation Hidden With No Alternative
**File:** `index.html` — Line 74 (media query)  
**Issue:** At ≤992px, `.nav-links { display: none; }` with zero hamburger menu or mobile nav replacement. Mobile users (likely 50%+ of visitors) have NO navigation at all.  
**Fix:** Implement a hamburger toggle:
```html
<button class="nav-toggle" aria-label="Toggle navigation" aria-expanded="false">☰</button>
```
With JS to toggle a `.nav-open` class and CSS for the mobile menu.

### 🟡 Heading Hierarchy Skip in `index.html`
**Issue:** Services section uses `<h3>` headings directly under an `<h1>`, skipping `<h2>` level (the section itself has no heading tag). Screen readers and SEO crawlers expect a logical `h1 → h2 → h3` hierarchy.  
**Fix:** Add a visually styled (or visually hidden) `<h2>` for the services section:
```html
<h2 id="services-heading">Our Services</h2>
```

### 🟢 No `lang` attribute issues
**Pass:** All pages correctly have `<html lang="en">`. ✅

---

## 4. Performance Audit

### 🟠 Render-Blocking CSS — No Preconnect Hints
**Affects:** All 6 pages  
**Issue:** Google Fonts and Font Awesome are render-blocking. There are no `<link rel="preconnect">` hints to initiate DNS/TCP connections early, adding ~200–400ms of latency.  
**Fix (add before other `<link>` tags):**
```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="preconnect" href="https://cdnjs.cloudflare.com">
```

### 🟠 Font Awesome Full Bundle Loaded — No Tree-Shaking
**Affects:** All 6 pages  
**Issue:** Full Font Awesome CSS (~60KB gzipped) is loaded on every page, even sub-pages like `sms-gateway.html` that use only 1–2 icons. This is dead weight on every page load.  
**Fix options:**
- Use Font Awesome's Kit (auto-treeshakes), or
- Self-host only the specific icon SVGs needed per page, or
- On sub-pages where only the back-arrow icon is used, inline the SVG directly

### 🟡 Massive CSS Duplication Across Sub-Pages
**Affects:** 5 sub-pages (360-assessment, cloud-migration, office-setup, sms-gateway, web-portfolio)  
**Issue:** Every case-study page has a full `<style>` block with ~30 identical CSS rules copied verbatim. Total duplicated CSS: ~5KB × 5 pages = 25KB of wasted transfer.  
**Fix:** Extract shared styles to a single `styles.css` file and link it from all pages:
```html
<link rel="stylesheet" href="/styles.css">
```

### 🟡 OG Image Not Optimized for Web
**File:** `images/og-banner.jpg`  
**Issue:** OG image is 197KB. The recommended size for OG images is under 100KB (ideally ~50KB). When shared on social, this large image slows preview loading.  
**Fix:** Re-export at 1200×630px with ~80% quality JPEG. Target ≤80KB.

### 🟢 No Large JavaScript Bundles
**Pass:** No JavaScript frameworks or large scripts used — pure HTML/CSS. This is a significant performance strength. ✅

### 🟢 All File Sizes are Reasonable
**Pass:** HTML files range from 2KB–16KB, well within acceptable limits. ✅

---

## 5. Code Quality & DRY Audit

### 🟠 No Shared Component System
**Issue:** Nav, footer, and `<head>` metadata are copy-pasted into every HTML file. Any global change (e.g., updating the nav, adding a new link, fixing the WhatsApp number) must be made in 6 separate files — violating DRY principles and creating maintenance risk.  
**Fix options (in order of preference for your stack):**
1. **Cloudflare Workers / Edge-side includes** — most compatible with static hosting
2. **Simple Python/Node static site generator** (e.g., Jinja2 templates)
3. **Eleventy (11ty)** — zero-JS static site generator, minimal config

### 🟡 Sinhala-Language Comments Left in Production Code
**File:** `360-assessment.html` — Lines 17–19; `sms-gateway.html` — Lines 17–18  
**Issue:** Development comments in Sinhala (`/* --- මවුස් එක Type කරන ඉර...---*/`) are shipped to production. While harmless, they add bytes and expose internal development notes.  
**Fix:** Strip all comments before deployment via a minifier, or remove manually.

### 🟢 Consistent Design System
**Pass:** CSS variables (`--primary`, `--secondary`, `--bg`, `--border`) are well-defined and used consistently across all pages. ✅

### 🟢 No JavaScript Errors Detected
**Pass:** No inline `onclick`, `onerror`, or problematic JS patterns found. ✅

---

## 6. Cross-Page Consistency Audit

### 🟠 Sub-Page Navigation is Stripped Down (No Full Nav)
**Affects:** All 5 case-study pages  
**Issue:** Sub-pages have a minimal nav (logo only). Users who land on a case-study page from Google have no way to navigate to other sections (Services, Contact). This kills the conversion funnel for organic traffic.  
**Fix:** Add full nav links to sub-pages, or at minimum add a "Contact Us" CTA button in the nav.

### 🟡 WhatsApp Button Missing from Sub-Pages
**Issue:** The floating WhatsApp contact button only exists on `index.html`. Case study pages have no quick contact method.  
**Fix:** Add the WhatsApp widget to all sub-pages (part of the shared template fix above).

### 🟡 Footer Inconsistency
**Issue:** `index.html` footer includes `"Strategically Designed by Vinod Lakmal."` but sub-pages don't. Minor but inconsistent.

---

## 7. Summary Score

| Category | Score | Status |
|---|---|---|
| Security | 55/100 | 🔴 Needs immediate attention |
| SEO | 40/100 | 🔴 Critical gaps |
| Accessibility | 45/100 | 🟠 Significant gaps |
| Performance | 65/100 | 🟡 Improvable |
| Code Quality | 60/100 | 🟡 DRY violations |
| Consistency | 55/100 | 🟡 Sub-page UX gaps |
| **Overall** | **53/100** | **🟠 Needs Work** |

---

## 8. Priority Fix Checklist (Recommended Order)

| # | Fix | Effort | Impact |
|---|---|---|---|
| 1 | Add `rel="noopener noreferrer"` to WhatsApp link | 2 min | 🔴 Security |
| 2 | Restrict Web3Forms key by domain + enable captcha | 5 min | 🔴 Security |
| 3 | Add meta descriptions to all 5 sub-pages | 15 min | 🔴 SEO |
| 4 | Update sitemap with all 6 page URLs | 10 min | 🔴 SEO |
| 5 | Add OG/Twitter meta tags sitewide | 20 min | 🟠 SEO/Sharing |
| 6 | Add `rel="canonical"` to all pages | 10 min | 🟠 SEO |
| 7 | Add full navigation to sub-pages | 20 min | 🟠 UX/Conversion |
| 8 | Implement mobile hamburger menu | 30 min | 🟠 UX |
| 9 | Add preconnect hints for Google Fonts & FA | 5 min | 🟠 Performance |
| 10 | Add SRI integrity hashes to CDN assets | 15 min | 🟠 Security |
| 11 | Add `<label>` to contact form inputs | 10 min | 🟡 Accessibility |
| 12 | Add ARIA labels to nav and interactive elements | 20 min | 🟡 Accessibility |
| 13 | Extract shared CSS to `styles.css` | 30 min | 🟡 Maintenance |
| 14 | Add `robots.txt` | 5 min | 🟡 SEO/Security |
| 15 | Add favicon | 10 min | 🟡 Branding |
| 16 | Add JSON-LD structured data to index | 15 min | 🟡 SEO |
| 17 | Delete/block `index_backup.html` | 2 min | 🟡 Security |
| 18 | Optimize `og-banner.jpg` to <80KB | 5 min | 🟡 Performance |
| 19 | Add Nginx security headers (server config) | 20 min | 🟡 Security |
| 20 | Remove Sinhala dev comments from prod code | 5 min | 🟢 Cleanliness |

---

*Report generated by automated static analysis. Dynamic rendering, live API responses, and server-level config (Nginx, Cloudflare) were not tested in this scan.*
