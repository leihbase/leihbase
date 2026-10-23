<template>
  <Container width="lg" centered>
    <PageAlert />
    <section class="product">
      <div class="media-col">
        <ProductImage
          :src="
            product?.images && product?.images.length > 0
              ? `${config.public.pocketbase.clientBaseUrl}/api/files/products/${product.id}/${product.images[imageIndex]}${thumbs.lg}`
              : null
          "
          fallback="/images/fallback-product-image-1200x1200.png"
          class="main-image"
          object-fit="contain"
          loading="lazy"
        />
        <div
          v-if="product?.images && product.images.length > 1"
          class="thumbnails"
        >
          <button
            v-for="(image, index) in product.images.slice(0, 4)"
            type="button"
            :class="index === imageIndex ? 'active' : ''"
            @click="imageIndex = index"
          >
            <img
              :src="`${config.public.pocketbase.clientBaseUrl}/api/files/products/${product.id}/${image}${thumbs.sm}`"
            />
          </button>
        </div>
      </div>
      <div class="info-col">
        <header>
          <Breadcrumb :items="breadcrumb" />
        </header>

        <div class="info-header">
          <Heading is="h1" size="xl" data-testid="product-page-h1" cap>
            {{ product?.name }}
          </Heading>
          <AvailabilityBadge
            :available="product?.computedIsAvailable !== false"
          />
        </div>

        <div class="info-body lb-stack">
          <!-- Description -->
          <div
            v-if="product?.description"
            class="lb-richtext"
            v-html="product?.description"
          ></div>
          <!-- Deposit -->
          <KeyValue v-if="product?.deposit" :title="t('deposit')">
            {{ formatCurrency(product.deposit, locale) }}
          </KeyValue>
        </div>

        <div v-if="userStore.isManager" class="info-admin">
          <Heading is="h2" size="sm">
            {{ t("admin_notes") }}
            <Tooltip :html="t('admin_notes_tooltip')">
              <Lock />
            </Tooltip>
          </Heading>
          <span v-if="product?.notes" v-html="product?.notes" />
          <span v-else>
            <i>{{ t("admin_notes_none") }}</i>
          </span>
        </div>

        <ReservationsBox
          :title="t('reservations')"
          :reservations="reservations"
          class="upcoming-reservations"
        />

        <Button
          v-if="location?.reservation_system !== 'disabled'"
          size="lg"
          data-testid="reserve-button"
          @click.prevent="handleReserveButonClick"
        >
          {{ t("reserve_button") }}
        </Button>
      </div>
    </section>
  </Container>
</template>

<script lang="ts" setup>
import { formatCurrency } from "@@/lib/currency";
import { isToday } from "@@/lib/reservation";
import AvailabilityBadge from "@/components/AvailabilityBadge.vue";
import type { BreadcrumbList } from "@/components/core/Breadcrumb.model";
import Breadcrumb from "@/components/core/Breadcrumb.vue";
import Button from "@/components/core/Button.vue";
import Container from "@/components/core/Container.vue";
import Heading from "@/components/core/Heading.vue";
import KeyValue from "@/components/core/KeyValue.vue";
import Tooltip from "@/components/core/Tooltip.vue";
import PageAlert from "@/components/page-alert/PageAlert.vue";
import ProductImage from "@/components/ProductImage.vue";
import ReservationsBox from "@/components/ReservationsBox.vue";
import { getLocationBySlug } from "@/composables/location";
import { Lock } from "@iconoir/vue";
import type { RecordModel } from "pocketbase";

const { t, locale } = useI18n({ useScope: "local" });
const config = useRuntimeConfig();
const {
  product: { thumbs },
} = useAppConfig();
const { open: openReservationDialog } = useReservationDialog();

const nuxtApp = useNuxtApp();
const route = useRoute();
const userStore = useUserStore();

const imageIndex = ref(0);

const { location } = await getActiveLocationBySlug(
  route.params.location as string
);
if (!location.value) {
  throw createError({
    statusCode: 404,
  });
}

const { product } = await getProduct(route.params.product as string, {
  expand: "categories",
  query: {
    computeAvailability: true,
  },
});
if (!product.value || !product.value.active) {
  throw createError({
    statusCode: 404,
  });
}

const { reservations, refresh: refreshReservations } =
  await getFutureReservationsByProduct(product.value.id as string);

const breadcrumb = computed<BreadcrumbList[]>(() => [
  { label: location.value?.name, href: `/l/${location.value?.slug}` },
  (product.value?.expand?.categories ?? []).map((category: RecordModel) => ({
    label: category.name_de,
    href: `/l/${location.value?.slug}?category=${category.id}`,
  })),
]);

