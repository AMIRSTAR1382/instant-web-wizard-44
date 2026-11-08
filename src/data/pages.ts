import type { LocalizedText } from "@/lib/i18n";

/*
 * Text of the About, Privacy and Terms pages. Edit freely; the privacy and terms text is a
 * plain-language starting point that describes how the site works today. Have it reviewed
 * before the site handles real accounts or payments.
 */

export type InfoPageId = "about" | "privacy" | "terms";

export interface InfoPageContent {
  title: LocalizedText;
  /** Used for search results and link previews. */
  description: LocalizedText;
  /** YYYY-MM-DD; shown as "Last updated" (leave out on pages that don't need it). */
  updated?: string;
  sections: { heading: LocalizedText; paragraphs: LocalizedText[] }[];
}

export const infoPages: Record<InfoPageId, InfoPageContent> = {
  about: {
    title: { en: "About Explore", fa: "درباره‌ی اکسپلور" },
    description: {
      en: "Explore is a home for gaming, music, coding and art communities, made in Iran for everyone.",
      fa: "اکسپلور خانه‌ای برای جامعه‌های گیمینگ، موسیقی، برنامه‌نویسی و هنر است؛ ساخته‌شده در ایران برای همه.",
    },
    sections: [
      {
        heading: { en: "Our story", fa: "داستان ما" },
        paragraphs: [
          {
            en: "Explore started as an idea for Iranian gamers, developers and creative teams: a place like Discord, with a fresh design and full support for Persian.",
            fa: "اکسپلور از یک ایده شروع شد: جایی شبیه دیسکورد برای گیمرها، برنامه‌نویس‌ها و تیم‌های خلاق ایرانی، با طراحی تازه و پشتیبانی کامل از زبان فارسی.",
          },
        ],
      },
      {
        heading: { en: "What you can do here", fa: "این‌جا چه کارهایی می‌شود کرد" },
        paragraphs: [
          {
            en: "Find communities by category or with search, join the ones you like, and start your own in a few seconds.",
            fa: "جامعه‌ها را با دسته‌بندی یا جستجو پیدا کن، به هر کدام که دوست داری بپیوند و در چند ثانیه جامعه‌ی خودت را بساز.",
          },
          {
            en: "Use the site in Persian or English, with a dark or light theme, on your phone or your computer.",
            fa: "سایت را به فارسی یا انگلیسی، با تم تیره یا روشن، روی گوشی یا کامپیوتر استفاده کن.",
          },
        ],
      },
      {
        heading: { en: "Build it with us", fa: "با ما بسازیمش" },
        paragraphs: [
          {
            en: "Explore is open source. If you'd like to help build the next generation of the web with us, get in touch through the Contact page.",
            fa: "اکسپلور متن‌باز است. اگر دوست داری در ساختن نسل بعدی وب همراهمان باشی، از صفحه‌ی «تماس با ما» خبرمان کن.",
          },
        ],
      },
    ],
  },

  privacy: {
    title: { en: "Privacy policy", fa: "حریم خصوصی" },
    description: {
      en: "What Explore saves, where it is kept, and how to delete it.",
      fa: "اکسپلور چه چیزهایی را ذخیره می‌کند، کجا نگه می‌دارد و چطور می‌شود پاکشان کرد.",
    },
    updated: "2026-11-08",
    sections: [
      {
        heading: { en: "Browsing without an account", fa: "گشتن بدون حساب کاربری" },
        paragraphs: [
          {
            en: "You can browse and search every community without an account. Nothing about you is saved on our server while you do.",
            fa: "بدون حساب کاربری هم می‌توانی همه‌ی جامعه‌ها را ببینی و جستجو کنی. در این حالت چیزی درباره‌ی تو روی سرور ما ذخیره نمی‌شود.",
          },
        ],
      },
      {
        heading: { en: "What your account saves on our server", fa: "حساب کاربری‌ات چه چیزهایی را روی سرور ما ذخیره می‌کند" },
        paragraphs: [
          {
            en: "When you create an account we save your email address, your password (only as a secure hash, never as plain text) and your display name. If you add them, we also save your username, bio, phone number and profile photo.",
            fa: "وقتی حساب می‌سازی، ایمیل، رمز عبور (فقط به‌صورت درهم‌سازی‌شده‌ی امن، هرگز خود رمز) و نام نمایشی‌ات ذخیره می‌شود. اگر نام کاربری، بیو، شماره تلفن یا عکس پروفایل اضافه کنی، آن‌ها هم ذخیره می‌شوند.",
          },
          {
            en: "We also save the communities you create, which everyone can see, and the communities you join. Your email, phone number and the list of communities you joined are visible only to you.",
            fa: "جامعه‌هایی که می‌سازی (که همه می‌بینندشان) و جامعه‌هایی که عضوشان می‌شوی هم ذخیره می‌شوند. ایمیل، شماره تلفن و فهرست عضویت‌هایت را فقط خودت می‌بینی.",
          },
          {
            en: "The server is in Iran. We don't sell your information or share it with anyone, and we use it only to run your account.",
            fa: "سرور در ایران است. اطلاعاتت را نمی‌فروشیم و به کسی نمی‌دهیم و فقط برای کار کردن حسابت از آن استفاده می‌کنیم.",
          },
        ],
      },
      {
        heading: { en: "What stays in your browser", fa: "چه چیزهایی در مرورگرت می‌ماند" },
        paragraphs: [
          {
            en: "Your settings (language, theme, sound), notifications and “Your activity” list are saved only in your own browser (localStorage), together with the key that keeps you signed in.",
            fa: "تنظیماتت (زبان، تم، صدا)، اعلان‌ها و فهرست «فعالیت‌های تو» فقط در مرورگر خودت (localStorage) ذخیره می‌شوند؛ همراه با کلیدی که تو را وارد حسابت نگه می‌دارد.",
          },
        ],
      },
      {
        heading: { en: "Deleting your data", fa: "پاک کردن اطلاعات" },
        paragraphs: [
          {
            en: "Delete a community you created from its page. To delete your whole account, with everything it saved, write to us through the Contact page from your account's email address.",
            fa: "هر جامعه‌ای را که ساخته‌ای، از صفحه‌ی خودش حذف کن. برای حذف کامل حسابت و همه‌ی اطلاعاتش، با همان ایمیل حسابت از صفحه‌ی «تماس با ما» برایمان بنویس.",
          },
          {
            en: "Signing out removes your session and activity list from this device; clearing this site's data in your browser removes the rest.",
            fa: "خروج از حساب، نشست و فهرست فعالیت‌هایت را از این دستگاه پاک می‌کند؛ با پاک کردن داده‌های این سایت در مرورگر، بقیه هم پاک می‌شود.",
          },
        ],
      },
      {
        heading: { en: "Microphone", fa: "میکروفون" },
        paragraphs: [
          {
            en: "The microphone test in Settings runs entirely in your browser. Nothing is recorded or uploaded, and the microphone is released as soon as you stop the test.",
            fa: "تست میکروفون در تنظیمات کاملاً داخل مرورگرت انجام می‌شود. چیزی ضبط یا ارسال نمی‌شود و با توقف تست، میکروفون آزاد می‌شود.",
          },
        ],
      },
      {
        heading: { en: "Other services", fa: "سرویس‌های دیگر" },
        paragraphs: [
          {
            en: "Everything, the Persian font included, is served from our own server: no Google Fonts or other outside services. Our server keeps short technical logs (such as IP addresses) to protect accounts from abuse. We don't use analytics, advertising or tracking cookies.",
            fa: "همه‌چیز، حتی فونت فارسی، از سرور خود ما بارگذاری می‌شود و از Google Fonts یا سرویس بیرونی دیگری استفاده نمی‌کنیم. سرور برای محافظت از حساب‌ها در برابر سوءاستفاده، گزارش‌های فنی کوتاه‌مدت (مثل آدرس IP) نگه می‌دارد. ما از ابزار آمارگیری، تبلیغات یا کوکی‌های ردیابی استفاده نمی‌کنیم.",
          },
        ],
      },
      {
        heading: { en: "Changes", fa: "تغییرات" },
        paragraphs: [
          {
            en: "This page will be updated before anything about how we keep your data changes; the date at the top shows the last change. Questions? Write to us through the Contact page.",
            fa: "پیش از هر تغییری در نحوه‌ی نگهداری اطلاعاتت، این صفحه به‌روز می‌شود؛ تاریخ بالای صفحه زمان آخرین تغییر را نشان می‌دهد. سؤالی داری؟ از صفحه‌ی «تماس با ما» برایمان بنویس.",
          },
        ],
      },
    ],
  },

  terms: {
    title: { en: "Terms of use", fa: "قوانین استفاده" },
    description: {
      en: "The rules for using Explore and the communities on it.",
      fa: "قوانین استفاده از اکسپلور و جامعه‌های آن.",
    },
    updated: "2026-11-08",
    sections: [
      {
        heading: { en: "Using Explore", fa: "استفاده از اکسپلور" },
        paragraphs: [
          {
            en: "By using Explore you agree to these terms. If you don't agree, please don't use the site.",
            fa: "با استفاده از اکسپلور این قوانین را می‌پذیری. اگر با آن‌ها موافق نیستی، لطفاً از سایت استفاده نکن.",
          },
        ],
      },
      {
        heading: { en: "Be a good member", fa: "عضو خوبی باش" },
        paragraphs: [
          {
            en: "Be respectful. Harassment, hate speech, spam, scams and illegal content are not allowed in any community.",
            fa: "محترمانه رفتار کن. آزار، نفرت‌پراکنی، اسپم، کلاه‌برداری و محتوای غیرقانونی در هیچ جامعه‌ای مجاز نیست.",
          },
        ],
      },
      {
        heading: { en: "Your content", fa: "محتوای تو" },
        paragraphs: [
          {
            en: "You are responsible for the communities and text you create. Content that breaks these rules may be removed.",
            fa: "مسئولیت جامعه‌ها و متن‌هایی که می‌سازی با خودت است. محتوایی که این قوانین را رعایت نکند ممکن است حذف شود.",
          },
        ],
      },
      {
        heading: { en: "Your account", fa: "حساب کاربری تو" },
        paragraphs: [
          {
            en: "Keep your password to yourself; you are responsible for what happens with your account. Communities you create must follow these terms, and we may remove ones that don't.",
            fa: "رمز عبورت را به کسی نده؛ مسئولیت هر کاری که با حسابت انجام می‌شود با خودت است. جامعه‌هایی که می‌سازی باید با این قوانین جور باشند و ممکن است جامعه‌هایی را که رعایت نمی‌کنند حذف کنیم.",
          },
        ],
      },
      {
        heading: { en: "No guarantees", fa: "بدون ضمانت" },
        paragraphs: [
          {
            en: "Explore is still being built and is provided as is. Features may change, and the service may sometimes be unavailable.",
            fa: "اکسپلور هنوز در حال ساخت است و همان‌طور که هست ارائه می‌شود. ممکن است امکانات تغییر کنند و سرویس گاهی در دسترس نباشد.",
          },
        ],
      },
      {
        heading: { en: "Changes to these terms", fa: "تغییر این قوانین" },
        paragraphs: [
          {
            en: "We may update these terms. The date at the top of this page shows when they last changed.",
            fa: "ممکن است این قوانین به‌روز شوند. تاریخ بالای همین صفحه نشان می‌دهد آخرین بار کی تغییر کرده‌اند.",
          },
        ],
      },
    ],
  },
};
