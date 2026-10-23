<template>
  <div>
    <header>
      <Heading is="h2" size="lg">{{ props.title || t("products") }}</Heading>
      <Input
        id="product-grid-input"
        :placeholder="`${t('search')}...`"
        v-model="query"
        @input="onSearchInput"
        @blur="onSearchBlur"
      />
    </header>
    <div class="filters">
      <ul class="categories" :class="{ 'show-all': showAllCategories }">
        <li v-for="category in categories" :key="category.id">
          <NuxtLink
            :href="
              categoryId === category.id
                ? getUrl({ category: null, page: null, query: null })
                : getUrl({ category: category.id, page: null, query: null })
            "
            :class="{ active: categoryId === category.id }"
          >
            {{ category.name_de }}
          </NuxtLink>
        </li>
      </ul>
      <div v-show="!showAllCategories" class="more-categories">
        <button @click="showAllCategories = true">
          {{ t("more_categories") }}
          <NavArrowDown />
        </button>
      </div>
    </div>
    <div v-if="products && products.length > 0" class="products">
      <template v-for="product in products" :key="product.id">
        <ProductCard
          :product="product"
          :to="`/l/${props.location.slug}/p/${product.id}`"
          class="product"
        />
      </template>
    </div>
    <div v-else>
      <p>{{ t("no_products_found") }} 🙃</p>
    </div>
    <section v-if="totalPages > 1" class="page-navigation">
      <Button
        v-if="currentPage > 1"
        :to="currentPage > 1 ? getUrl({ page: currentPage - 1 }) : undefined"
        class="page-button previous-page"
      >
        <ArrowLeft class="icon" />
        {{ t("previous_page") }}
      </Button>
      <Button
        :to="
          currentPage < totalPages
            ? getUrl({ page: currentPage + 1 })
            : undefined
        "
        class="page-button next-page"
      >
        {{ t("next_page") }}
        <ArrowRight class="icon" />
      </Button>
    </section>
  </div>
</template>

<script lang="ts" setup>
import { ArrowLeft, ArrowRight, NavArrowDown } from "@iconoir/vue";
import type { Location } from "~~/models/location";
import type { LocationQueryValue } from "vue-router";
import Button from "../core/Button.vue";
import Heading from "../core/Heading.vue";
import Input from "../core/Input.vue";
import ProductCard from "../ProductCard.vue";

const { t } = useI18n({
  useScope: "local",
});

const props = defineProps<{
  title?: string;
  location: Location;
}>();

const { pb } = usePocketbase();
const route = useRoute();

/**
 * Returns the first value of a query parameter, which can occur multiple times
 */
function getQueryValue(
  value: LocationQueryValue | LocationQueryValue[] | undefined
) {
  return (Array.isArray(value) ? value[0] : value) ?? undefined;
}

const categoryId = ref(getQueryValue(route.query.category));
const page = ref(getQueryValue(route.query.page));
const query = ref(getQueryValue(route.query.query));

// TODO: hide all categories by default
const showAllCategories = ref(true);

watch(
  () => route.query.category,
  (newId) => {
    categoryId.value = getQueryValue(newId);
    refreshProducts();
  }
);

watch(
  () => route.query.page,
  (newPage) => {
    page.value = getQueryValue(newPage);
    refreshProducts();
  }
);

watch(
  () => route.query.query,
  (newQuery) => {
    query.value = getQueryValue(newQuery);
    refreshProducts();
  }
);

const { data: categories } = await useAsyncData("categories", () =>
  pb.collection("categories").getFullList({ sort: "name_de" })
);

const { data: productsData, refresh: refreshProducts } = await useAsyncData(
  "products",
  () =>
    pb.collection("products").getList(parseInt(page.value ?? "0"), 24, {
      filter: getFilter(),
      sort: "name",
      query: {
        computeAvailability: true,
      },
    })
);

const products = computed(() => {
  return productsData.value?.items;
});
const currentPage = computed(() => productsData.value?.page ?? 1);
const totalPages = computed(() => productsData.value?.totalPages ?? 0);

function onSearchInput() {
  navigateTo(getUrl({ page: null, query: null }));
  refreshProducts();
}

