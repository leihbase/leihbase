import type { RecordModel } from "pocketbase";

export async function useLocation<T extends RecordModel = RecordModel>({
  slug,
}: {
  slug: string;
}) {
  const { pb } = usePocketbase();
  const { data: location } = await useAsyncData(`admin_location_${slug}`, () =>
    pb
      .collection("location")
      .getFirstListItem<T>(pb.filter("slug = {:slug}", { slug }))
  );
  return location;
}