userStore.clearAuthenticationIntent();

// Refetch reservations when the user created a reservation
nuxtApp.hook("app:user:reservation:create", () => {
  refreshReservations();
});

// Open reservation dialog
async function handleReserveButonClick() {
  if (!location.value || !product.value) {
    console.error("Can't reserve, location or product not set");
    return;
  }
  openReservationDialog(location.value, product.value);
}

const { excerpt } = await getProductExcerpt(route.params.product as string);
useHead({
  title: `${product.value?.name} | ${location.value?.name}`,
  meta: [
    { name: "description", content: excerpt.value },
    { property: "og:title", content: product.value?.name },
    { property: "og:description", content: excerpt.value },
    {
      property: "og:image",
      content:
        product.value?.images && product.value?.images.length > 0
          ? `${config.public.pocketbase.clientBaseUrl}/api/files/products/${product.value.id}/${product.value.images[0]}${thumbs.lg}`
          : "",
    },
  ].filter((m) => !!m.content),
});
</script>

<style lang="scss" scoped>
@use "@/assets/styles/_breakpoints.scss";

section {
  margin-bottom: var(--fluid-spacing-8);
}
.header {
  max-width: var(--max-text-width);
  h1 {
    line-height: 1.15;
  }
}
.product {
  display: flex;
  flex-wrap: wrap;
  gap: var(--fluid-spacing-8);
  & > * {
    width: 100%;
  }
  .media-col {
    max-width: 500px;
    .main-image {
      margin-bottom: var(--fluid-spacing-4);
    }
    .thumbnails {
      width: 100%;
      display: grid;
      grid-template-columns: repeat(5, minmax(0, 1fr));
      gap: var(--fluid-spacing-4);
      button {
        border-radius: var(--border-radius);
        overflow: hidden;
        background-color: rgba(0, 0, 0, 0.15);
        border: 0;
        cursor: pointer;
        padding: 0;
        aspect-ratio: 1/1;
        display: flex;
        img {
          object-fit: cover;
          object-position: center;
          width: 100%;
        }
        &.active {
          box-shadow: 0 0 0 2px white;
          opacity: 0.8;
        }
        &:focus,
        &:active,
        &:hover {
          box-shadow: 0 0 0 2px var(--primary-color);
          outline: 0;
          border: 0;
        }
      }
    }
  }
  .info-col {
    flex-grow: 1;
    .info-header {
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      gap: var(--fluid-spacing-4);
      margin-bottom: var(--fluid-spacing-4);
      h1 {
        margin: 0;
        margin-bottom: -5px;
      }
      @media screen and (min-width: breakpoints.$breakpoint-md) {
        flex-direction: row;
        align-items: center;
        h1 {
          margin: 0;
        }
      }
    }
    h2,
    h3 {
      margin: 0;
    }
    .info-body {
      margin-bottom: var(--fluid-spacing-8);
    }
    .info-admin {
      background-color: var(--surface-info-color);
      padding: 1rem;
      border-radius: var(--border-radius);
      margin-bottom: var(--fluid-spacing-8);
      h2 {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 0.25rem;
        margin-bottom: 0.5rem;
        :deep(svg) {
          width: 1.2em;
          height: 1.2em;
        }
      }
      :deep(p) {
        margin-bottom: 0.5rem;
      }
      :deep(p:last-child) {
        margin: 0;
      }
    }
    .upcoming-reservations {
      margin-bottom: 2rem;
    }
  }
  @media screen and (min-width: breakpoints.$breakpoint-sm) {
    .media-col {
      width: calc(40% - (var(--fluid-spacing-8) / 2) - 1px);
    }
    .info-col {
      width: calc(60% - (var(--fluid-spacing-8) / 2) - 1px);
    }
  }
  @media screen and (min-width: breakpoints.$breakpoint-md) {
    .media-col,
    .info-col {
      width: calc(50% - (var(--fluid-spacing-8) / 2) - 1px);
    }
  }
}
</style>

<i18n lang="json">
{
  "en": {
    "deposit": "Deposit",
    "admin_notes": "Admin notes",
    "admin_notes_none": "None",
    "admin_notes_tooltip": "Only visible for admin users",
    "reservations": "Reservations",
    "reserve_button": "Reserve"
  },
  "de": {
    "deposit": "Pfand",
    "admin_notes": "Admin Notiz",
    "admin_notes_none": "Keine",
    "admin_notes_tooltip": "Nur sichtbar für Admin-Benutzer",
    "reservations": "Reservierungen",
    "reserve_button": "Reservieren"
  }
}
</i18n>
