import { type Leihbase } from "../../models/leihbase";

export const useLeihbase = defineStore("leihbase", () => {
  const { pb } = usePocketbase();

  const { data: leihbases, refresh } = useAsyncData(
    "leihbase",
    () => pb.collection("leihbase").getFullList(),
    { immediate: false }
  );
  const leihbase = computed((): Leihbase => {
    const record = leihbases.value?.[0] as Leihbase;
    if (!record) {
      return record;
    }
    // Fix line breaks to be \n, to prevent hydration mismatch
    return { ...record, name: record.name?.replace(/\r\n?/g, "\n") };
  });

  return { leihbase, fetch: refresh };
});
