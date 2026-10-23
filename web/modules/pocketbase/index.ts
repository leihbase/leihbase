import {
  addImports,
  addPlugin,
  createResolver,
  defineNuxtModule,
} from "@nuxt/kit";

export default defineNuxtModule({
  meta: {
    // Usually the npm package name of your module
    name: "pocketbase",
    // The key in `nuxt.config` that holds your module options
    configKey: "pocketbase",
    // Compatibility constraints
    // compatibility: {
    // Semver version of supported nuxt versions
    //   nuxt: '^3.0.0'
    // }
  },
  // The function holding your module logic, it can be asynchronous
  setup() {
    const resolver = createResolver(import.meta.url);

    addPlugin(resolver.resolve("plugins/pocketbase"));

    addImports({
      name: "usePocketbase", // name of the composable to be used
      as: "usePocketbase",
      from: resolver.resolve("composables/usePocketbase"), // path of composable
    });
  },
});
