<template>
  <Container width="lg" centered>
    <PageAlert />
    <header>
      <section class="links">
        <Button
          variant="secondary"
          :href="`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
            location?.address ?? ''
          )}`"
          target="_blank"
        >
          <template #prefix><MapPin /></template>
          {{ location?.address }}
        </Button>
        <Button
          v-for="link in location?.links"
          variant="secondary"
          :href="link.link"
          target="_blank"
        >
          <template #prefix><Internet /></template>
          {{ link.text }}
        </Button>
      </section>
      <Heading is="h1" size="xl" class="heading">
        {{ location?.name || t("no_location_found") }}
      </Heading>
      <!-- Description -->
      <div
        v-if="location?.description"
        class="description"
        v-html="location.description"
      ></div>
      <!-- Opening hours -->
      <div v-if="location?.opening_hours">
        <strong>{{ t("opening_hours") }}:</strong><br />
        <span
          v-html="openingHoursToString(location?.opening_hours, locale)"
        ></span>
      </div>
    </header>
    <section>
      <ProductGrid v-if="location" :location="location" />
    </section>
  </Container>
</template>

<script lang="ts" setup>
import { openingHoursToString } from "@@/lib/openingHours";
import Button from "@/components/core/Button.vue";
import Container from "@/components/core/Container.vue";
import Heading from "@/components/core/Heading.vue";
import ProductGrid from "@/components/modules/ProductGrid.vue";
import PageAlert from "@/components/page-alert/PageAlert.vue";
import { Internet, MapPin } from "@iconoir/vue";

const { t, locale } = useI18n({
  useScope: "local",
});

const route = useRoute();

const { location } = await getActiveLocationBySlug(
  route.params.location as string
);
if (!location.value) {
  throw createError({
    statusCode: 404,
  });
}

useHead({
  title: location.value?.name,
});
</script>

<style lang="scss" scoped>
section {
  margin-bottom: var(--fluid-spacing-8);
}
header {
  margin-bottom: var(--fluid-spacing-8);
  .links {
    display: flex;
    gap: var(--fluid-spacing-4);
    margin-bottom: var(--fluid-spacing-8);
    flex-wrap: wrap;
  }
  .heading {
    margin-bottom: var(--fluid-spacing-8);
  }
  .description {
    max-width: var(--max-text-width);
    margin-bottom: var(--fluid-spacing-4);
  }
}
h2 {
  margin-bottom: 1rem;
}
</style>

<i18n lang="json">
{
  "en": {
    "no_location_found": "No location found",
    "opening_hours": "Opening hours"
  },
  "de": {
    "no_location_found": "Kein Ort gefunden",
    "opening_hours": "Aktuelle Öffnungszeiten"
  }
}
</i18n>
