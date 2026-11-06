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
    updated: "2026-11-06",
    sections: [
      {
        heading: { en: "What we save", fa: "چه چیزهایی ذخیره می‌شود" },
        paragraphs: [
          {
            en: "There are no online accounts yet. Your profile, the communities you join or create, your notifications and your settings are saved only in your own browser (localStorage). They are not sent to our servers.",
            fa: "هنوز حساب کاربری آنلاین وجود ندارد. پروفایل، جامعه‌هایی که عضوشان می‌شوی یا می‌سازی، اعلان‌ها و تنظیماتت فقط در مرورگر خودت (localStorage) ذخیره می‌شوند و به سرورهای ما فرستاده نمی‌شوند.",
          },
        ],
      },
      {
        heading: { en: "Deleting your data", fa: "پاک کردن اطلاعات" },
        paragraphs: [
          {
            en: "Open Settings and choose “Log out” to delete everything saved on this device, or clear this site's data in your browser settings.",
            fa: "در تنظیمات، «خروج از حساب» را بزن تا همه‌ی اطلاعات ذخیره‌شده در این دستگاه پاک شود؛ یا داده‌های این سایت را از تنظیمات مرورگرت پاک کن.",
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
            en: "The Persian font is loaded from Google Fonts, which receives your IP address like any web request. We don't use analytics, advertising or tracking cookies.",
            fa: "فونت فارسی از Google Fonts بارگذاری می‌شود که مثل هر درخواست اینترنتی، آدرس IP تو را دریافت می‌کند. ما از ابزار آمارگیری، تبلیغات یا کوکی‌های ردیابی استفاده نمی‌کنیم.",
          },
        ],
      },
      {
        heading: { en: "Changes", fa: "تغییرات" },
        paragraphs: [
          {
            en: "When accounts are added, this page will be updated before anything about your data changes. Questions? Write to us through the Contact page.",
            fa: "وقتی حساب کاربری اضافه شود، این صفحه پیش از هر تغییری در نحوه‌ی نگهداری اطلاعاتت به‌روز می‌شود. سؤالی داری؟ از صفحه‌ی «تماس با ما» برایمان بنویس.",
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
    updated: "2026-11-06",
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
        heading: { en: "No guarantees", fa: "بدون ضمانت" },
        paragraphs: [
          {
            en: "Explore is still being built and is provided as is. Features may change, and data saved in your browser can be lost if the browser's storage is cleared.",
            fa: "اکسپلور هنوز در حال ساخت است و همان‌طور که هست ارائه می‌شود. ممکن است امکانات تغییر کنند و اگر حافظه‌ی مرورگر پاک شود، اطلاعات ذخیره‌شده از بین می‌رود.",
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
