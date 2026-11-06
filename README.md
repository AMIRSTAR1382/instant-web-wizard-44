# Explore: find your community

## Project info

  This is my own project for a web or web app like discord whit new design and diferents this project is a idea for iranian companys and gamers and all developers 
   if someone want to use it its open but take a hand to me for work with nxt gen of web and web app we need work on it together and make our company 🤝😉

## What it does

- Browse communities by category (gaming, music, entertainment, coding, technology, art), with a page for every community
- Search everything with `Ctrl+K` (or `/`), in English or Persian
- Join and leave communities, create your own, and edit your profile
- English and Persian (فارسی) with a full right-to-left layout, Persian digits and dates
- Dark, light and system themes, compact mode, and an option to turn animations off
- Works on phones, tablets and desktops

There is no backend yet: profiles, memberships and settings are saved in the visitor's browser.
See [CHECKLIST.md](CHECKLIST.md) (in Persian) for what is done and what comes next.

## Run it locally

You need [Node.js](https://nodejs.org/) 18 or newer.

```sh
git clone <YOUR_GIT_URL>
cd <YOUR_PROJECT_NAME>
npm i
npm run dev
```

Other scripts: `npm run build` (production build into `dist/`), `npm run preview` (serve the build), `npm test` (automated tests), `npm run typecheck` and `npm run lint`.

## Put it online

Set your domain and contact email in `src/config/site.ts`, run `npm run build`, and upload the contents of `dist/`.
Ready-made settings are included for cPanel / DirectAdmin (`.htaccess`), Netlify (`_redirects`), Vercel (`vercel.json`) and nginx.
The step-by-step guide (in Persian) is in [DEPLOY.md](DEPLOY.md).

## Where things live

| Folder / file | What's in it |
| --- | --- |
| `src/pages/` | One file per page: home, explore, category, community, about / privacy / terms, contact, 404 |
| `src/components/` | Layout pieces (sidebar, rail, profile panel), cards and dialogs |
| `src/context/` | Shared state: preferences (language, theme), profile, communities, dialogs |
| `src/config/site.ts` | Your domain, contact email and social links |
| `src/data/communities.ts` | Categories and the built-in communities |
| `src/data/pages.ts` | Text of the About, Privacy and Terms pages |
| `src/i18n/en.ts`, `src/i18n/fa.ts` | All UI text in English and Persian |
| `src/index.css` | Theme colours (dark and light) |
| `src/**/*.test.ts(x)` | Automated tests (Vitest and Testing Library) |

## Built with

Vite, TypeScript, React, React Router, Tailwind CSS, shadcn/ui and the Vazirmatn font. Tests use Vitest and Testing Library.
