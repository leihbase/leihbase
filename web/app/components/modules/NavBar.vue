<template>
  <header ref="header" :class="{ 'is-sticky': isSticky }">
    <div>
      <NuxtLink to="/" class="logo">
        {{ leihbase?.name }}
      </NuxtLink>
      <DropdownMenu class="dropdown">
        <DropdownMenuTrigger
          :as="Button"
          variant="primary"
          outline
          data-testid="menu-button"
        >
          <span class="sr-only">{{ t("menu") }}</span>
          <User class="icon" />
          <Menu class="icon" />
        </DropdownMenuTrigger>
        <DropdownMenuPopover ref="popover" class="popover">
          <ul>
            <li v-if="!isValid">
              <DropdownMenuItem
                :as="NuxtLink"
                data-testid="signup-link"
                to="/signup"
              >
                {{ t("sign_up") }}
              </DropdownMenuItem>
            </li>
            <li v-if="!isValid">
              <DropdownMenuItem
                :as="NuxtLink"
                data-testid="login-link"
                to="/login"
              >
                {{ t("login") }}
              </DropdownMenuItem>
            </li>
            <li v-if="isValid">
              <DropdownMenuItem
                :as="NuxtLink"
                data-testid="account-link"
                to="/profile"
              >
                {{ t("profile") }}
              </DropdownMenuItem>
            </li>
            <li v-if="isValid">
              <NuxtLink to="/reservations">
                {{ t("reservations") }}
              </NuxtLink>
            </li>
            <li v-if="isValid && userStore.isManager">
              <DropdownMenuItem :as="NuxtLink" to="/admin">
                {{ t("admin") }}
              </DropdownMenuItem>
            </li>
            <li v-if="isValid">
              <DropdownMenuItem as="button" @click.prevent="handleLogout">
                {{ t("logout") }}
              </DropdownMenuItem>
            </li>
          </ul>
        </DropdownMenuPopover>
      </DropdownMenu>
    </div>
  </header>
</template>

<script setup>
import { Menu, User } from "@iconoir/vue";
import { NuxtLink } from "#components";
import Button from "../core/Button.vue";
import DropdownMenu from "../core/dropdown-menu/DropdownMenu.vue";
import DropdownMenuItem from "../core/dropdown-menu/DropdownMenuItem.vue";
import DropdownMenuPopover from "../core/dropdown-menu/DropdownMenuPopover.vue";
import DropdownMenuTrigger from "../core/dropdown-menu/DropdownMenuTrigger.vue";
import { PageAlertType } from "../page-alert/PageAlert.model.js";

const { t } = useI18n({
  useScope: "local",
});
const { isValid, logout } = usePocketbase();
const userStore = useUserStore();
const { leihbase } = storeToRefs(useLeihbase());

const header = ref();

const { isSticky } = useIsSticky(header);

function handleLogout() {
  logout();
  userStore.logout();
  userStore.showBanner(PageAlertType.AFTER_LOGOUT);
  navigateTo("/");
}
</script>

<style lang="scss" scoped>
@use "@/assets/styles/breakpoints";

header {
  --header-text-color: color-mix(in srgb, var(--background-color) 50%, #fff);
  display: flex;
  justify-content: center;
  position: sticky;
  top: -1px;
  margin-top: var(--navbar-offset);
  z-index: 10;

  & > div {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0 1rem 0 1rem;
    height: var(--navbar-height);
    background-color: var(--primary-color);
    margin-left: var(--navbar-offset);
    margin-right: var(--navbar-offset);
    border-radius: 5px;
    max-width: 1400px;
    width: 100%;
    transition: border-radius 200ms;
    box-shadow: var(--shadow-sm);
    @media screen and (min-width: breakpoints.$breakpoint-sm) {
      padding: 0 1rem 0 1rem;
    }
  }
  &.is-sticky {
    & > div {
      border-radius: 0 0 5px 5px;
    }
  }

  .logo {
    color: var(--header-text-color);
    font-size: 1.4rem;
    font-weight: var(--font-weight-black);
    line-height: 1;
    text-decoration: none;
    // Show line breaks of the name, for example "Leihase\nDemo"
    white-space: pre-line;
  }

  nav {
    & > ul {
      list-style: none;
      margin: 0;
      padding: 0;
    }
  }

  .account {
    font-size: 2rem;
    a {
      line-height: 0;
      display: flex;
    }
  }

  .icon {
    display: inline-block;
    width: 1.5em;
    height: 1.5em;
  }
}

.dropdown {
  position: relative;
  .popover {
    position: absolute;
    top: 100%;
    background-color: white;
    border-radius: var(--border-radius);
    padding: 0.25rem 0;
    width: 10rem;
    right: 0.25rem;
    box-shadow: var(--shadow-sm);
    ul {
      display: flex;
      list-style: none;
      flex-direction: column;
      margin: 0;
      padding: 0;
      li {
        a,
        button {
          display: block;
          background: none;
          border: 0;
          text-align: left;
          color: var(--text-color);
          padding: 0.5rem 1rem;
          text-decoration: none;
          width: 100%;
          font-weight: var(--font-weight-semibold);
          cursor: pointer;
          &:hover,
          &:active {
            background-color: var(--secondary-color);
          }
        }
      }
    }
  }
}
</style>

<i18n lang="json">
{
  "en": {
    "menu": "Menu",
    "sign_up": "Sign up",
    "login": "Login",
    "profile": "Profile",
    "reservations": "Reservations",
    "admin": "Admin",
    "logout": "Logout"
  },
  "de": {
    "menu": "Menu",
    "sign_up": "Registrieren",
    "login": "Einloggen",
    "profile": "Profil",
    "reservations": "Reservierungen",
    "admin": "Admin",
    "logout": "Ausloggen"
  }
}
</i18n>
