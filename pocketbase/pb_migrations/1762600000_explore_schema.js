/// <reference path="../../node_modules/.pocketbase/pb_data/types.d.ts" />
/*
 * Explore's database: the tables, who may read or change them, and the built-in communities.
 * PocketBase applies this file automatically, once, the first time it starts with it.
 *
 *   users        PocketBase's built-in accounts, extended with profile fields.
 *                Private: each person can only read and change their own.
 *   communities  Anyone (even signed out) can read them. Signed-in people can create one;
 *                only its owner can change or delete it. Built-in ones have no owner.
 *   memberships  Who joined which community. Each person only sees, adds and removes their own.
 *
 * Fields the server controls (member count, owner, start date) are set in pb_hooks/explore.pb.js.
 * The built-in communities below must match src/data/seedCommunities.ts (a test checks this).
 */
migrate(
  (app) => {
    // ---- users: the account doubles as the profile ----
    const users = app.findCollectionByNameOrId("users");
    users.fields.getByName("name").max = 40;
    users.fields.add(new TextField({ name: "username", max: 20, pattern: "^[a-zA-Z0-9._]{3,20}$" }));
    users.fields.add(new TextField({ name: "bio", max: 160 }));
    users.fields.add(new TextField({ name: "phone", max: 20, pattern: "^[0-9+() -]+$" }));
    users.addIndex("idx_users_username", true, "username", "username != ''");
    users.listRule = "id = @request.auth.id";
    users.viewRule = "id = @request.auth.id";
    users.createRule = "";
    users.updateRule = "id = @request.auth.id";
    users.deleteRule = "id = @request.auth.id";
    app.save(users);

    // ---- communities ----
    const serverFields = ["members", "online", "featured", "started"]
      .map((field) => `@request.body.${field}:isset = false`)
      .join(" && ");
    const communities = new Collection({
      type: "base",
      name: "communities",
      listRule: "",
      viewRule: "",
      createRule: `@request.auth.id != "" && @request.body.owner = @request.auth.id && ${serverFields}`,
      updateRule: `owner = @request.auth.id && @request.body.owner:isset = false && @request.body.slug:isset = false && ${serverFields}`,
      deleteRule: "owner = @request.auth.id",
      fields: [
        // Also the page address: /community/<slug>. Persian letters are allowed.
        { name: "slug", type: "text", required: true, max: 48, pattern: String.raw`^[\p{L}\p{N}]+(-[\p{L}\p{N}]+)*$` },
        { name: "name_en", type: "text", required: true, min: 3, max: 40 },
        { name: "name_fa", type: "text", required: true, min: 3, max: 40 },
        { name: "description_en", type: "text", required: true, min: 10, max: 200 },
        { name: "description_fa", type: "text", required: true, min: 10, max: 200 },
        {
          name: "category",
          type: "select",
          required: true,
          maxSelect: 1,
          values: ["gaming", "music", "entertainment", "coding", "technology", "art"],
        },
        { name: "image", type: "select", required: true, maxSelect: 1, values: ["hero", "gaming", "vr", "art", "nft"] },
        { name: "members", type: "number", min: 0, onlyInt: true },
        { name: "online", type: "number", min: 0, onlyInt: true },
        { name: "featured", type: "bool" },
        { name: "started", type: "date" },
        { name: "owner", type: "relation", collectionId: users.id, maxSelect: 1, cascadeDelete: true },
        { name: "created", type: "autodate", onCreate: true },
        { name: "updated", type: "autodate", onCreate: true, onUpdate: true },
      ],
      indexes: [
        "CREATE UNIQUE INDEX idx_communities_slug ON communities (slug)",
        "CREATE INDEX idx_communities_owner ON communities (owner)",
      ],
    });
    app.save(communities);

    // ---- memberships ----
    const memberships = new Collection({
      type: "base",
      name: "memberships",
      listRule: "user = @request.auth.id",
      viewRule: "user = @request.auth.id",
      createRule: '@request.auth.id != "" && @request.body.user = @request.auth.id',
      updateRule: null,
      deleteRule: "user = @request.auth.id",
      fields: [
        { name: "user", type: "relation", required: true, collectionId: users.id, maxSelect: 1, cascadeDelete: true },
        {
          name: "community",
          type: "relation",
          required: true,
          collectionId: communities.id,
          maxSelect: 1,
          cascadeDelete: true,
        },
        { name: "created", type: "autodate", onCreate: true },
      ],
      indexes: ["CREATE UNIQUE INDEX idx_memberships_user_community ON memberships (user, community)"],
    });
    app.save(memberships);

    // ---- the built-in communities (copied from src/data/seedCommunities.ts) ----
    const seeds = /* SEED:START */ 
[
  {
    "slug": "virtual-reality",
    "name_en": "Virtual Reality",
    "name_fa": "واقعیت مجازی",
    "description_en": "Virtual reality is a self-created form of chosen reality. Come build it with us.",
    "description_fa": "واقعیت مجازی شکلی از واقعیتِ انتخاب‌شده است که خودمان می‌سازیم. بیا با هم بسازیمش.",
    "category": "technology",
    "image": "vr",
    "members": 142000,
    "online": 8400,
    "featured": true,
    "started": "2025-09-27T00:00:00.000Z"
  },
  {
    "slug": "gaming-zone",
    "name_en": "Gaming Zone",
    "name_fa": "گیمینگ زون",
    "description_en": "Video games foster the mindset that allows creativity to grow.",
    "description_fa": "بازی‌های ویدیویی ذهنی می‌سازند که خلاقیت در آن رشد می‌کند.",
    "category": "gaming",
    "image": "gaming",
    "members": 128400,
    "online": 9800,
    "featured": true,
    "started": "2025-10-17T00:00:00.000Z"
  },
  {
    "slug": "fps-masters",
    "name_en": "FPS Masters",
    "name_fa": "استادان FPS",
    "description_en": "Competitive first-person shooter community",
    "description_fa": "جامعه‌ی رقابتی بازی‌های شوتر اول‌شخص",
    "category": "gaming",
    "image": "gaming",
    "members": 256000,
    "online": 18200,
    "featured": false,
    "started": "2026-01-05T00:00:00.000Z"
  },
  {
    "slug": "rpg-legends",
    "name_en": "RPG Legends",
    "name_fa": "افسانه‌های RPG",
    "description_en": "For role-playing game enthusiasts",
    "description_fa": "برای علاقه‌مندان بازی‌های نقش‌آفرینی",
    "category": "gaming",
    "image": "vr",
    "members": 189000,
    "online": 11300,
    "featured": false,
    "started": "2026-02-24T00:00:00.000Z"
  },
  {
    "slug": "indie-games-hub",
    "name_en": "Indie Games Hub",
    "name_fa": "پاتوق بازی‌های مستقل",
    "description_en": "Discover and discuss indie games",
    "description_fa": "بازی‌های مستقل را کشف کن و درباره‌شان گپ بزن",
    "category": "gaming",
    "image": "gaming",
    "members": 94000,
    "online": 4100,
    "featured": false,
    "started": "2026-08-03T00:00:00.000Z"
  },
  {
    "slug": "electronic-beats",
    "name_en": "Electronic Beats",
    "name_fa": "بیت‌های الکترونیک",
    "description_en": "EDM and electronic music producers",
    "description_fa": "تهیه‌کنندگان موسیقی الکترونیک و EDM",
    "category": "music",
    "image": "hero",
    "members": 178000,
    "online": 7200,
    "featured": false,
    "started": "2026-03-26T00:00:00.000Z"
  },
  {
    "slug": "jazz-blues",
    "name_en": "Jazz & Blues",
    "name_fa": "جاز و بلوز",
    "description_en": "Classic and modern jazz enthusiasts",
    "description_fa": "علاقه‌مندان جاز کلاسیک و مدرن",
    "category": "music",
    "image": "hero",
    "members": 92000,
    "online": 2900,
    "featured": false,
    "started": "2026-05-05T00:00:00.000Z"
  },
  {
    "slug": "rock-nation",
    "name_en": "Rock Nation",
    "name_fa": "ملت راک",
    "description_en": "Rock music from classic to modern",
    "description_fa": "موسیقی راک، از کلاسیک تا مدرن",
    "category": "music",
    "image": "hero",
    "members": 234000,
    "online": 10600,
    "featured": false,
    "started": "2025-12-06T00:00:00.000Z"
  },
  {
    "slug": "movie-buffs",
    "name_en": "Movie Buffs",
    "name_fa": "عشق فیلم",
    "description_en": "Discuss the latest movies and the classics",
    "description_fa": "درباره‌ی فیلم‌های تازه و کلاسیک گفتگو کن",
    "category": "entertainment",
    "image": "nft",
    "members": 312000,
    "online": 15800,
    "featured": false,
    "started": "2025-11-06T00:00:00.000Z"
  },
  {
    "slug": "tv-series-hub",
    "name_en": "TV Series Hub",
    "name_fa": "پاتوق سریال",
    "description_en": "Binge-watch together",
    "description_fa": "با هم سریال ببینیم",
    "category": "entertainment",
    "image": "nft",
    "members": 198000,
    "online": 9100,
    "featured": false,
    "started": "2026-06-04T00:00:00.000Z"
  },
  {
    "slug": "anime-world",
    "name_en": "Anime World",
    "name_fa": "دنیای انیمه",
    "description_en": "Anime and manga community",
    "description_fa": "جامعه‌ی انیمه و مانگا",
    "category": "entertainment",
    "image": "nft",
    "members": 445000,
    "online": 27400,
    "featured": false,
    "started": "2026-01-25T00:00:00.000Z"
  },
  {
    "slug": "web-developers",
    "name_en": "Web Developers",
    "name_fa": "توسعه‌دهندگان وب",
    "description_en": "Full-stack web development",
    "description_fa": "توسعه‌ی وب فول‌استک",
    "category": "coding",
    "image": "art",
    "members": 523000,
    "online": 31000,
    "featured": false,
    "started": "2025-09-07T00:00:00.000Z"
  },
  {
    "slug": "python-pros",
    "name_en": "Python Pros",
    "name_fa": "حرفه‌ای‌های پایتون",
    "description_en": "Python programming and data science",
    "description_fa": "برنامه‌نویسی پایتون و علم داده",
    "category": "coding",
    "image": "art",
    "members": 367000,
    "online": 19500,
    "featured": false,
    "started": "2025-12-26T00:00:00.000Z"
  },
  {
    "slug": "mobile-dev",
    "name_en": "Mobile Dev",
    "name_fa": "توسعه‌ی موبایل",
    "description_en": "iOS and Android development",
    "description_fa": "توسعه‌ی iOS و اندروید",
    "category": "coding",
    "image": "art",
    "members": 214000,
    "online": 8800,
    "featured": false,
    "started": "2026-07-04T00:00:00.000Z"
  },
  {
    "slug": "ai-machine-learning",
    "name_en": "AI & Machine Learning",
    "name_fa": "هوش مصنوعی و یادگیری ماشین",
    "description_en": "Artificial intelligence enthusiasts",
    "description_fa": "علاقه‌مندان هوش مصنوعی",
    "category": "technology",
    "image": "vr",
    "members": 412000,
    "online": 22700,
    "featured": false,
    "started": "2026-09-02T00:00:00.000Z"
  },
  {
    "slug": "vr-ar-world",
    "name_en": "VR/AR World",
    "name_fa": "دنیای VR/AR",
    "description_en": "Virtual and augmented reality",
    "description_fa": "واقعیت مجازی و افزوده",
    "category": "technology",
    "image": "vr",
    "members": 156000,
    "online": 5300,
    "featured": false,
    "started": "2026-04-15T00:00:00.000Z"
  },
  {
    "slug": "iot-makers",
    "name_en": "IoT Makers",
    "name_fa": "سازندگان اینترنت اشیا",
    "description_en": "Internet of Things projects",
    "description_fa": "پروژه‌های اینترنت اشیا",
    "category": "technology",
    "image": "vr",
    "members": 98000,
    "online": 3200,
    "featured": false,
    "started": "2026-10-02T00:00:00.000Z"
  },
  {
    "slug": "3d-art",
    "name_en": "3D Art",
    "name_fa": "هنر سه‌بعدی",
    "description_en": "A great place to show your art",
    "description_fa": "جایی عالی برای نمایش آثارت",
    "category": "art",
    "image": "art",
    "members": 87000,
    "online": 3900,
    "featured": false,
    "started": "2026-09-17T00:00:00.000Z"
  },
  {
    "slug": "nft",
    "name_en": "NFT",
    "name_fa": "NFT",
    "description_en": "A great place to share your NFTs",
    "description_fa": "جایی برای به اشتراک گذاشتن NFTهایت",
    "category": "art",
    "image": "nft",
    "members": 64000,
    "online": 2100,
    "featured": false,
    "started": "2026-10-17T00:00:00.000Z"
  }
]
    /* SEED:END */;
    for (const seed of seeds) {
      const record = new Record(communities);
      for (const [key, value] of Object.entries(seed)) record.set(key, value);
      app.save(record);
    }

    // ---- app settings ----
    const settings = app.settings();
    settings.meta.appName = "Explore";
    // Limits how fast one visitor can try passwords, sign up or create things.
    settings.rateLimits.enabled = true;
    app.save(settings);
  },
  (app) => {
    for (const name of ["memberships", "communities"]) {
      app.delete(app.findCollectionByNameOrId(name));
    }
    const users = app.findCollectionByNameOrId("users");
    for (const name of ["username", "bio", "phone"]) users.fields.removeByName(name);
    users.removeIndex("idx_users_username");
    app.save(users);
  },
);
