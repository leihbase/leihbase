# Changelog

Release notes with screenshots are available on the
[GitHub releases page](https://github.com/leihbase/leihbase/releases).

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to
[Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [2.6.0] - 2026-10-15

### Added

- **Email template management:** configure and customize email templates per
  location in the admin interface. Templates support dynamic variables
  (reservation dates, product details, etc.) and include a live preview to test
  rendering before saving.

### Fixed

- Set correct page titles across all admin pages.
- Use more consistent spacing on the location overview page and product pages.
- Minor accessibility improvements to form controls.

### Changed

- Updated Node.js, pnpm, Nuxt and development tools to their latest versions.

## [2.5.0] - 2026-09-10

### Added

- **Reservation system setting per location:**
  - `disabled`: no reservations allowed
  - `single`: one reservation at a time per product
  - `multiple`: multiple reservations per product
- **Location settings page:** shown in the admin section.
- `reservation_start_limit` setting, limiting how many days in advance a
  reservation can be created.
- Show information about `reservation_start_limit` and `max_reservation_days` in
  the reservation dialog.
- Disable days in the reservation dialog date picker based on
  `reservation_start_limit` and `max_reservation_days`.

### Fixed

- Only show a product as available if it has no active and no upcoming
  reservation on the next two opening days.

## [2.4.0] - 2026-06-12

### Breaking

- The `privacy_policy` and `imprint` fields were removed from the main leihbase
  collection. Use the new `privacy_policy_link` field to point to an external
  privacy policy page, and the new `footer_links` field to configure links in
  the footer.

### Added

- **Reworked user permission system:** a user now has a role
  (`user | manager | admin`), and instead of a location having a list of users,
  a user now has a list of locations.
- **Multi-location homepage:** When multiple locations are configured, a
  homepage is enabled which displays a description and a list of locations.

### Fixed

- Closed dates are no longer selectable in the reservation dialog date picker.
- The product overview in the admin section now limits its product list to the
  active location.

## [2.3.0] - 2026-06-11

### Added

- **Cap support:** support for enabling a [Cap](https://trycap.dev) captcha in
  the signup form (see the required environment variables in the
  [Docker setup](https://github.com/leihbase/leihbase#docker)).

### Fixed

- Display the "show cancelled" toggle correctly on mobile viewports in the admin
  reservations overview.

## [2.2.0] - 2026-06-04

### Added

- Hide cancelled reservations in the admin reservation overview.
- Upgraded user profile, with the ability to change the password.

### Fixed

- Require email verification before creating a reservation.
- Move logout from the profile page to the user menu.

## [2.1.0] - 2026-02-28

### Changed

- Upgraded Nuxt from v3.20.2 to v4.3.1.

### Fixed

- Merge users with multiple accounts using the same email address in different
  casing.
- Make sign-up case-insensitive: signing up with the same email address in
  different casing is no longer allowed.
- The return reminder was not resent when a reservation was prolonged.

## [2.0.0] - 2026-02-13

### Breaking

- **Update to v1.7.1 first before updating to v2.0.0.** PocketBase has been
  updated to its latest version, which required snapshotting the migrations.
  Skipping v1.7.1 could result in a corrupted database or PocketBase migrations
  not running correctly.

### Added

- **Product management:** in the admin section
  - Adding new products
  - Editing products
  - Searching products by name
  - Filtering products by status
  - Filtering products on missing information (missing image or description)

### Changed

- Updated PocketBase from 0.22.18 to 0.36.0.
- The local development environment now runs using [mise](https://mise.jdx.dev/)
  instead of Docker.

### Fixed

- The reservation and product panels in the admin section can now be closed
  using a close button.

## [1.7.1] - 2025-12-05

### Fixed

- Correct the wording of the reservation confirmation email.
- Add the required `terms` field to the users collection, which stores whether
  the terms and conditions have been accepted.

## [1.7.0] - 2025-08-04

### Added

- **Docker images:** Docker images are now published automatically for every
  version (see the [README](https://github.com/leihbase/leihbase#docker) for
  setup instructions):
  - Web app:
    [lumocra/leihbase-webapp](https://hub.docker.com/r/lumocra/leihbase-webapp)
  - PocketBase:
    [lumocra/leihbase-pb](https://hub.docker.com/r/lumocra/leihbase-pb)
- **Navigation redesign:** redesigned navigation bar, which stays sticky when
  scrolling and makes room for more menu items.
- **Reservation overview**: overview page for logged-in users to view their
  upcoming and past reservations, including the ability to cancel a reservation.
- **Cancellation confirmation email:** when a reservation is cancelled from the
  reservation overview, the user receives a confirmation email and the location
  receives a notification.

### Fixed

- Display the default product deposit below the reservation deposit field in the
  admin section.

## [1.6.0] - 2025-03-07

### Added

- **Theming:** customize the look and feel of Leihbase with CSS variables
  configured in the PocketBase back-end:

  ```css
  --background-color: #ffdbc4;
  --primary-color: #0d79f2;
  --secondary-color: #ffede2;
  --text-color: #061134;
  --border-radius: 5px;
  ```

- **Maximum reservation period:** no reservation can be longer than the
  configured period.

### Fixed

- Prevent a user from reserving the same product a second time.
- Resend the return reminder when a reservation period is extended.

## [1.5.0] - 2024-12-28

### Added

- **Email reminders:** sent to users one day before the reservation start and
  end.
- **Overdue reservations:** new tab in the location admin reservation overview,
  showing reservations that have not been started (picked up) after the start
  date, or not ended (returned) after the end date.
- **Location statistics:** new admin page, showing basic statistics for a given
  time period.
- **[OpenGraph](https://ogp.me) meta tags:** so product pages show a preview
  (name, description and image) when shared on social media or in chat
  applications.

### Fixed

- Allow location users to create reservations starting on the same day another
  reservation for the same product ends.
- Prevent an error on reservation creation when the config JSON field is empty.
- Show a loading state in the admin overview while the content of a RecordPicker
  field is loading.

## [1.4.0] - 2024-09-27

### Added

- Reservation `started` and `ended` fields, to track whether a product has been
  picked up and returned.
- Mark reservations as cancelled in the admin reservation overview.
- [Configuration](https://github.com/leihbase/leihbase#config-field) to define
  whether reservations for the same product can end and start on the same day.

### Fixed

- Put buttons in a loading state after clicking, preventing unexpected errors
  (login, signup and reservation creation).

## [1.3.0] - 2024-08-19

### Added

- Admin interface to manage reservations per location.
- Admin menu item when a user is assigned to a location.
- Password reset page.

### Changed

- Use [Cally](https://wicky.nillia.ms/cally/) as date picker instead of
  [Pikaday](https://github.com/Pikaday/Pikaday), allowing more styling control.
- Updated PocketBase to v0.22.18.
- Updated npm dependencies to their latest minor versions.

### Fixed

- Improve the layout of the product page on small viewports.
- Refresh the page on logout to reset the app correctly.
- Make page titles more consistent.

## [1.2.0] - 2024-06-14

### Added

- Display a fallback image when no product image is defined.
- Show a confirmation after successfully signing up or logging in.
- Send the user a confirmation email after making a reservation.
- Playwright E2E testing setup, with first E2E tests of the sign-up flow.
- First setup of a location admin page.

### Changed

- Updated PocketBase to 0.22.13.

### Fixed

- Add the start and end of the reservation to the location's reservation
  confirmation email.

## [1.1.0] - 2024-05-26

### Added

- Limit reservation start/end date selection to days when the location is open.
- Include the user's message in the reservation confirmation email to the
  location.
- Sanitize HTML from the user's reservation message before saving.

### Changed

- Instead of one notification email address for all locations, each location now
  has a `notifications` field to define (multiple) email addresses that receive
  reservation notifications.
- The location collection is now admin-only; a `public_locations` view exposes
  publicly available data.

### Fixed

- Allow a reservation to start on the day another reservation ends.
- Products were rendered in reverse order client-side.
- Remember the search query while navigating.

## [1.0.0] - 2024-05-12

First Leihbase release! Still in development, but ready to be used in borrow
stores.

### Added

- Webshop front-end showing borrowable products.
- Category filtering.
- User sign-up and login.
- Product reservations.

[2.6.0]: https://github.com/leihbase/leihbase/compare/v2.5.0...v2.6.0
[2.5.0]: https://github.com/leihbase/leihbase/compare/v2.4.0...v2.5.0
[2.4.0]: https://github.com/leihbase/leihbase/compare/v2.3.0...v2.4.0
[2.3.0]: https://github.com/leihbase/leihbase/compare/v2.2.0...v2.3.0
[2.2.0]: https://github.com/leihbase/leihbase/compare/v2.1.0...v2.2.0
[2.1.0]: https://github.com/leihbase/leihbase/compare/v2.0.0...v2.1.0
[2.0.0]: https://github.com/leihbase/leihbase/compare/v1.7.1...v2.0.0
[1.7.1]: https://github.com/leihbase/leihbase/compare/v1.7.0...v1.7.1
[1.7.0]: https://github.com/leihbase/leihbase/compare/v1.6.0...v1.7.0
[1.6.0]: https://github.com/leihbase/leihbase/compare/v1.5.0...v1.6.0
[1.5.0]: https://github.com/leihbase/leihbase/compare/v1.4.0...v1.5.0
[1.4.0]: https://github.com/leihbase/leihbase/compare/v1.3.0...v1.4.0
[1.3.0]: https://github.com/leihbase/leihbase/compare/v1.2.0...v1.3.0
[1.2.0]: https://github.com/leihbase/leihbase/compare/v1.1.0...v1.2.0
[1.1.0]: https://github.com/leihbase/leihbase/compare/v1.0.0...v1.1.0
[1.0.0]: https://github.com/leihbase/leihbase/releases/tag/v1.0.0
