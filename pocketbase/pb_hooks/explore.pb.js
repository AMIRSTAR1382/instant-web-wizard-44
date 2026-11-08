/// <reference path="../../node_modules/.pocketbase/pb_data/types.d.ts" />
/*
 * Server-side logic that access rules alone can't express. PocketBase loads every
 * *.pb.js file in this folder when it starts.
 *
 * Note: PocketBase runs each handler in isolation, so a handler can't use variables
 * declared outside it. Everything a handler needs is defined inside it.
 */

// A community created from the site: the server decides these fields, whatever was sent.
onRecordCreateRequest((e) => {
  if (!e.hasSuperuserAuth()) {
    e.record.set("members", 0);
    e.record.set("online", 0);
    e.record.set("featured", false);
    e.record.set("started", new DateTime());
    if (e.auth) e.record.set("owner", e.auth.id);
  }
  e.next();
}, "communities");

// Whoever creates a community is its first member.
onRecordAfterCreateSuccess((e) => {
  const owner = e.record.get("owner");
  if (owner) {
    const membership = new Record(e.app.findCollectionByNameOrId("memberships"));
    membership.set("user", owner);
    membership.set("community", e.record.id);
    e.app.save(membership);
  }
  e.next();
}, "communities");

// Keep each community's member count in step with its memberships.
onRecordAfterCreateSuccess((e) => {
  e.app
    .db()
    .newQuery("UPDATE communities SET members = members + 1 WHERE id = {:id}")
    .bind({ id: e.record.get("community") })
    .execute();
  e.next();
}, "memberships");

onRecordAfterDeleteSuccess((e) => {
  e.app
    .db()
    .newQuery("UPDATE communities SET members = MAX(members - 1, 0) WHERE id = {:id}")
    .bind({ id: e.record.get("community") })
    .execute();
  e.next();
}, "memberships");

// Once email sending is set up, new accounts get a "confirm your email" message.
onRecordAfterCreateSuccess((e) => {
  if (e.app.settings().smtp.enabled && !e.record.verified()) {
    try {
      $mails.sendRecordVerification(e.app, e.record);
    } catch (error) {
      e.app.logger().warn("Could not send the verification email", "error", String(error));
    }
  }
  e.next();
}, "users");

/*
 * Settings from environment variables, so the server can be configured from the hosting
 * panel (Liara > Settings > Environment variables) without opening the PocketBase dashboard.
 * Any variable left unset keeps whatever is saved in the dashboard. See DEPLOY.md.
 */
onBootstrap((e) => {
  e.next();
  const env = (name) => String($os.getenv(name) || "").trim();
  const settings = e.app.settings();
  let changed = false;

  if (env("APP_URL")) {
    // Used in the links inside emails (password reset, email confirmation).
    settings.meta.appURL = env("APP_URL").replace(/\/+$/, "");
    changed = true;
  }
  if (env("MAIL_SENDER_ADDRESS")) {
    settings.meta.senderAddress = env("MAIL_SENDER_ADDRESS");
    settings.meta.senderName = env("MAIL_SENDER_NAME") || "Explore";
    changed = true;
  }
  if (env("SMTP_HOST")) {
    settings.smtp.enabled = true;
    settings.smtp.host = env("SMTP_HOST");
    settings.smtp.port = parseInt(env("SMTP_PORT") || "587", 10);
    settings.smtp.username = env("SMTP_USERNAME");
    settings.smtp.password = env("SMTP_PASSWORD");
    // "true" for port 465 (TLS from the start); 587 upgrades with STARTTLS on its own.
    settings.smtp.tls = env("SMTP_TLS") === "true";
    changed = true;
  }
  if (env("TRUSTED_PROXY_HEADER")) {
    // Behind the host's proxy every visitor would otherwise share the proxy's IP,
    // and the sign-in rate limit would apply to everyone at once.
    settings.trustedProxy.headers = [env("TRUSTED_PROXY_HEADER")];
    changed = true;
  }

  if (changed) e.app.save(settings);
});
