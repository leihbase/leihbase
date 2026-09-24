<template>
  <Container width="lg" centered class="container">
    <PageAlert />
    <div class="grid">
      <div class="lb-stack">
        <Heading is="h1" size="xl">Admin</Heading>
        <Heading is="h2" size="lg" class="heading">
          {{ t("locations") }}
        </Heading>
        <div v-if="locations && locations.length > 0" class="locations">
          <ul>
            <li v-for="location in locations">
              <Button
                variant="secondary"
                :to="`/admin/${location.slug}`"
                class="location"
              >
                <strong>
                  {{ location.name }}
                  <Badge :variant="location.active ? 'success' : 'error'">
                    {{ t(location.active ? "active" : "inactive") }}
                  </Badge>
                </strong>
                <template v-if="location.address">
                  <br />
                  <p>{{ location.address }}</p>
                </template>
              </Button>
            </li>
          </ul>
        </div>
      </div>
    </div>
  </Container>
</template>

<script lang="ts" setup>
import Badge from "@/components/core/Badge.vue";
import Button from "@/components/core/Button.vue";
import Container from "@/components/core/Container.vue";
import Heading from "@/components/core/Heading.vue";
import PageAlert from "@/components/page-alert/PageAlert.vue";
import type { Location } from "~~/models/location";

const { leihbase } = useLeihbase();

useHead({
  title: `Admin | ${leihbase.name}`,
});

const { t } = useI18n({ useScope: "local" });
const { pb, isValid } = usePocketbase();

if (!isValid.value) {
  // Not authenticated, first login
  await navigateTo({
    path: "/login",
    query: {
      return: "/admin",
    },
  });
}

// Fetch locations the user has access to from
// the non-public location collection
const { data: locations } = await useAsyncData<Location[]>("locations", () =>
  pb.collection("location").getFullList({ sort: "name" })
);

if (!locations.value || locations.value.length === 0) {
  showError({
    statusCode: 404,
    statusMessage: "Page Not Found",
  });
} else if (
  locations.value &&
  locations.value.length === 1 &&
  locations.value[0]
) {
  await navigateTo({
    path: `/admin/${locations.value[0].slug}`,
  });
}
</script>

<style lang="scss" scoped>
@use "@/assets/styles/_breakpoints.scss";

.container {
  display: flex;
  flex-direction: column;
  min-height: 100%;
}
.grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: var(--fluid-spacing-8);
  margin-top: var(--fluid-spacing-8);
}
@media (min-width: breakpoints.$breakpoint-md) {
  .grid {
    grid-template-columns: 1fr 1fr;
  }
}
.locations .heading {
  margin-top: 0.5rem;
}
.locations ul {
  display: flex;
  flex-direction: column;
  list-style: none;
  gap: var(--fluid-spacing-4);
  margin: 0;
  padding: 0;
}
.locations ul strong {
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}
.locations ul a {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 0;
}
</style>

<i18n lang="json">
{
  "en": {
    "locations": "Locations",
    "active": "Active",
    "inactive": "Inactive"
  },
  "de": {
    "locations": "Standorte",
    "active": "Aktiv",
    "inactive": "Inaktiv"
  }
}
</i18n>
