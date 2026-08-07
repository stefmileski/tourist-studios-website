# Tourist Studios — touriststudios.com.au

Next.js 14 + Sanity CMS + Vercel. Production company website.

---

## Stack

| Layer | Tech |
|-------|------|
| Framework | Next.js 14 (App Router) |
| CMS | Sanity v3 (embedded studio at /studio) |
| Hosting | Vercel (free tier) |
| Forms | Formspree |
| Domain | touriststudios.com.au |

---

## Deploy in 6 steps

### 1. Push to GitHub
```bash
git init
git add .
git commit -m "init"
# Create a repo at github.com, then:
git remote add origin https://github.com/YOUR_USERNAME/tourist-studios.git
git push -u origin main
```

### 2. Create a Sanity project
1. Go to [sanity.io](https://sanity.io) → Create account (free)
2. Create a new project — name it "Tourist Studios"
3. Copy your **Project ID** from the project dashboard

### 3. Configure environment variables
```bash
cp .env.local.example .env.local
# Edit .env.local and paste your Sanity Project ID
```

### 4. Deploy to Vercel
1. Go to [vercel.com](https://vercel.com) → Import Git Repository
2. Select your `tourist-studios` repo
3. Add environment variables:
   - `NEXT_PUBLIC_SANITY_PROJECT_ID` = your Sanity project ID
   - `NEXT_PUBLIC_SANITY_DATASET` = `production`
4. Click Deploy

### 5. Connect your domain
1. In Vercel: Settings → Domains → Add `touriststudios.com.au`
2. Vercel will give you DNS records
3. In your domain registrar (auDA/Porkbun): point DNS to Vercel

### 6. Set up Formspree (contact form)
1. Go to [formspree.io](https://formspree.io) → Create account (free)
2. Create a new form
3. Copy the form ID (looks like `xabc1234`)
4. In `src/app/contact/page.tsx`, replace `YOUR_FORMSPREE_ID` with your ID

---

## Content management

Once deployed, go to `touriststudios.com.au/studio` to manage:

- **Projects** — add/edit work, upload images, add Vimeo links
- **Journal** — write blog posts with rich text
- **Settings** — update tagline, contact info, social links

You'll need to add your Vercel domain to Sanity's CORS origins:
→ sanity.io → your project → API → CORS Origins → Add `https://touriststudios.com.au`

---

## Local development

```bash
npm install
cp .env.local.example .env.local
# Add your Sanity project ID to .env.local
npm run dev
# → http://localhost:3000
# → http://localhost:3000/studio (CMS)
```

---

## Adding a password-protected client area

Vercel supports password protection natively on Pro plans ($20/mo).
Alternative: use Next.js middleware with a simple env-var password.

To add it, create `src/middleware.ts`:

```ts
import { NextRequest, NextResponse } from 'next/server'

export function middleware(req: NextRequest) {
  if (req.nextUrl.pathname.startsWith('/client')) {
    const auth = req.cookies.get('client-auth')?.value
    if (auth !== process.env.CLIENT_PASSWORD) {
      return NextResponse.redirect(new URL('/client/login', req.url))
    }
  }
}
```

---

## File structure

```
tourist-studios/
├── src/
│   ├── app/
│   │   ├── page.tsx          ← Homepage (ledger layout)
│   │   ├── work/
│   │   │   ├── page.tsx      ← Work grid
│   │   │   └── [slug]/       ← Project detail
│   │   ├── about/page.tsx
│   │   ├── contact/page.tsx  ← Formspree form
│   │   ├── blog/page.tsx
│   │   └── studio/           ← Sanity CMS (embedded)
│   ├── components/
│   │   ├── Nav.tsx
│   │   ├── Footer.tsx
│   │   └── Wordmark.tsx      ← Custom SVG wordmark
│   ├── lib/sanity.ts         ← Sanity client + queries
│   └── styles/globals.css    ← Design tokens
├── sanity/
│   ├── schemas/project.ts    ← Project content type
│   └── schemas/index.ts      ← Post + Settings types
├── sanity.config.ts          ← CMS configuration
└── .env.local.example        ← Environment variable template
```
