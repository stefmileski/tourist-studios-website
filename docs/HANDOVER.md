# Tourist Studios — Website Handover

**Last updated:** 22 August 2026
**Scope:** stack, content model, conventions, and the real state of the homepage rotation feature.

> **About this revision.** An earlier handover was written without access to this
> repository, so its front-end claims were inferred rather than read. Several were
> wrong in ways that would have cost the next person real time — most of a day, if
> they trusted §6 and started building a feature that already exists.
>
> Every fact below was checked against the code in this repo, a real `next build`,
> the live `production` dataset, or the Vercel API. Where something could not be
> verified, it says so. **§10 lists what changed from the previous revision and why**,
> so anyone holding the old copy can see exactly which of its claims to discard.

---

## 1. Stack

| | |
| :-- | :-- |
| Repo | `stefmileski/tourist-studios-website` |
| Framework | **Next.js 15.5.18, App Router**, React 18, TypeScript |
| Host | Vercel — project `prj_pqzye3wPPz6NqUfiSMatRLJ0chEt` (`tourist-studios-selects`), team `team_UHrdV2YRzfkFGAUMHKl7wgze`, Node 24.x |
| Domains | `touriststudios.com.au`, `www.touriststudios.com.au` |
| CMS | Sanity v3, project `ds1crfa4`, dataset `production`, embedded Studio at `/studio` |
| Styling | CSS Modules + a `:root` token block generated from Sanity Settings |
| Video | Vimeo embeds; oEmbed for poster frames (`src/lib/vimeo.ts`) |

### The framework-preset thing — resolved

The Vercel **project setting** really is `framework: null` (confirmed via the API).
That sounds alarming and the previous handover flagged it as a reason to distrust
any assumption that this is a Next.js app.

It isn't a problem: **`vercel.json` pins `{"framework": "nextjs"}`**, and a
`vercel.json` value overrides the dashboard setting at build time. The app builds
and deploys as Next.js. Treat it as a Next.js app, because it is one.

Worth tidying anyway — setting the preset in the dashboard to match would remove a
booby trap for the next person who reads the project settings and panics.

---

## 2. Content model

### `project` — the film entries. This is the only type the site renders.

122 published documents. Schema: `sanity/schemas/project.ts`.

| Field | Type | Notes |
| :-- | :-- | :-- |
| `title` | string, required | Display title. Preserves non-ASCII (see §4). |
| `slug.current` | slug, required | URL segment. Unique across all 122. |
| `year` | number, required (1990–2030) | **Production year**, not campaign year. See §4. |
| `category` | string, required | Studio dropdown, 14 options. See §3. |
| `client` | string | Client or artist name. |
| `videoUrl` | url | Vimeo URL **including the privacy hash**. See the split below. |
| `vimeoUrl` | url | Legacy field. Same meaning as `videoUrl`. See the split below. |
| `vimeoId` | string | Legacy. Numeric ID, no hash. Not used for playback. |
| `description` | text | Shown on the film detail page. |
| `heroImage` / `gallery` | image / image[] | Present in schema; the homepage and archive use Vimeo poster frames instead, so these are largely unused. |
| `services` | string[] | Per-film tags. |
| `featured` | boolean | Puts a film at the front of the homepage queue. 7 are `true`. |
| `homepageOrder` | number | Manual position among featured films. **Set on 0 of 122 documents**, so it currently does nothing — featured films fall back to newest-year order. Hidden in the Studio unless `featured` is ticked. |

#### ⚠️ The two-URL split — read this before touching film URLs

The site resolves a film's video with `coalesce(videoUrl, vimeoUrl)`. Both fields
are live, and the data is split across them:

| | Count |
| :-- | :-- |
| Films with `vimeoUrl` (legacy) populated | **122 / 122** |
| Films with `videoUrl` populated | **29 / 122** |
| Films where `videoUrl` is empty and only `vimeoUrl` carries the URL | **93 / 122** |

Until August 2026 the Studio schema exposed **only** `videoUrl`, and marked it
required. For those 93 films that meant the Studio showed an empty, validation-failing
"Vimeo URL" field while the actual working URL sat in a field nobody could see. The
front end kept working because of the `coalesce`, so nothing looked broken — but
anyone opening one of those films in the Studio to fix the "missing" URL would have
been pasting a second URL in alongside an invisible one.

