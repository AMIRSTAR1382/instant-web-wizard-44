# Explore: find your community

## Project info

  This is my own project for a web or web app like discord whit new design and diferents this project is a idea for iranian companys and gamers and all developers 
   if someone want to use it its open but take a hand to me for work with nxt gen of web and web app we need work on it together and make our company 🤝😉

## What it does

- Browse communities by category (gaming, music, entertainment, coding, technology, art), with a page for every community
- Search everything with `Ctrl+K` (or `/`), in English or Persian
- Accounts: sign up, sign in, reset or change your password; browse everything without one
- Join and leave communities, create your own (everyone sees it), and edit your profile, all saved on the server
- English and Persian (فارسی) with a full right-to-left layout, Persian digits and dates
- Dark, light and system themes, compact mode, and an option to turn animations off
- Works on phones, tablets and desktops

The backend is [PocketBase](https://pocketbase.io), hosted in Iran so visitors don't need a VPN.
See [CHECKLIST.md](CHECKLIST.md) (in Persian) for what is done and what comes next.

## Run it locally

You need [Node.js](https://nodejs.org/) 18 or newer.

```sh
git clone <YOUR_GIT_URL>
cd <YOUR_PROJECT_NAME>
npm i
npm run backend   # terminal 1: downloads PocketBase once and runs it on http://127.0.0.1:8090
npm run dev       # terminal 2: the site on http://localhost:8080
```

Other scripts: `npm run build` (production build into `dist/`), `npm run preview` (serve the build), `npm test` (automated tests; set `PB_TEST_URL` to also test the real server's access rules), `npm run typecheck` and `npm run lint`.

## Put it online

PocketBase serves the site, the API and its admin dashboard from one container: the `Dockerfile` builds it and `liara.json` deploys it to [Liara](https://liara.ir) with a disk for the database.
Set your domain and contact email in `src/config/site.ts` first.
The step-by-step guide (in Persian), with other hosts too, is in [DEPLOY.md](DEPLOY.md).

## Where things live

| Folder / file | What's in it |
| --- | --- |
| `src/pages/` | One file per page: home, explore, category, community, about / privacy / terms, contact, 404 |
| `src/components/` | Layout pieces (sidebar, rail, profile panel), cards and dialogs |
| `src/context/` | Shared state: preferences (language, theme), account, profile, communities, dialogs |
| `src/lib/backend/` | Everything the site asks of its server: the PocketBase client, and an in-memory one for tests |
| `pocketbase/pb_migrations/` | Database tables, access rules and the built-in communities |
| `pocketbase/pb_hooks/` | Server-side logic: member counts, the creator joining, settings from env vars |
| `Dockerfile`, `liara.json` | The production container and its Liara deploy settings |
| `src/config/site.ts` | Your domain, contact email and social links |
| `src/data/communities.ts` | Categories and the built-in communities |
| `src/data/pages.ts` | Text of the About, Privacy and Terms pages |
| `src/i18n/en.ts`, `src/i18n/fa.ts` | All UI text in English and Persian |
| `src/index.css` | Theme colours (dark and light) |
| `src/**/*.test.ts(x)` | Automated tests (Vitest and Testing Library) |

## Built with

Vite, TypeScript, React, React Router, Tailwind CSS, shadcn/ui and the Vazirmatn font, with PocketBase as the backend. Tests use Vitest and Testing Library.
