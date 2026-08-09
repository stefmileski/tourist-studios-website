# Sanity Cleanup — 2026-08-09

Dataset: `ds1crfa4:production`

## What was done

Removed 93 duplicate/placeholder `project` documents, keeping exactly the 81
originals imported in the master-list batches of 2026-08-06 13:48:15 / 13:48:44 /
13:49:15 UTC.

Selection criterion (verified to match exactly 93 docs before deletion):

```groq
*[_type == "project" && _createdAt < "2026-08-06T13:40:00Z"]
```

### Deleted (93 total)

| Group | Count | Notes |
|---|---|---|
| Fake placeholder projects (created 2026-08-06 12:59–13:01 UTC) | 80 | Generic titles ("Commercial Break", "Fashion Forward 2023", …) with dummy Vimeo URLs (`8562xxxxx`), incl. 9 drafts |
| First partial import (created 2026-08-06 13:30:55 UTC) | 11 | Marcs / David Lawrence work re-imported later in the master batches, incl. 1 draft |
| Stale draft "Lustre Documentary" (2026-05-23) | 1 | No video URL; superseded content |
| "Three Women Arrive (2016)" (2026-06-10) | 1 | Re-imported in master batch as `three-women-arrive-film-2016` |

### Data preserved before deletion

Three keepers (`dl-hs22-october-v5-16x9`, `dl-hs22-november-v1-16x9`,
`dl-hs22-december-v1-16x9`) had `vimeoId` but no `vimeoUrl`; their URLs were
copied from the deleted 13:30:55 duplicates and published:

- october → https://vimeo.com/1198618192
- november → https://vimeo.com/1198618219
- december → https://vimeo.com/1198618233

Full JSON of the 13 non-placeholder deleted documents is in
`scripts/backup/deleted-projects-backup.json`.

## Final state (verified post-cleanup)

- Total `project` documents: **81** (81 published, 0 drafts)
- Documents missing both `videoUrl` and `vimeoUrl`: **0**
- Unique slugs: **78**

## Known follow-up

Three slug pairs within the kept 81 share a slug (they came in that way in the
master import) and will collide on the same detail-page URL:

- `daniel-boyd-studio-visit-treasure-island-kukje-gallery` (×2)
- `summer-night-walks-wendy-whiteley` (×2)
- `a-romance-story-featured-artist-samuel-hodge` (×2)

Decide whether these are true duplicates (delete one of each, → 78 projects) or
distinct films needing distinct slugs.
