<template>
  <div class="grid">
    <NavBar></NavBar>
    <main>
      <NuxtLoadingIndicator color="#fff" />
      <NuxtPage />
    </main>
    <Footer></Footer>
  </div>
  <ReservationDialog />
  <VerificationDialog />
</template>

<script lang="ts" setup>
import "@/assets/styles/main.scss";
import "@shoelace-style/shoelace/dist/themes/light.css";
import { useLeihbase } from "@/stores/leihbase";
import { useUserStore } from "@/stores/user";
import { setBasePath } from "@shoelace-style/shoelace/dist/utilities/base-path.js";
import type { User } from "~~/models/user";
import Footer from "./components/modules/Footer.vue";
import NavBar from "./components/modules/NavBar.vue";
import ReservationDialog from "./components/ReservationDialog.vue";
import VerificationDialog from "./components/VerificationDialog.vue";

setBasePath(
  "https://cdn.jsdelivr.net/npm/@shoelace-style/shoelace@2.14.0/cdn/"
);

const { pb, isValid, logout } = usePocketbase();
const userStore = useUserStore();
const {
  public: { plausibleTrackingDomain },
} = useRuntimeConfig();
const { locale } = useI18n();

// Fetch Leihbase collection on a central location
// await for the result before processing the rest of the page
const { fetch } = useLeihbase();
const { leihbase } = storeToRefs(useLeihbase());
await fetch();

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

if (isValid.value) {
  await userStore.login({ user: pb.authStore.record as User });
} else {
  logout();
  userStore.logout();
}
</script>

<style lang="scss" scoped>
.grid {
  min-height: 100svh;
  display: grid;
  grid-template-rows: auto 1fr auto;
}
main {
  min-width: 0;
}
</style>
