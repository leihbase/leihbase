/// <reference path="../node_modules/@shoelace-style/shoelace/dist/types/vue/index.d.ts" />

/**
 * Type declarations for the custom elements used in templates, see
 * `isCustomElement` in nuxt.config.ts.
 */
import type { CalendarDateProps, CalendarMonthProps } from "cally";
import type { DefineComponent, HTMLAttributes } from "vue";

type CustomElement<Props = {}> = DefineComponent<
  Props &
    HTMLAttributes & {
      // data-* attributes, camelized by Vue
      [dataAttribute: `data${Capitalize<string>}`]: unknown;
    }
>;

declare module "vue" {
  interface GlobalComponents {
    "calendar-date": CustomElement<CalendarDateProps>;
    "calendar-month": CustomElement<CalendarMonthProps>;
    "cap-widget": CustomElement;
  }
}
