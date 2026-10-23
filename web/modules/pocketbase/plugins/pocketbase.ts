import { useUserStore } from "@@/app/stores/user";
import PocketBase, { type AuthRecord } from "pocketbase";

export default defineNuxtPlugin(async () => {
  const config = useRuntimeConfig();

  const url = process.client
    ? config.public.pocketbase.clientBaseUrl
    : config.public.pocketbase.serverBaseUrl;

  const pb = new PocketBase(url);

  const cookie = useCookie<{ token: string; model: AuthRecord } | null>(
    "pb_auth",
    {
      path: "/",
      secure: config.public.ci ? false : true,
      sameSite: "lax",
      httpOnly: false, // change to "true" if you want only server-side access
      maxAge: 604800,
    }
  );

  // load the store data from the cookie value
  pb.authStore.save(cookie.value?.token ?? "", cookie.value?.model);

  // send back the default 'pb_auth' cookie to the client with the latest store state
  pb.authStore.onChange(() => {
    cookie.value = {
      token: pb.authStore.token,
      model: pb.authStore.record,
    };
  });

  try {
    // get an up-to-date auth store state by verifying and refreshing the loaded auth model (if any)
    pb.authStore.isValid && (await pb.collection("users").authRefresh());
  } catch (_) {
    // clear the auth store on failed refresh
    pb.authStore.clear();
  }

  return {
    provide: { pocketbase: pb },
  };
});
