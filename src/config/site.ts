/**
 * Settings to check before putting the site online.
 * After changing anything here, run `npm run build` again and upload the new `dist/` folder.
 * (See DEPLOY.md.)
 */
export const siteConfig = {
  /** Your domain with https:// and no slash at the end, e.g. "https://explore.ir". */
  url: "https://example.com",
  /** Shown on the Contact page; the contact form sends to this address. */
  contactEmail: "hello@example.com",
  /** Links on the Contact page. Leave a value empty ("") to hide it. */
  social: {
    telegram: "",
    instagram: "",
    github: "https://github.com/AMIRSTAR1382/instant-web-wizard-44",
  },
};

/** True while the placeholder domain above hasn't been replaced yet. */
export const isPlaceholderSiteUrl = siteConfig.url.includes("example.com");
