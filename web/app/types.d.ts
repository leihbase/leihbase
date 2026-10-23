import type { HookResult } from "@nuxt/schema";
import type { Reservation } from "~~/models/reservation";

declare module "#app" {
  interface RuntimeNuxtHooks {
    "app:user:reservation:create": (reservation: Reservation) => HookResult;
  }
}

declare module "vue" {
  interface ComponentCustomProps {
    // Allow data-* attributes (e.g. `data-testid`) on all components, camelized by Vue
    [dataAttribute: `data${Capitalize<string>}`]: unknown;
  }
}
