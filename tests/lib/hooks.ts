import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";

const require = createRequire(import.meta.url);
const hooks = fileURLToPath(
  new URL("../../pocketbase/pb_hooks", import.meta.url)
);
// PocketBase sets __hooks, the hooks use it to require each other
(globalThis as { __hooks?: string }).__hooks = hooks;

/**
 * Requires a module of the PocketBase hooks outside PocketBase, e.g.
 * requireHook("lib/locale")
 */
export function requireHook<T>(path: string): T {
  return require(`${hooks}/${path}`) as T;
}
