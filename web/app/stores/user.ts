import { defineStore } from "pinia";
import type { RecordModel } from "pocketbase";
import type { User } from "../../models/user";
import { PageAlertType } from "../components/page-alert/PageAlert.model";

interface State {
  name: string | null;
  role: "user" | "manager" | "admin" | null;
  hasInitialData: boolean;
  reservations: RecordModel[] | [];
  authenticationIntent: {
    intent: "reservation" | null;
    path: string | null;
  };
  banner: string | null;
}

export const useUserStore = defineStore("user", {
  state: (): State => ({
    name: null,
    hasInitialData: false,
    reservations: [],
    role: null,
    authenticationIntent: {
      intent: null,
      path: null,
    },
    banner: null,
  }),
  getters: {
    isAdmin(state) {
      return state.role === "admin";
    },
    isManager(state) {
      return state.role === "manager" || state.role === "admin";
    },
  },
  actions: {
    login({ user }: { user: User }) {
      // Store user data
      this.name = user.name;
      this.role = user.role;
      // Fetch other initial data
      return this.fetchInitialData();
    },
    logout() {
      this.name = null;
      this.reservations = [];
      this.clearAuthenticationIntent();
    },
    async fetchInitialData() {
      await Promise.all([this.fetchUserReservations()]);
      this.hasInitialData = true;
    },
    async fetchUserReservations() {
      const { pb } = usePocketbase();
      if (pb.authStore?.model?.id) {
        const reservations = await pb.collection("reservations").getFullList({
          filter: pb.filter("user = {:user}", {
            user: pb.authStore?.record?.id,
          }),
        });
        this.reservations = reservations;
      }
    },
    setAuthenticationIntent(intent: null | "reservation", path: string) {
      this.authenticationIntent.intent = intent;
      this.authenticationIntent.path = path;
    },
    clearAuthenticationIntent() {
      this.authenticationIntent.path = null;
    },
    showBanner(banner: PageAlertType) {
      this.banner = banner;
    },
    resetBanner() {
      this.banner = null;
    },
  },
});