**Fixed in this revision:** both fields are now visible in the Studio, the
"one of these is required" rule moved to document level, and both fields validate the
Vimeo URL shape (with a warning when the privacy hash is missing — see §4.3).

**Still outstanding:** the data is still split. The clean end state is to copy
`vimeoUrl` → `videoUrl` on all 93, then retire the legacy fields. That is a
93-document migration on live content and was deliberately **not** done here — it
needs a decision and a backup, not a drive-by. See §7.

### `film` — dead type, and the reason the last handover was wrong

There are **zero** `film` documents, and `film` is not registered in
`sanity.config.ts`, so nothing in the Studio or the site references it.

The catch: the **deployed schema artifact** in the dataset (`_.schemas.default`)
contains *only* `film` — not `project`, not `post`, not `settings`. It is a stale
snapshot from an abandoned first draft of the model.

This matters more than it looks. The Studio reads its schema from `sanity.config.ts`
in this repo, so the Studio is fine. But anything that asks Sanity for the *deployed*
schema — the Sanity MCP server's `get_schema`, and therefore any AI agent or tool
pointed at this dataset — is told the content model is `film`, with fields like
`genre`, `credits[]`, `duration` and `published` that exist nowhere in the real site.
That is precisely how the previous handover ended up describing `project` using
`film`'s field list.

**Fixed (Aug 2026).** The real `project` / `post` / `settings` model has been
deployed, so `get_schema` now reports the content model the site actually uses.
`film` could not be deleted — the deployed-schema record supports adding and
overwriting types but not removing them — so it has been overwritten with a
one-field stub whose description says plainly that it is dead and points at
`project`. Its original field definitions survive in the read-only legacy record
`_.schemas.default` if they are ever wanted.

**Two caveats worth knowing before you touch this again:**

1. **`npx sanity schema deploy` will not do what you expect here.** This workspace
   is *MCP-managed*, and once it is, a schema deployed to the same workspace name
   via the CLI is **not** selected by the default resolver — the MCP-managed record
   keeps winning. So a CLI deploy can appear to succeed while `get_schema` goes on
   reporting the older record. Use `list_workspace_schemas` to see every record and
   read them by exact `schemaId` before concluding anything. (An earlier revision of
   this document recommended the plain CLI deploy; that advice was incomplete.)

2. **The deployed artifact is hand-transcribed, so it can drift from source.**
   The deployment format takes literal declarations only, so the `validation` and
   `hidden` functions in `sanity/schemas/project.ts` are *not* represented in it.
   The artifact describes the shape of the content for tooling; it does not enforce
   anything, and the Studio's real rules still live in the repo. **`sanity/schemas/`
   remains the source of truth** — if you change a field there, the deployed artifact
   does not follow automatically.

### `settings` — singleton, `_id: "settings"`

Homepage/About/Contact copy, `services[]`, social links, and four colour fields
(`colorInk`, `colorCream`, `colorAccent`, `colorMid`). Consumed by `buildThemeCSS()`
in `src/lib/sanity.ts`, which emits the `:root` custom-property block.

Only `colorAccent` and `colorMid` are set; `colorInk` and `colorCream` are `null` and
fall back to the brand defaults in code. See §5 for the colour bug that was fixed.

### `post` — 1 document, rendered at `/blog`.

---

## 3. Categories

The schema defines a Studio dropdown of 14 values. 13 are in use:

`Architecture/Design` · `Art/Cultural` · `Automotive/TVC` · `Branded` · `Comedy` ·
`Documentary` · `Event/Sport` · `Fashion` · `Lifestyle/Editorial` · `Music/Art` ·
`Music/Branded` · `Narrative` · `Product`

`Commercial/Brand` is defined in the dropdown but used by no film.

`options.list` constrains the Studio dropdown but is **not** enforced by the API, so a
value written directly through the API or MCP can still be anything. A fourteenth
value won't error — it will just create an orphan filter bucket on `/work`.

---

## 4. Conventions — follow these

1. **Years are production years.** A campaign named "Resort 2018" or "Spring 2017"
   shot the previous year carries the **shoot** year. Decided in Aug 2026 and applied
   across the dataset. Several titles therefore visibly disagree with their year
   (e.g. *David Jones Spring 2017 Everything Under The Sun* → 2016). That is intended.
   If it reads badly, rename the title — do **not** re-date the entry.

