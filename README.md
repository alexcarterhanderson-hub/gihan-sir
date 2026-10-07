# Science with Gihan — source project

Sinhala-first teacher profile with animated 3D science scenes, a live admin console, direct photo/video uploads, timetables, WhatsApp inquiries, YouTube lessons/playlists, photo zoom and a two-layer animated background mixer.

## What this project uses

React + Vinext (Next.js APIs), Tailwind, Framer Motion, Three.js, Cloudflare Workers and D1, with ImageKit for uploaded media. The code is not a static-only website: persistent uploads and admin editing need the Worker backend.

The full ZIP includes source, bundled artwork, `backup/content.json`, and every uploaded media file referenced by the published content at export time. `backup/manifest.json` records file types, sizes and SHA-256 hashes. Secrets, password hashes, sessions, dependencies and build output are excluded. This is a snapshot; future edits on the current hosted Site do not automatically sync into your separate deployment.

## Run locally on Windows

Install Node.js 22.13 or newer and pnpm. Extract this project and open its folder in PowerShell.

```powershell
npm install --global pnpm@11.25.0
pnpm install --frozen-lockfile
pnpm build
```

Create `.dev.vars` in the project root. Set your own admin password of at least 8 characters (16 or more is recommended) and add your ImageKit private key. The ImageKit endpoint is configured in `wrangler.standalone.json`; never put the private key in that file.

```dotenv
STANDALONE_ADMIN_PASSWORD="your-own-long-random-password"
SCIENCE_MEDIA="your-imagekit-private-key"
```

Then:

```powershell
node scripts/restore-backup.mjs --local --confirm
pnpm standalone:dev
```

Open the local address printed by Wrangler, normally http://localhost:8787. Local D1 persists in `.wrangler/state`; uploaded media is stored in your ImageKit account. Click the top logo five times quickly and enter the password you chose. No ChatGPT account is required for standalone mode. Never put this password into source or public config.

To start a blank database instead of restoring the included content, use `pnpm standalone:migrate`. To verify the backup without changing anything, run `node scripts/restore-backup.mjs --check`. The restore command uploads the files to ImageKit before inserting content, preserving image and video references. `--confirm` allows it to overwrite content in the selected destination database.

To move the current content from the existing hosted site into a new, empty standalone D1 database, use `node scripts/migrate-live-content.mjs` for a read-only preview, then add `--apply` only after reviewing the target. The script refuses to proceed if the destination already contains the `studio` table. It uploads the live site's current media to ImageKit and inserts the live content without changing the source site.

## Deploy to your own Cloudflare account

```powershell
pnpm exec wrangler login
pnpm exec wrangler d1 create science-content
```

Put the returned database ID into `wrangler.standalone.json` under `d1_databases`. Set `IMAGEKIT_URL_ENDPOINT` there to your ImageKit URL endpoint. This project uses ImageKit for media storage and delivery; it does not require an R2 bucket. The ImageKit private key belongs in `.dev.vars` for local development and in a Cloudflare Worker secret for production.

```powershell
pnpm build
node scripts/restore-backup.mjs --remote --confirm
pnpm exec wrangler secret put STANDALONE_ADMIN_PASSWORD --config wrangler.standalone.json
pnpm exec wrangler secret put SCIENCE_MEDIA --config wrangler.standalone.json
pnpm standalone:deploy
```

Enter an admin password of at least 8 characters (16 or more is recommended) and your ImageKit private key when prompted. Set both Worker secrets on the `gihan-sir` Worker. A GitHub Actions or Dependabot repository secret is not automatically available to the deployed Worker; set `SCIENCE_MEDIA` with Wrangler as above. Changing the admin password secret changes the login password. Admin sessions expire after eight hours. Use HTTPS in production. Do not set `SITE_OWNER_EMAIL` or rely on forwarded ChatGPT identity headers for a standalone deployment.

## Admin controls

- **Profile:** teacher name, site name, portrait, logo, contact details and social links. Teacher name stays synchronized in the hero, profile, footer, sharing and vCard; site name updates navigation, browser title and WhatsApp messages. Logo updates navigation, footer and favicon.
- **Media:** upload into activities, safety, trips, seminars, study materials or timetable. **Show lesson notes** is off by default. Enabling it exposes actual uploaded Study Materials in the notes tab.
- **Videos:** YouTube videos/playlists, direct MP4/WebM uploads and custom thumbnail uploads.
- **Themes:** 45 presets, two simultaneous effects, colors, motion speed and intensity.
- **Restore:** original/new design, footer style, protected content checkpoints.

Gallery arrows overlay the left and right edges of the photo, with no side rails or bottom strip. Images preload and the outgoing photo stays visible until the incoming photo is decoded. Smaller WebP display copies retain original photos for zoom. New gallery uploads generate display copies automatically. The decorative counters have been removed.

Edits save automatically. Direct file uploads are limited to 32 MB each. Lesson notes are never fabricated when enabled.

## Create your GitHub repository

Create an empty repository in your own GitHub account. Do not initialize it with another README. From this extracted folder:

```powershell
git init
git add .
git commit -m "Initial science website"
git branch -M main
git remote add origin https://github.com/YOUR-USERNAME/science-with-gihan.git
git push -u origin main
```

The `.gitignore` excludes secrets, local databases, dependencies and build output. The complete project is also available at https://github.com/alexcarterhanderson-hub/gihan-sir .

## Hosting notes

`.openai/hosting.json` identifies the existing ChatGPT Site. Leave it alone when updating that Site; the standalone commands use `wrangler.standalone.json` instead.

This version does not implement SMS notifications, one-time locked-video codes, student accounts or multi-admin invitations. Videos are public. Check the source before claiming those earlier proposed features are live.

References: [Cloudflare local data](https://developers.cloudflare.com/workers/local-development/local-data/), [secrets](https://developers.cloudflare.com/workers/configuration/secrets/), [D1 commands](https://developers.cloudflare.com/workers/wrangler/commands/d1/), [ImageKit server-side upload](https://imagekit.io/docs/api-reference/upload-file-api/server-side-file-upload).
