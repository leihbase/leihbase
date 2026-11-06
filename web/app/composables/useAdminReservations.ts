import { endOfUTCDate, startOfUTCDate } from "@@/lib/date";
import type { Location } from "@@/models/location";
import type { Reservation } from "@@/models/reservation";

export type AdminReservationsTab =
  | "overdue"
  | "today"
  | "ongoing"
  | "future"
  | "past";

const TABS: AdminReservationsTab[] = [
  "overdue",
  "today",
  "ongoing",
  "future",
  "past",
];

function getKey(tab: AdminReservationsTab) {
  return `admin_reservations_${tab}`;
}

/**
 * Loads the reservations of a tab of the admin overview. Tabs using the same
 * `tab` share their data, and are refreshed with `refreshAdminReservations`.
 */
export function useAdminReservations(
  location: Location,
  tab: AdminReservationsTab,
  // Day of the `today` tab
  date?: Ref<Date>
) {
  const { pb } = usePocketbase();
  const showCancelled = useShowCancelled();

  function getQuery() {
    const notCancelled = showCancelled.value ? "" : "&& cancelled = false";
    switch (tab) {
      case "overdue":
        // Reservations that are not cancelled,
        // and which are past their start date without being started,
        // or past their end date without being ended
        return {
          filter:
            "cancelled = false && ((start < @todayStart && started = false) || (end < @todayStart && ended = false))",
          sort: "end",
        };
      case "today":
        // Reservations starting or ending on the selected day
        return {
          filter: `((start >= {:dateStart} && start <= {:dateEnd}) || (end >= {:dateStart} && end <= {:dateEnd})) ${notCancelled}`,
          sort: "start",
        };
      case "ongoing":
        // Reservations where the start date is before today,
        // and the end date after today
        return {
          filter: `start < @todayStart && end > @todayEnd ${notCancelled}`,
          sort: "end",
        };
      case "future":
        // Reservations where the start date is later than today
        return { filter: `start > @todayEnd ${notCancelled}`, sort: "start" };
      case "past":
        // Reservations where the end is before today,
        // max 100
        return {
          filter: `end < @todayStart ${notCancelled}`,
          sort: "-end",
          limit: 100,
        };
    }
  }

  return useAsyncData<Reservation[]>(
    getKey(tab),
    async () => {
      const { filter, sort, limit } = getQuery();
      const options = {
        filter: pb.filter(`location = {:location} && ${filter}`, {
          location: location.id,
          ...(date && {
            dateStart: startOfUTCDate(date.value),
            dateEnd: endOfUTCDate(date.value),
          }),
        }),
        sort,
        expand: "product,user,user.borrow_agreement_acceptances_via_user",
        requestKey: getKey(tab),
      };
      return limit
        ? (
            await pb
              .collection("reservations")
              .getList<Reservation>(1, limit, options)
          ).items
        : await pb.collection("reservations").getFullList<Reservation>(options);
    },
    {
      lazy: true,
      // Overdue reservations never include cancelled ones
      watch: [
        ...(tab === "overdue" ? [] : [showCancelled]),
        ...(date ? [date] : []),
      ],
    }
  );
}

/**
 * Refreshes the reservations of all tabs of the admin overview
 */
export function refreshAdminReservations() {
  return refreshNuxtData(TABS.map(getKey));
}
