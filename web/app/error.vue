<template>
  <NavBar></NavBar>
  <main>
    <Container width="sm" centered>
      <Card class="lb-stack">
        <Heading is="h1" size="xl">{{ t("error_" + error?.status) }}</Heading>
        <p>{{ t("error_" + error?.status + "_text") }}</p>
        <p>
          <Link href="/">
            {{ t("to_home") }}
          </Link>
        </p>
      </Card>
    </Container>
  </main>
  <Footer></Footer>
</template>

<script setup lang="ts">
import "@/assets/styles/main.scss";
import type { NuxtError } from "#app";
import Card from "./components/core/Card.vue";
import Container from "./components/core/Container.vue";
import Heading from "./components/core/Heading.vue";
import Link from "./components/core/Link.vue";
import Footer from "./components/modules/Footer.vue";
import NavBar from "./components/modules/NavBar.vue";

const {
  public: { plausibleTrackingDomain },
} = useRuntimeConfig();
const { locale } = useI18n();

// Fetch Leihbase collection on a central location
// await for the result before processing the rest of the page
const { fetch, leihbase } = useLeihbase();
await fetch();

const { t } = useI18n({ useScope: "local" });

const props = defineProps({
  error: Object as () => NuxtError,
});

const style = [
  `@layer base, theme, utilities;
   @layer theme {
    :root {
      ${leihbase?.value?.style || ""}
    }
   }`,
];

useHead({
  script: [
    plausibleTrackingDomain && {
      defer: true,
      "data-domain": plausibleTrackingDomain,
      src: "https://plausible.io/js/script.js",
    },
  ],
  style,
  htmlAttrs: {
    lang: locale,
  },
});
</script>

<style lang="scss" scoped>
main {
  min-height: calc(100vh - 8rem);
}
p {
  margin: 0;
}
</style>

<i18n lang="json">
{
  "en": {
    "to_home": "To homepage",
    "error_400": "Bad Request",
    "error_400_text": "Something went wrong with your request. Please check and try again.",
    "error_404": "Page not found",
    "error_404_text": "Unfortunately, this page no longer exists.",
    "error_408": "Request Timeout",
    "error_408_text": "Your request took too long. Please try again.",
    "error_500": "Internal Server Error",
    "error_500_text": "Something went wrong on our end. Please try again later.",
    "error_502": "Bad Gateway",
    "error_502_text": "We're having trouble connecting. Please try again soon.",
    "error_503": "Service Unavailable",
    "error_503_text": "We're temporarily down for maintenance. Please check back later.",
    "error_504": "Gateway Timeout",
    "error_504_text": "The request took too long to process. Please try again."
  },
  "de": {
    "to_home": "Zur Startseite",
    "error_400": "Ungültige Anfrage",
    "error_400_text": "Etwas ist mit deiner Anfrage schiefgelaufen. Bitte überprüfe sie und versuche es erneut.",
    "error_404": "Seite nicht gefunden",
    "error_404_text": "Leider existiert diese Seite nicht mehr.",
    "error_408": "Anfrage-Timeout",
    "error_408_text": "Deine Anfrage hat zu lange gedauert. Bitte versuche es nochmal.",
    "error_500": "Interner Serverfehler",
    "error_500_text": "Bei uns ist etwas schiefgelaufen. Bitte versuche es später nochmal.",
    "error_502": "Fehler im Gateway",
    "error_502_text": "Wir haben Probleme mit der Verbindung. Bitte versuche es gleich nochmal.",
    "error_503": "Dienst nicht verfügbar",
    "error_503_text": "Wir sind kurz für Wartungsarbeiten offline. Schau bitte später nochmal vorbei.",
    "error_504": "Gateway-Timeout",
    "error_504_text": "Die Anfrage hat zu lange gedauert. Bitte versuche es nochmal."
  }
}
</i18n>
