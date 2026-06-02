import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  locales: ["fr", "en", "es", "it", "pt", "zh"],
  defaultLocale: "fr",
  localePrefix: "always",
});
