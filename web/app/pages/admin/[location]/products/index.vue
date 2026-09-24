<template>
  <Container width="lg" centered>
    <PageAlert class="banner" />

    <!-- Header -->
    <AdminNav v-if="location" :location="location" />
    <AdminHeader v-if="location" :title="t('title')" :location="location">
      <Button @click="handleNewProductClick">
        {{ t("new_product") }}
      </Button>
    </AdminHeader>

    <!-- Filters -->
    <FilterBar
      v-model:status="status"
      v-model:missing="missing"
      v-model:query="query"
      @input="handleFilterInput"
    />

    <!-- Number of results text / loading state -->
    <div v-if="location && products" class="results">
      <p>{{ products.length }} {{ t("results", products.length) }}</p>
      <LoadingSpinner size="sm" v-show="fetchStatus === 'pending'" />
    </div>

    <!-- Products -->
    <div v-if="location && products && products.length > 0" class="products">
      <ProductCard
        v-for="product in products"
        :key="product.id"
        :product="product"
        spacing="sm"
        class="product"
        @click="handleProductClick(product)"
      >
        <template #image-overlay>
          <Badge v-if="!product.active" variant="error">
            {{ t("inactive") }}
          </Badge>
        </template>
        <p class="description">
          {{ product.name }}
        </p>
      </ProductCard>
    </div>
  </Container>

  <ProductDrawer
    v-if="location"
    v-model:open="productDrawerOpen"
    :state="selectedProduct ? 'edit' : 'new'"
    :location="location"
    :product="selectedProduct"
    @update="handleProductUpdate"
  />
</template>

<script setup lang="ts">
import type { Product } from "@@/models/product";
import Badge from "@/components/core/Badge.vue";
import Button from "@/components/core/Button.vue";
import Container from "@/components/core/Container.vue";
import LoadingSpinner from "@/components/core/LoadingSpinner.vue";
import PageAlert from "@/components/page-alert/PageAlert.vue";
import ProductCard from "@/components/ProductCard.vue";
import AdminHeader from "../components/AdminHeader.vue";
import AdminNav from "../components/AdminNav.vue";
import FilterBar from "./components/FilterBar.vue";
import ProductDrawer from "./components/ProductDrawer.vue";

const { t } = useI18n({
  useScope: "local",
});
const route = useRoute();
const { pb } = usePocketbase();

const slug = route.params.location;

const location = await useLocation({
  slug: Array.isArray(slug) ? slug[0] : slug,
});

const status = ref("");
const missing = ref("");
const query = ref("");
const productDrawerOpen = ref(false);
const selectedProduct = ref<Product | null>(null);

if (!location.value || !location.value.id) {
  throw createError({
    statusCode: 404,
    statusMessage: "Page Not Found",
  });
}

useHead({
  title: `${t("title")} | ${location.value.name}`,
});

function handleFilterInput() {
  nextTick(() => {
    refresh();
  });
}

const {
  data: products,
  refresh,
  status: fetchStatus,
} = await useAsyncData<Product[]>(() => {
  const filters = ["location = {:location}"];
  const params: Record<string, any> = { location: location.value!.id };
  if (status.value) {
    filters.push("active = {:active}");
    params["active"] = status.value === "active" ? true : false;
  }
  if (missing.value && missing.value === "photo") {
    filters.push("images:length = 0");
  }
  if (missing.value && missing.value === "description") {
    filters.push("description = ''");
  }
  if (query.value) {
    filters.push("(name ~ {:query} || description ~ {:query})");
    params.query = query.value;
  }
  return pb.collection("products").getFullList({
    filter: pb.filter(filters.join(" && "), params),
    sort: "name",
  });
});

function handleNewProductClick() {
  selectedProduct.value = null;
  productDrawerOpen.value = true;
}

function handleProductClick(product: Product) {
  selectedProduct.value = product;
  productDrawerOpen.value = true;
}

function handleProductUpdate() {
  refresh();
}
</script>

<style lang="scss" scoped>
@use "@/assets/styles/breakpoints.scss";

.results {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: var(--fluid-spacing-4);
  p {
    margin: 0;
  }
}

.products {
  --columns: 2;
  display: grid;
  grid-template-columns: repeat(var(--columns), minmax(0, 1fr));
  gap: var(--fluid-spacing-4);
  margin-bottom: var(--fluid-spacing-4);

  .product {
    display: flex;
    color: var(--text-color);
    text-decoration: none;
    width: 100%;

    .description {
      display: block;
      font-weight: var(--font-weight-bold);
      font-size: calc(var(--font-size-sm) + 0.05rem);
      margin: 0;
      max-height: 2.3em;
      line-height: 1.15;
      overflow: hidden;
      display: -webkit-box;
      -webkit-box-orient: vertical;
      -webkit-line-clamp: 2;
      line-clamp: 2;
      hyphens: auto;
    }
  }

  @media screen and (min-width: breakpoints.$breakpoint-sm) {
    --columns: 3;
  }

  @media screen and (min-width: breakpoints.$breakpoint-md) {
    --columns: 4;
  }

  @media screen and (min-width: breakpoints.$breakpoint-lg) {
    --columns: 5;
  }

  @media screen and (min-width: breakpoints.$breakpoint-xl) {
    --columns: 6;
  }
}
</style>

<i18n lang="json">
{
  "en": {
    "title": "Products",
    "results": "result | results",
    "new_product": "New product"
  },
  "de": {
    "title": "Gegenständen",
    "results": "Ergebnis | Ergebnisse",
    "new_product": "Neues Gegenstand"
  }
}
</i18n>
