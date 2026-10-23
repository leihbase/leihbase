<template></template>

<script setup>
const route = useRoute();
const { pb } = usePocketbase();

const product = await pb.collection("products").getOne(route.params.id);

const location = await pb
  .collection("public_locations")
  .getOne(product.location);

await navigateTo({
  path: `/l/${location.slug}/p/${route.params.id}`,
  replace: true,
});
</script>
