import path from "path";

export default defineNuxtConfig({
  compatibilityDate: "2025-03-14",

  runtimeConfig: {
    public: {
      plausibleTrackingDomain: "", // NUXT_PUBLIC_PLAUSIBLE_TRACKING_DOMAIN
      ci: "", // NUXT_PUBLIC_CI
      locale: "", // NUXT_PUBLIC_LOCALE
      pocketbase: {
        serverBaseUrl: "", // NUXT_PUBLIC_POCKETBASE_SERVER_BASE_URL
        clientBaseUrl: "", // NUXT_PUBLIC_POCKETBASE_CLIENT_BASE_URL
      },
      cap: {
        instanceHost: "",
        siteKey: "",
      },
    },
  },

  alias: {
    "~": "/<rootDir>/app",
  },

  components: {
    dirs: [],
  },

  app: {
    head: {
      title: "Leihbase",
      link: [
        { rel: "icon", type: "image/png", href: "/favicon-192x192.png" },
        { rel: "stylesheet", href: "/fonts/inter/inter.css" },
      ],
    },
  },

  vite: {
    resolve: {
      alias: {
        "~": path.resolve(__dirname),
      },
    },
  },

  modules: ["@pinia/nuxt", "./modules/pocketbase", "@nuxtjs/i18n"],

  i18n: {
    strategy: "no_prefix",
    detectBrowserLanguage: false,
  },

  devtools: { enabled: true },

  vue: {
    compilerOptions: {
      // treat all tags with a dash as custom elements
      isCustomElement: (tag) =>
        tag.startsWith("sl-") ||
        tag.startsWith("calendar-") ||
        tag.startsWith("cap-"),
    },
  },

  experimental: { appManifest: false },

  typescript: {
    tsConfig: {
      // lib/ uses auto-imports (e.g. useI18n), so it needs the app context
      include: ["../lib/**/*"],
      vueCompilerOptions: {
        strictTemplates: true,
        fallthroughAttributes: false,
      },
    },
  },
});