2. **The canonical source for years is `complete_chronological_portfolio.md`**
   (Motel Picture Company master list, owner's Google Drive) — not whatever is live.

3. **Vimeo URLs must carry the privacy hash.** Every film is unlisted.
   `https://vimeo.com/1220339255` 404s for visitors;
   `https://vimeo.com/1220339255/c8b914e540` plays. All 122 currently comply.
   The Studio now warns on a hash-less URL rather than blocking it, so a genuinely
   public video can still be saved on purpose.

4. **Slugs drop apostrophes, they do not hyphenate them.** `the-gardeners-eye`, not
   `the-gardener-s-eye`. `&` becomes `and`. Non-ASCII letters are folded
   (`Yunupiŋu` → `yunupingu`).

5. **Titles preserve non-ASCII characters.** The slug folds them; the title must not.
   e.g. **Nyapanyapa Yunupiŋu** with the eng.

6. **Sanity writes land in drafts.** `patch_documents` and `create_documents` both
   write to `drafts.*`. Nothing is live until `publish_documents` runs. Verify with
   `perspective: "published"` — a `raw` query includes drafts and will give you a
   false positive.

---

## 5. Fixed in this revision

### `colorMid` was silently failing — and the obvious fix would have made it worse

`colorMid` was stored as `"3E0400"`, missing its leading `#`. `buildThemeCSS()`
interpolated it straight into the token block, emitting `--mid:3E0400`. That is
invalid CSS: the declaration fails at substitution time, `color` resolves to `unset`,
and because `color` inherits, every muted label rendered **cream — identical to body
text**. The muted hierarchy was gone, but nothing looked broken.

`--mid` is used for the footer labels, the About column heads, blog meta, and the
scrollbar thumb — all of them on the near-black `--ink` (`#0E0C0A`) background.

Here is the trap. Normalising the hex *on its own* would have made things worse, not
better, because the stored value is unreadable on that background:

| Value | vs `--ink` | |
| :-- | :-- | :-- |
| `#3E0400` — what was stored | **1.14 : 1** | invisible |
| `#6B6560` — the field's documented default | 3.40 : 1 | fine for small caps labels |

So `3E0400` is a brand red that was pasted into a field titled *"Muted Text"* whose own
description reads `e.g. #6B6560`. Shipping the code fix alone would have taken the
footer from "wrong colour but readable" to "text you cannot see".

Both halves were fixed together:

- **Code** (`src/lib/sanity.ts`): a `normalizeHex()` helper now tolerates a missing
  `#`, shorthand, and stray whitespace, and falls back to the brand default for
  anything that isn't a valid hex — so junk can never reach the stylesheet again.
- **Content**: `settings.colorMid` set to `#6B6560` and published.

**Verified live.** The production render now emits
`--mid:#6B6560` as valid hex, sourced from Sanity (production also shows
`--crimson:#900008`, the live accent, confirming the settings fetch is reaching the
CMS). The muted hierarchy is back and readable.

**Related, not changed:** `colorAccent` is `#900008`, which is **2.04 : 1** against
`--ink`. That is fine for the hover states and rules it drives, but it would fail
badly for anything text-sized. Worth a designer's eye before it gets reused.

### ⚠️ Preview deployments do not reach Sanity — don't review content on them

Comparing a PR preview against production on the same commit:

| | Preview deploy | Production |
| :-- | :-- | :-- |
| `--crimson` | `#3E0306` (code default) | `#900008` (live Sanity value) |
| Footer location | `Bondi, Sydney NSW` (hardcoded fallback) | `Sydney NSW` (from the CMS) |
| Footer socials | `https://instagram.com/...` (fallback) | `http://instagram.com/...` (from the CMS) |

Production reads Sanity correctly. **Preview deployments do not** — the settings fetch
returns nothing and every page silently renders the code fallbacks, because
`RootLayout` wraps the fetch in `.catch(() => null)` and each consumer has its own
`||` default. Nothing errors; the site just quietly stops being CMS-driven.

The likely cause is that `NEXT_PUBLIC_SANITY_PROJECT_ID` / `NEXT_PUBLIC_SANITY_DATASET`
are not scoped to Vercel's **Preview** environment, so the client falls back to the
`'your-project-id'` placeholder in `src/lib/sanity.ts` and every request 404s.
*(Cause inferred from the rendered output — the environment-variable scoping itself was
not inspected.)*

**Why it matters:** a reviewer checking a PR preview for a content or theme change sees
stale fallback values and concludes the change didn't work. Scope those two variables to
Preview as well as Production, and consider logging the fetch failure instead of
swallowing it — a silent `catch` is what let this sit unnoticed.

### Dead root `middleware.ts` removed

The repo carried **two** middleware files implementing **two different** password gates:

| | |
| :-- | :-- |
| `middleware.ts` (root) | HTTP Basic Auth, driven by `AUTH_ENABLED` / `AUTH_USERNAME` / `AUTH_PASSWORD` |
| `src/middleware.ts` | Cookie gate + `/unlock` page, driven by `SITE_PASSWORD` |

Next.js resolves middleware from `src/` when a `src/` directory exists, so the root
file **was never compiled and never ran** — confirmed against a real build: the
middleware manifest lists only `server/src/middleware.js`, and the root file's
Basic-Auth strings appear nowhere in the output.

It was actively misleading: it documented three environment variables that do nothing,
and its own header comment said *"Remove or rename this file to disable password
protection at launch"* — which would have had no effect at all. Deleted.

**The gate that actually exists** is `src/middleware.ts`. It redirects everything to
`/unlock` while `SITE_PASSWORD` is set, and stores a SHA-256 hash of the password in
the `ts_gate` cookie. To open the site at launch, **unset `SITE_PASSWORD` in Vercel
and redeploy.** Nothing else is required.

### Studio schema now matches the data

See §2 — both Vimeo URL fields are visible, the required-field rule moved to document
level, and URL shape/hash validation was added. Verified against all 122 published
films: every existing URL passes both rules, so the change introduces no false errors
in the Studio.

---

## 6. Homepage rotation — **already built**

The previous handover specified this as a feature to build, weighed three
implementation options, and recommended one. **It already exists**, and has since
before that document was written. Do not build it again.

### What is actually there

**`src/app/page.tsx`** (server component, `export const revalidate = 60`) picks the
pool: featured films first — ordered by `homepageOrder` when set, then newest year —
topped up with the newest non-featured films, to `1 + 12 = 13` films. Each is enriched
with a Vimeo poster frame and two player URLs (360p for tiles, 720p for the hero).

**`src/app/home-showcase.tsx`** (client component) runs the rotation:

- The hero walks the 13-film pool in order and wraps.
- The **starting index is random, chosen in a `useEffect` after mount** — so the
  server and first client render agree and there is no hydration mismatch.
- Each film holds for **15s**. The next is mounted and buffering **3s** early,
  hidden off-screen, then slides in over **900ms** — so the transition reveals a
  stream that is already rolling rather than a black frame.
- Films sharing the same video URL are de-duplicated, so a duplicated entry can't
  take two turns.
- The 12 tiles below the hero are **static**, in pool order.

### Where the old spec was wrong

- **"If the homepage is statically generated, a random selection executes once per
  deploy and freezes."** Doesn't apply. The randomness is client-side, after
  hydration — it re-rolls on every page load regardless of how the page is cached.
  (The page is ISR with a 60s revalidate in any case.)
- **"Only 7 documents are featured — rotating 7 items is imperceptible."** The
  rotation pool is **13**, not 7: the 7 featured films topped up with the 6 newest
  others.
- **"Pin the hero, shuffle the tiles below it."** The implementation does the
  opposite — the hero rotates, the tiles are fixed. That is a design decision already
  taken and shipped, not an oversight. It was left alone.

### If you do want to change it

The genuinely open questions, now that the mechanism exists:

- **Widen the pool.** 13 of 122 films rotate. With the Roslyn Oxley9 / Biennale /
  Sydney Dance Company work now live, raising `SHOWCASE_COUNT` in `page.tsx` is a
  one-line change — but each film mounts a player, so watch the initial load.
- **Use `homepageOrder`.** The field, the Studio control and the sort are all built
  and working, and it is set on **zero** documents. Setting it on the 7 featured films
  is pure content work and needs no code.
- **Day-seeded ordering** (the old §C) is still a reasonable idea for the *tiles*, which
  never vary. It would need to be seeded identically on server and client, or done in
  a `useEffect` like the hero.

---

## 7. Open items

| Item | Detail |
| :-- | :-- |
| **~~Redeploy the Sanity schema~~ — done** | The real model is deployed; `film` is now a signposted stub. Note the workspace is MCP-managed, so CLI deploys are not picked up by default resolution, and the artifact is hand-transcribed and can drift from `sanity/schemas/`. See §2. |
| **Finish the URL migration** | Copy `vimeoUrl` → `videoUrl` on the 93 films that lack it, then retire `vimeoUrl` / `vimeoId` from schema and queries. 93 live documents — take a backup first. |
| **3 films not on the site** | *UTS: Sidney McMahon, Maggot* · *Rae Begley, On a Quiet Day* · *Shadow Catchers, Together In Art (AGNSW)*. Uploaded to Vimeo and correctly titled. `year` is required and none appear in the master list, so no entry was created. **Needs three years from the owner.** |
| **Year conflicts** | Volvo XC60 (site 2017 / master 2023), Maia Financial (2019 / 2024), The Listeners – Yamaha (2019 / 2024), Train With Us – City2Surf (2017 / 2021). Gaps of 5–6 years; one source is badly wrong. Needs invoice evidence, not a guess. |
| **Orphan draft** | `drafts.d9e8b810-6e1f-42be-89d9-8d4c5f61381e` — *"Dion Lee Resort 17 Film 2016 2"*, an unpublished duplicate. Still present; it is the dataset's only draft. Safe to delete. |
| **SOL duplication** | The master list has three SOL entries (2016, 2017, and "SOL (with Meg Breaker)" 2017). The site has one, dated 2016. Either the master doc has phantom rows, or one or two SARAH & SEBASTIAN films are missing. |
| **~12 unaccounted Vimeo videos** | The Vimeo account holds 139 videos; 122 are on the site. Worth an audit. *(Vimeo account not accessible from this repo — carried over from the previous handover, unverified.)* |
| **`colorAccent` contrast** | `#900008` is 2.04:1 on `--ink`. Fine for hovers and rules, unusable for text. Flag before reuse. |
| **Preview deploys ignore the CMS** | Preview renders code fallbacks instead of Sanity content; production is fine. Scope the `NEXT_PUBLIC_SANITY_*` vars to Preview. See §5 — previews are not trustworthy for reviewing content changes until this is fixed. |
| **Insecure social URLs** | `settings.instagram` and `settings.vimeo` are stored as `http://`, not `https://`. They redirect, but should be corrected in the Studio. |
| **README is stale** | Claims Next.js 14 (it's 15.5), describes a Formspree contact form (there is a `ContactForm.tsx` + `/api/unlock` route instead), and its "add a password-protected client area" section tells you to create `src/middleware.ts` — which already exists doing something else entirely. |
| **Vercel framework preset** | Dashboard says `null`; `vercel.json` pins `nextjs` so builds are correct. Set the dashboard to match to remove the confusion. |
| **Launch blocker** | **Unset `SITE_PASSWORD` in Vercel and redeploy.** That is the only gate. |

### One thing the last handover got wrong in the safe direction

It listed "**`robots.txt` blocks crawlers**" as a launch blocker alongside the password
gate. It doesn't. `src/app/robots.ts` returns `allow: '/'` and disallows only
`/studio`, `/unlock` and `/api/`, and points at a real sitemap. The middleware matcher
deliberately lets `robots.txt` and `sitemap.xml` through the gate.

The site genuinely isn't indexable today, but that is *entirely* the password gate
redirecting every content page to `/unlock`. Remove `SITE_PASSWORD` and indexing works.
**There is no second switch to find** — which is worth knowing, because looking for one
is how you end up "fixing" a `robots.ts` that was correct all along.

---

## 8. Useful GROQ

Run these with `perspective: "published"` unless noted. `raw` includes drafts.

```groq
// health check — every one of these should be 0
{
  "total":        count(*[_type=="project"]),
  "missingUrl":   count(*[_type=="project" && !defined(coalesce(videoUrl, vimeoUrl))]),
  "missingYear":  count(*[_type=="project" && !defined(year)]),
  "missingSlug":  count(*[_type=="project" && !defined(slug.current)]),

  // A film URL must be exactly https://vimeo.com/{id}/{hash} — which splits
  // into 5 segments on "/". See the warning below about the old version of
  // this check.
  "badUrlShape":  count(*[_type=="project" &&
                    (!string::startsWith(coalesce(videoUrl, vimeoUrl), "https://vimeo.com/")
                     || count(string::split(coalesce(videoUrl, vimeoUrl), "/")) != 5
                     || string::split(coalesce(videoUrl, vimeoUrl), "/")[4] == "")]),

  "dupSlugs":     count(*[_type=="project"].slug.current)
                  - count(array::unique(*[_type=="project"].slug.current)),
  "dupUrls":      count(*[_type=="project"].vimeoId)
                  - count(array::unique(*[_type=="project"].vimeoId))
}

// open drafts — must be run with perspective "raw", not "published"
count(*[_type=="project" && _id in path("drafts.**")])

// the featured pool
*[_type=="project" && featured==true] | order(homepageOrder asc, year desc)
  {title, client, year, category, homepageOrder, "url": coalesce(videoUrl, vimeoUrl)}

// the URL migration backlog — films whose URL lives only in the legacy field
*[_type=="project" && !defined(videoUrl)]{_id, title, vimeoUrl}

// work page, as rendered
*[_type=="project"] | order(year desc, title asc)
  {title, client, year, category, slug, "url": coalesce(videoUrl, vimeoUrl)}
```

> ⚠️ **Do not reuse the old `noHash` check.** The previous handover offered
> `count(*[_type=="project" && !(vimeoUrl match "*/*/*")])` as a test for the missing
> privacy hash. It does not work. GROQ's `match` is token-based, and
> `"https://vimeo.com/1220339255" match "*/*/*"` evaluates to **`true`** — a hash-less
> URL passes the "has a hash" test. That check reports `0` whether or not any hashes
> are missing. Use `badUrlShape` above, which was verified to detect the fault.
>
> The old check also read `vimeoUrl` directly rather than coalescing, so it silently
> ignored the 29 films that use `videoUrl`.

---

## 9. Running it locally

```bash
npm install
# .env.local
#   NEXT_PUBLIC_SANITY_PROJECT_ID=ds1crfa4
#   NEXT_PUBLIC_SANITY_DATASET=production
#   SITE_PASSWORD=            # leave unset to bypass the gate locally
npm run dev     # site at :3000, Studio at :3000/studio
npm run build   # verified clean on Next.js 15.5.18
```

The dataset is world-readable, so no Sanity token is needed for reads. Writes
(`patch_documents`, `publish_documents`) need credentials.

---

## 10. What changed from the previous revision

For anyone holding the old copy — these claims were wrong and are corrected above.

| Old claim | Reality |
| :-- | :-- |
| "Framework preset `null` — confirm before assuming Next.js" | `vercel.json` pins `nextjs`; it is a Next.js 15.5 App Router app. §1 |
| `project` has fields `vimeoId` + `vimeoUrl` | The schema's field is `videoUrl`; `vimeoUrl`/`vimeoId` are legacy and hold the data for 93 of 122 films. §2 |
| (no mention of `homepageOrder`) | The field exists and drives featured ordering — set on 0 documents. §2 |
| "`film` is present in the deployed schema" | True, and worse: the deployed schema contains **only** `film`, which is why the old field list was wrong. §2 |
| "Categories are not enforced by schema validation" | There is a 14-value Studio dropdown; it constrains the Studio but not the API. §3 |
| §6 homepage rotation, specified as work to be done | Already built and shipped. §6 |
| "Random selection freezes at build time" | Randomness is client-side post-hydration; re-rolls every load. §6 |
| "Only 7 featured — rotating 7 is imperceptible" | The pool is 13. §6 |
| "`robots.txt` blocks crawlers" — listed as a launch blocker | It doesn't. The password gate is the only blocker. §7 |
| Password gate is HTTP Basic Auth (`AUTH_ENABLED`) | That file never ran and has been deleted. The real gate is a cookie gate on `SITE_PASSWORD`. §5 |
| "`colorMid` may be silently failing — verify" | It was. Fixed — and the naive fix would have made the footer invisible. §5 |
| `noHash` health-check query | Broken; always reports 0. Replaced. §8 |