function onSearchBlur() {
  navigateTo(getUrl({ query: query.value || null, page: null }));
}

function getFilter() {
  const filter = ["active = true"];
  const args: Record<string, string> = {};
  if (props.location && props.location.id) {
    filter.push("location = {:location}");
    args.location = props.location.id;
  }
  if (categoryId.value) {
    filter.push("categories ~ {:category}");
    args.category = categoryId.value;
  }
  if (query.value && query.value.length > 2) {
    filter.push("(name ~ {:query} || description ~ {:query})");
    args.query = query.value;
  }
  return pb.filter(filter.join(" && "), args);
}

function getUrl(overwrites: Record<string, string | number | null>) {
  const url = new URL(`https://example.com/l/${props.location.slug}`);
  if (categoryId.value) {
    url.searchParams.set("category", categoryId.value);
  }
  if (page.value && parseInt(page.value) > 1) {
    url.searchParams.set("page", page.value);
  }
  if (query.value) {
    url.searchParams.set("query", query.value);
  }
  Object.entries(overwrites).forEach(([key, value]) => {
    if (value !== null) {
      url.searchParams.set(key, String(value));
    } else {
      url.searchParams.delete(key);
    }
  });
  return url.pathname + url.search;
}
</script>

<style lang="scss" scoped>
@use "@/assets/styles/_breakpoints.scss";

header {
  display: grid;
  grid-template-columns: repeat(1, minmax(0, 1fr));
  align-items: center;
  margin-bottom: var(--fluid-spacing-4);
  gap: var(--fluid-spacing-4);
  @media screen and (min-width: breakpoints.$breakpoint-sm) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}
.filters {
  margin-bottom: var(--fluid-spacing-4);
  position: relative;
}
.more-categories {
  position: absolute;
  right: 0;
  top: 0;
  display: flex;
  align-items: stretch;
  &::before {
    content: "";
    display: block;
    width: 3rem;
    background: linear-gradient(
      to right,
      color-mix(in srgb, var(--background-color) 0%, transparent) 0%,
      var(--background-color) 66%
    );
  }
  button {
    background-color: var(--secondary-color);
    border: 2px solid transparent;
    color: var(--button-secondary-text-color);
    border-radius: var(--border-radius);
    padding: 0.333rem 0.666rem;
    display: flex;
    align-items: center;
    cursor: pointer;
    &:hover {
      border: 2px solid var(--primary-color);
    }
    svg {
      stroke-width: 1;
    }
  }
}
.categories {
  list-style: none;
  display: flex;
  padding: 0;
  gap: 0.333rem;
  margin: 0;
  overflow-x: hidden;
  &.show-all {
    overflow-x: visible;
    flex-wrap: wrap;
  }
  a {
    width: max-content;
    display: inline-block;
    background-color: var(--secondary-color);
    border: 2px solid transparent;
    color: var(--button-secondary-text-color);
    text-decoration: none;
    padding: 0.333rem 0.666rem;
    border-radius: var(--border-radius);
    &:hover {
      border: 2px solid var(--primary-color);
    }
    &.active {
      background-color: var(--primary-color);
      color: white;
    }
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
  }

  @media screen and (min-width: breakpoints.$breakpoint-sm) {
    --columns: 3;
  }
  @media screen and (min-width: breakpoints.$breakpoint-md) {
    --columns: 4;
  }
}
.page-navigation {
  display: flex;
  justify-content: space-between;
  .page-button {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }
  .page-button:not([href]) {
    opacity: 0.5;
    pointer-events: none;
  }
  .next-page {
    margin-left: auto;
  }
}
.icon {
  display: inline;
  width: 1em;
  height: 1em;
}
</style>

<i18n lang="json">
{
  "en": {
    "products": "Products",
    "search": "Search",
    "more_categories": "More categories",
    "previous_page": "Previous page",
    "next_page": "Next page",
    "no_products_found": "No products found"
  },
  "de": {
    "products": "Gegenstände",
    "search": "Suchen",
    "more_categories": "Mehr kategorien",
    "previous_page": "Vorherige Seite",
    "next_page": "Nächste Seite",
    "no_products_found": "Keine Produkte gefunden"
  }
}
</i18n>
